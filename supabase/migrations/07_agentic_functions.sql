-- ==========================================
-- TARGET FUNCTIONS
-- ==========================================

-- Function to get targets with pagination and filtering
CREATE OR REPLACE FUNCTION get_targets_paginated(
    p_limit INTEGER DEFAULT 250,
    p_offset INTEGER DEFAULT 0,
    p_order_by TEXT DEFAULT 'name',
    p_order_direction TEXT DEFAULT 'ASC'
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_count INTEGER;
    valid_order_by TEXT;
    valid_direction TEXT;
BEGIN
    -- Validate order_by parameter
    valid_order_by := CASE 
        WHEN p_order_by IN ('name', 'created_at', 'updated_at', 'submission_type') 
        THEN p_order_by 
        ELSE 'name' 
    END;
    
    -- Validate direction parameter
    valid_direction := CASE 
        WHEN UPPER(p_order_direction) IN ('ASC', 'DESC') 
        THEN UPPER(p_order_direction) 
        ELSE 'ASC' 
    END;

    -- Get total count for pagination metadata
    SELECT COUNT(*) INTO total_count FROM targets;

    -- Get paginated results with dynamic ordering
    EXECUTE format('
        SELECT jsonb_build_object(
            ''targets'', jsonb_agg(to_jsonb(t.*) ORDER BY %I %s),
            ''totalCount'', %L,
            ''hasMore'', %L,
            ''currentPage'', %L,
            ''limit'', %L
        )
        FROM (
            SELECT * FROM targets 
            ORDER BY %I %s 
            LIMIT %L OFFSET %L
        ) t',
        valid_order_by, valid_direction,
        total_count,
        (p_offset + p_limit) < total_count,
        (p_offset / p_limit) + 1,
        p_limit,
        valid_order_by, valid_direction,
        p_limit, p_offset
    ) INTO result;

    RETURN COALESCE(result, jsonb_build_object(
        'targets', '[]'::jsonb,
        'totalCount', 0,
        'hasMore', false,
        'currentPage', 1,
        'limit', p_limit
    ));
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_targets_paginated(INTEGER, INTEGER, TEXT, TEXT) TO authenticated;

-- Function to get paginated targets with filtering and sorting
DROP FUNCTION IF EXISTS get_targets_simple(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_targets_simple(
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
    
    -- Optimized search with normalized input
    IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
        normalized_search := lower(trim(p_search));
        where_conditions := array_append(where_conditions, format('(
            lower(t.name) LIKE %L OR
            lower(COALESCE(t.notes, '''')) LIKE %L OR
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
    
    -- Array filter conditions - these use GIN indexes efficiently
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

    IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('t.tags && %L', p_tags));
    END IF;

    -- Submission filter conditions
    IF p_startup_id IS NOT NULL AND p_submission_filter IS NOT NULL THEN
        IF p_submission_filter = 'hide_submitted' THEN
            where_conditions := array_append(where_conditions, format('NOT EXISTS (
                SELECT 1 FROM submissions s 
                WHERE s.target_id = t.id AND s.startup_id = %L
            )', p_startup_id));
        ELSIF p_submission_filter = 'only_submitted' THEN
            where_conditions := array_append(where_conditions, format('EXISTS (
                SELECT 1 FROM submissions s 
                WHERE s.target_id = t.id AND s.startup_id = %L
            )', p_startup_id));
        END IF;
        -- For 'all', no additional condition is needed
    END IF;

    -- Build WHERE clause
    IF array_length(where_conditions, 1) > 0 THEN
        base_query := ' WHERE ' || array_to_string(where_conditions, ' AND ');
    ELSE
        base_query := '';
    END IF;

    -- Build sort clause
    sort_clause := CASE
        WHEN p_sort_by = 'name' THEN 'name'
        WHEN p_sort_by = 'type' THEN 'submission_type, name'
        WHEN p_sort_by = 'focus' THEN 'array_to_string(stage_focus, '',''), name'
        WHEN p_sort_by = 'industry' THEN 'array_to_string(industry_focus, '',''), name'
        WHEN p_sort_by = 'region' THEN 'array_to_string(region_focus, '',''), name'
        WHEN p_sort_by = 'requirements' THEN 'array_length(required_documents, 1), name'
        ELSE 'name'
    END;

    -- Single query with CTE for better performance
    final_query := format('
        WITH filtered_targets AS (
            SELECT t.* FROM targets t%s
        ),
        count_data AS (
            SELECT COUNT(*) as total_count FROM filtered_targets
        ),
        paginated_data AS (
            SELECT * FROM filtered_targets
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
GRANT EXECUTE ON FUNCTION get_targets_simple(INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], UUID, TEXT) TO authenticated;

-- ==========================================
-- PERFORMANCE OPTIMIZATIONS
-- ==========================================

-- Add composite index for efficient pagination with sorting
CREATE INDEX IF NOT EXISTS idx_targets_name_id ON targets(name, id);
CREATE INDEX IF NOT EXISTS idx_targets_created_at_id ON targets(created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_targets_updated_at_id ON targets(updated_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_targets_submission_type_name ON targets(submission_type, name);

-- Update table statistics for better query planning
ANALYZE targets;

-- ==========================================
-- OPTIMIZED PERFORMANCE INDEXES
-- ==========================================

-- Drop old inefficient indexes
DROP INDEX IF EXISTS idx_targets_name_search;
DROP INDEX IF EXISTS idx_targets_notes_search;
DROP INDEX IF EXISTS idx_targets_name_ilike;
DROP INDEX IF EXISTS idx_targets_notes_ilike;

-- Create optimized indexes for search - avoiding problematic functional indexes on enum types
CREATE INDEX IF NOT EXISTS idx_targets_name_lower ON targets(lower(name));
CREATE INDEX IF NOT EXISTS idx_targets_notes_lower ON targets(lower(notes)) WHERE notes IS NOT NULL;

-- For enum types, we'll use regular indexes and handle case-insensitive search in queries
CREATE INDEX IF NOT EXISTS idx_targets_submission_type ON targets(submission_type);

-- Ensure we have proper GIN indexes for array operations
CREATE INDEX IF NOT EXISTS idx_targets_stage_focus_gin ON targets USING GIN(stage_focus) WHERE stage_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_industry_focus_gin ON targets USING GIN(industry_focus) WHERE industry_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_region_focus_gin ON targets USING GIN(region_focus) WHERE region_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_required_documents_gin ON targets USING GIN(required_documents) WHERE required_documents IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_visibility_level ON targets(visibility_level);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_targets_name_search_gin ON targets USING gin(to_tsvector('english', name));

-- Composite indexes for common sort patterns
CREATE INDEX IF NOT EXISTS idx_targets_name_asc ON targets(name ASC, id);
CREATE INDEX IF NOT EXISTS idx_targets_name_desc ON targets(name DESC, id);
CREATE INDEX IF NOT EXISTS idx_targets_type_name ON targets(submission_type, name);

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_targets_active ON targets(name) WHERE submission_type IS NOT NULL;

-- Update table statistics for better query planning
ANALYZE targets;

-- ==========================================
-- SUBMISSION WIDGET FUNCTIONS
-- ==========================================

-- Function to get recent submissions for the dashboard widget
CREATE OR REPLACE FUNCTION fetch_recent_submissions(
    p_startup_id UUID,
    p_limit INTEGER DEFAULT 3
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH all_submissions AS (
        SELECT
            s.id AS submission_id,
            t.name AS submitted_to_name,
            'Fund' AS submitted_to_type,
            s.submission_date AS submitted_at,
            s.status,
            t.website as website_url,
            t.id AS entity_id
        FROM submissions s
        JOIN targets t ON s.target_id = t.id
        WHERE s.startup_id = p_startup_id
        
        UNION ALL
        
        SELECT
            asub.id AS submission_id,
            a.first_name || ' ' || a.last_name AS submitted_to_name,
            'Angel' AS submitted_to_type,
            asub.submission_date AS submitted_at,
            asub.status,
            a.linkedin as website_url,
            a.id AS entity_id
        FROM angel_submissions asub
        JOIN angels a ON asub.angel_id = a.id
        WHERE asub.startup_id = p_startup_id

        UNION ALL

        SELECT
            accs.id AS submission_id,
            acc.name AS submitted_to_name,
            'Accelerator' AS submitted_to_type,
            accs.submission_date AS submitted_at,
            accs.status,
            acc.website as website_url,
            acc.id AS entity_id
        FROM accelerator_submissions accs
        JOIN accelerators acc ON accs.accelerator_id = acc.id
        WHERE accs.startup_id = p_startup_id
    )
    SELECT jsonb_agg(sub.*)
    INTO result
    FROM (
        SELECT *
        FROM all_submissions
        ORDER BY submitted_at DESC
        LIMIT p_limit
    ) sub;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Function to get daily submission counts for the activity grid
CREATE OR REPLACE FUNCTION fetch_daily_run_grid_data(
    p_startup_id UUID,
    p_days INTEGER DEFAULT 270
)
RETURNS TABLE(date TEXT, run_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH all_submission_dates AS (
        SELECT submission_date::date AS day FROM submissions WHERE startup_id = p_startup_id
        UNION ALL
        SELECT submission_date::date AS day FROM angel_submissions WHERE startup_id = p_startup_id
        UNION ALL
        SELECT submission_date::date AS day FROM accelerator_submissions WHERE startup_id = p_startup_id
    )
    SELECT 
        d.day::TEXT AS date,
        COUNT(asd.day) AS run_count
    FROM 
        generate_series(
            (CURRENT_DATE - (p_days - 1) * INTERVAL '1 day'),
            CURRENT_DATE,
            '1 day'::interval
        ) AS d(day)
    LEFT JOIN 
        all_submission_dates asd ON d.day = asd.day
    GROUP BY 
        d.day
    ORDER BY 
        d.day;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;


GRANT EXECUTE ON FUNCTION fetch_recent_submissions(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fetch_daily_run_grid_data(UUID, INTEGER) TO authenticated;