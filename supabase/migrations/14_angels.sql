-- Function to get paginated angels with filtering and sorting
CREATE OR REPLACE FUNCTION get_angels_simple(
    p_limit INTEGER DEFAULT 200,
    p_offset INTEGER DEFAULT 0,
    p_sort_by TEXT DEFAULT 'last_name',
    p_sort_direction TEXT DEFAULT 'asc',
    p_search TEXT DEFAULT NULL,
    p_submission_types TEXT[] DEFAULT NULL,
    p_stage_focus TEXT[] DEFAULT NULL,
    p_industry_focus TEXT[] DEFAULT NULL,
    p_region_focus TEXT[] DEFAULT NULL,
    p_check_sizes TEXT[] DEFAULT NULL,
    p_investment_approaches TEXT[] DEFAULT NULL,
    p_startup_id UUID DEFAULT NULL,
    p_submission_filter TEXT DEFAULT 'all'
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    base_query TEXT;
    where_conditions TEXT[] := ARRAY[]::TEXT[];
    sort_clause TEXT;
    final_query TEXT;
    normalized_search TEXT;
BEGIN
    -- Build WHERE conditions
    IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
        normalized_search := lower(trim(p_search));
        where_conditions := array_append(where_conditions, format('(
            lower(a.first_name || '' '' || a.last_name) LIKE %L OR
            lower(COALESCE(a.bio, '''')) LIKE %L OR
            lower(COALESCE(a.location, '''')) LIKE %L OR
            EXISTS (SELECT 1 FROM unnest(a.domain_expertise) AS de WHERE lower(de::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(a.stage_focus) AS s WHERE lower(s::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(a.industry_focus) AS i WHERE lower(i::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(a.region_focus) AS r WHERE lower(r::text) LIKE %L)
        )',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%'));
    END IF;

    IF p_submission_types IS NOT NULL AND array_length(p_submission_types, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('a.submission_type::text = ANY(%L)', p_submission_types));
    END IF;
    
    IF p_stage_focus IS NOT NULL AND array_length(p_stage_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('a.stage_focus && %L', p_stage_focus));
    END IF;
    
    IF p_industry_focus IS NOT NULL AND array_length(p_industry_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('a.industry_focus && %L', p_industry_focus));
    END IF;
    
    IF p_region_focus IS NOT NULL AND array_length(p_region_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('a.region_focus && %L', p_region_focus));
    END IF;

    IF p_check_sizes IS NOT NULL AND array_length(p_check_sizes, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('a.check_size::text = ANY(%L)', p_check_sizes));
    END IF;

    IF p_investment_approaches IS NOT NULL AND array_length(p_investment_approaches, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('a.investment_approach::text = ANY(%L)', p_investment_approaches));
    END IF;

    -- Submission filter conditions
    IF p_startup_id IS NOT NULL AND p_submission_filter IS NOT NULL THEN
        IF p_submission_filter = 'hide_submitted' THEN
            where_conditions := array_append(where_conditions, format('NOT EXISTS (
                SELECT 1 FROM angel_submissions s 
                WHERE s.angel_id = a.id AND s.startup_id = %L
            )', p_startup_id));
        ELSIF p_submission_filter = 'only_submitted' THEN
            where_conditions := array_append(where_conditions, format('EXISTS (
                SELECT 1 FROM angel_submissions s 
                WHERE s.angel_id = a.id AND s.startup_id = %L
            )', p_startup_id));
        END IF;
    END IF;

    -- Always filter for active angels
    where_conditions := array_append(where_conditions, 'a.is_active = TRUE');

    -- Build WHERE clause
    IF array_length(where_conditions, 1) > 0 THEN
        base_query := ' WHERE ' || array_to_string(where_conditions, ' AND ');
    ELSE
        base_query := '';
    END IF;

    -- Build sort clause
    sort_clause := CASE
        WHEN p_sort_by = 'name' THEN 'last_name, first_name'
        WHEN p_sort_by = 'check_size' THEN 'check_size_sort_order(a.check_size), last_name'
        WHEN p_sort_by = 'stage' THEN 'array_to_string(stage_focus, '',''), last_name'
        WHEN p_sort_by = 'industry' THEN 'array_to_string(industry_focus, '',''), last_name'
        WHEN p_sort_by = 'region' THEN 'array_to_string(region_focus, '',''), last_name'
        ELSE 'last_name, first_name'
    END;

    -- Single query with CTE for better performance
    final_query := format('
        WITH filtered_angels AS (
            SELECT a.*, (a.first_name || '' '' || a.last_name) as name FROM angels a%s
        ),
        count_data AS (
            SELECT COUNT(*) as total_count FROM filtered_angels
        ),
        paginated_data AS (
            SELECT 
                fa.*,
                s.status as submission_status,
                s.queue_position,
                s.submission_date,
                s.agent_notes,
                s.updated_at as submission_updated_at
            FROM filtered_angels fa
            LEFT JOIN angel_submissions s ON fa.id = s.angel_id AND s.startup_id = %L
            ORDER BY %s %s
            LIMIT %L OFFSET %L
        )
        SELECT jsonb_build_object(
            ''data'', COALESCE((SELECT jsonb_agg(to_jsonb(p.*)) FROM paginated_data p), ''[]''::jsonb),
            ''totalCount'', (SELECT total_count FROM count_data),
            ''hasMore'', (SELECT total_count FROM count_data) > %L,
            ''currentPage'', %L,
            ''limit'', %L,
            ''offset'', %L
        )',
        base_query,
        p_startup_id,
        sort_clause,
        CASE WHEN upper(p_sort_direction) = 'DESC' THEN 'DESC NULLS LAST' ELSE 'ASC NULLS FIRST' END,
        p_limit,
        p_offset,
        p_offset + p_limit,
        CASE WHEN p_limit > 0 THEN (p_offset / p_limit) + 1 ELSE 1 END,
        p_limit,
        p_offset
    );

    EXECUTE final_query INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_angels_simple(INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], UUID, TEXT) TO authenticated;

-- Function to get total submissions count for a startup to angels
CREATE OR REPLACE FUNCTION get_total_angel_applications_count(p_startup_id UUID)
RETURNS JSONB AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM angel_submissions
    WHERE startup_id = p_startup_id;

    RETURN jsonb_build_object('total_applications', total_count);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_total_angel_applications_count(UUID) TO authenticated;

-- Function to correctly sort check_size_range enum
CREATE OR REPLACE FUNCTION check_size_sort_order(check_size_val check_size_range)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE check_size_val
        WHEN '1K-10K' THEN 1
        WHEN '10K-25K' THEN 2
        WHEN '25K-50K' THEN 3
        WHEN '50K-100K' THEN 4
        WHEN '100K-250K' THEN 5
        WHEN '250K-500K' THEN 6
        WHEN '500K-1M' THEN 7
        WHEN '1M+' THEN 8
        ELSE 99
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY INVOKER SET search_path = public;

GRANT EXECUTE ON FUNCTION check_size_sort_order(check_size_range) TO authenticated;

-- Add indexes for angel table for performance
CREATE INDEX IF NOT EXISTS idx_angels_name_lower ON angels(lower(first_name), lower(last_name));
CREATE INDEX IF NOT EXISTS idx_angels_bio_lower ON angels(lower(bio)) WHERE bio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angels_location_lower ON angels(lower(location)) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angels_domain_expertise_gin ON angels USING GIN(domain_expertise) WHERE domain_expertise IS NOT NULL;

-- Policies
ALTER TABLE public.angels ENABLE ROW LEVEL SECURITY;

ANALYZE angels;
