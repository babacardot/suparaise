-- ==========================================
-- ACCELERATOR FUNCTIONS
-- ==========================================

-- Function to get accelerators with pagination, filtering, and sorting
CREATE OR REPLACE FUNCTION get_accelerators_simple(
    p_limit INTEGER DEFAULT 200,
    p_offset INTEGER DEFAULT 0,
    p_sort_by TEXT DEFAULT 'name',
    p_sort_direction TEXT DEFAULT 'asc',
    p_search TEXT DEFAULT NULL,
    p_submission_types TEXT[] DEFAULT NULL,
    p_stage_focus TEXT[] DEFAULT NULL,
    p_industry_focus TEXT[] DEFAULT NULL,
    p_region_focus TEXT[] DEFAULT NULL,
    p_required_documents TEXT[] DEFAULT NULL,
    p_program_types TEXT[] DEFAULT NULL,
    p_equity_ranges TEXT[] DEFAULT NULL,
    p_funding_ranges TEXT[] DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
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
    -- Build WHERE conditions efficiently
    IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
        normalized_search := lower(trim(p_search));
        where_conditions := array_append(where_conditions, format('(
            lower(t.name) LIKE %L OR
            lower(COALESCE(t.notes, '''')) LIKE %L OR
            lower(COALESCE(t.location, '''')) LIKE %L OR
            EXISTS (SELECT 1 FROM unnest(t.stage_focus) AS s WHERE lower(s::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(t.industry_focus) AS i WHERE lower(i::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(t.region_focus) AS r WHERE lower(r::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(t.tags) AS ta WHERE lower(ta::text) LIKE %L) OR
            lower(t.submission_type::text) LIKE %L
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
        where_conditions := array_append(where_conditions, format('t.submission_type = ANY(%L)', p_submission_types));
    END IF;

    IF p_stage_focus IS NOT NULL AND array_length(p_stage_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.stage_focus && %L', p_stage_focus));
    END IF;

    IF p_industry_focus IS NOT NULL AND array_length(p_industry_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.industry_focus && %L', p_industry_focus));
    END IF;

    IF p_region_focus IS NOT NULL AND array_length(p_region_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.region_focus && %L', p_region_focus));
    END IF;

    IF p_required_documents IS NOT NULL AND array_length(p_required_documents, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.required_documents && %L', p_required_documents));
    END IF;

    IF p_program_types IS NOT NULL AND array_length(p_program_types, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.program_type = ANY(%L)', p_program_types));
    END IF;

    IF p_equity_ranges IS NOT NULL AND array_length(p_equity_ranges, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.equity_taken = ANY(%L)', p_equity_ranges));
    END IF;

    IF p_funding_ranges IS NOT NULL AND array_length(p_funding_ranges, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.funding_provided = ANY(%L)', p_funding_ranges));
    END IF;

    IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.tags && %L', p_tags));
    END IF;

    -- Submission filter conditions
    IF p_startup_id IS NOT NULL AND p_submission_filter IS NOT NULL THEN
        IF p_submission_filter = 'hide_submitted' THEN
            where_conditions := array_append(where_conditions, format('NOT EXISTS (
                SELECT 1 FROM accelerator_submissions s
                WHERE s.accelerator_id = t.id AND s.startup_id = %L
            )', p_startup_id));
        ELSIF p_submission_filter = 'only_submitted' THEN
            where_conditions := array_append(where_conditions, format('EXISTS (
                SELECT 1 FROM accelerator_submissions s
                WHERE s.accelerator_id = t.id AND s.startup_id = %L
            )', p_startup_id));
        END IF;
    END IF;

    -- Base query construction
    base_query := ' FROM accelerators t';
    IF array_length(where_conditions, 1) > 0 THEN
        base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;

    -- Sort clause
    sort_clause := CASE
        WHEN p_sort_by = 'name' THEN 'name'
        WHEN p_sort_by = 'type' THEN 'submission_type, name'
        WHEN p_sort_by = 'focus' THEN 'array_to_string(stage_focus, '',''), name'
        WHEN p_sort_by = 'industry' THEN 'array_to_string(industry_focus, '',''), name'
        WHEN p_sort_by = 'region' THEN 'array_to_string(region_focus, '',''), name'
        WHEN p_sort_by = 'requirements' THEN 'array_length(required_documents, 1), name'
        WHEN p_sort_by = 'program_type' THEN 'program_type, name'
        WHEN p_sort_by = 'equity_taken' THEN 'equity_taken, name'
        WHEN p_sort_by = 'funding_provided' THEN 'funding_provided, name'
        ELSE 'name'
    END;
    
    -- Final query assembly
    final_query := format('
        WITH filtered_accelerators AS (
            SELECT t.* %s
        ),
        count_data AS (
            SELECT COUNT(*) as total_count FROM filtered_accelerators
        ),
        paginated_data AS (
            SELECT * FROM filtered_accelerators
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
        sort_clause,
        CASE WHEN upper(p_sort_direction) = 'DESC' THEN 'DESC' ELSE 'ASC' END,
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
GRANT EXECUTE ON FUNCTION get_accelerators_simple(INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], UUID, TEXT) TO authenticated; 