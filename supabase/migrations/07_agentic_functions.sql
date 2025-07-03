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
        WHEN p_order_by IN ('name', 'created_at', 'updated_at', 'submission_type', 'form_complexity') 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_targets_paginated(INTEGER, INTEGER, TEXT, TEXT) TO authenticated;

-- Function to get paginated targets with filtering and sorting
DROP FUNCTION IF EXISTS get_targets_simple(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_targets_simple(
    p_limit INTEGER DEFAULT 200,
    p_offset INTEGER DEFAULT 0,
    p_sort_by TEXT DEFAULT 'name',
    p_sort_direction TEXT DEFAULT 'asc',
    p_submission_types TEXT[] DEFAULT NULL,
    p_stage_focus TEXT[] DEFAULT NULL,
    p_industry_focus TEXT[] DEFAULT NULL,
    p_region_focus TEXT[] DEFAULT NULL,
    p_form_complexity TEXT[] DEFAULT NULL,
    p_required_documents TEXT[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_count INTEGER;
    query_body TEXT;
    query_count TEXT;
    query_final TEXT;
    where_clauses TEXT[] := ARRAY[]::TEXT[];
    valid_sort_by TEXT;
    valid_sort_direction TEXT;
    sort_expression TEXT;
BEGIN
    -- Validate and build WHERE clauses
    IF p_submission_types IS NOT NULL AND array_length(p_submission_types, 1) > 0 THEN
        where_clauses := array_append(where_clauses, format('submission_type = ANY(%L)', p_submission_types));
    END IF;
    IF p_stage_focus IS NOT NULL AND array_length(p_stage_focus, 1) > 0 THEN
        where_clauses := array_append(where_clauses, format('stage_focus && %L', p_stage_focus));
    END IF;
    IF p_industry_focus IS NOT NULL AND array_length(p_industry_focus, 1) > 0 THEN
        where_clauses := array_append(where_clauses, format('industry_focus && %L', p_industry_focus));
    END IF;
    IF p_region_focus IS NOT NULL AND array_length(p_region_focus, 1) > 0 THEN
        where_clauses := array_append(where_clauses, format('region_focus && %L', p_region_focus));
    END IF;
    IF p_form_complexity IS NOT NULL AND array_length(p_form_complexity, 1) > 0 THEN
        where_clauses := array_append(where_clauses, format('form_complexity = ANY(%L)', p_form_complexity));
    END IF;
    IF p_required_documents IS NOT NULL AND array_length(p_required_documents, 1) > 0 THEN
        where_clauses := array_append(where_clauses, format('required_documents && %L', p_required_documents));
    END IF;

    query_body := 'FROM targets';
    IF array_length(where_clauses, 1) > 0 THEN
        query_body := query_body || ' WHERE ' || array_to_string(where_clauses, ' AND ');
    END IF;

    -- Get total count with filters
    query_count := 'SELECT COUNT(*) ' || query_body;
    EXECUTE query_count INTO total_count;

    -- Validate sort direction
    valid_sort_direction := CASE
        WHEN UPPER(p_sort_direction) IN ('ASC', 'DESC')
        THEN UPPER(p_sort_direction)
        ELSE 'ASC'
    END;

    -- Validate and set sort expression
    valid_sort_by := COALESCE(p_sort_by, 'name');
    sort_expression := CASE
        WHEN valid_sort_by = 'name' THEN 'name'
        WHEN valid_sort_by = 'type' THEN 'submission_type'
        WHEN valid_sort_by = 'complexity' THEN
            -- Custom order for complexity
            'CASE form_complexity ' ||
            'WHEN ''simple'' THEN 1 ' ||
            'WHEN ''standard'' THEN 2 ' ||
            'WHEN ''comprehensive'' THEN 3 ' ||
            'ELSE 4 END'
        WHEN valid_sort_by = 'focus' THEN 'array_to_string(stage_focus, '','')'
        WHEN valid_sort_by = 'industry' THEN 'array_to_string(industry_focus, '','')'
        WHEN valid_sort_by = 'region' THEN 'array_to_string(region_focus, '','')'
        WHEN valid_sort_by = 'requirements' THEN 'array_length(required_documents, 1)'
        ELSE 'name'
    END;

    -- Build final query for data
    query_final := 'SELECT * ' || query_body ||
                   format(' ORDER BY %s %s, name ASC LIMIT %L OFFSET %L',
                          sort_expression,
                          valid_sort_direction,
                          p_limit,
                          p_offset);

    -- Get paginated and filtered results
    EXECUTE format('
        SELECT jsonb_build_object(
            ''data'', COALESCE(jsonb_agg(to_jsonb(t.*)), ''[]''::jsonb),
            ''totalCount'', %L,
            ''hasMore'', %L,
            ''currentPage'', %L,
            ''limit'', %L,
            ''offset'', %L
        )
        FROM (%s) t',
        total_count,
        (p_offset + p_limit) < total_count,
        CASE WHEN p_limit > 0 THEN (p_offset / p_limit) + 1 ELSE 1 END,
        p_limit,
        p_offset,
        query_final
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_targets_simple(INTEGER, INTEGER, TEXT, TEXT, TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[]) TO authenticated;

-- ==========================================
-- PERFORMANCE OPTIMIZATIONS
-- ==========================================

-- Add composite index for efficient pagination with sorting
CREATE INDEX IF NOT EXISTS idx_targets_name_id ON targets(name, id);
CREATE INDEX IF NOT EXISTS idx_targets_created_at_id ON targets(created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_targets_updated_at_id ON targets(updated_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_targets_submission_type_name ON targets(submission_type, name);
CREATE INDEX IF NOT EXISTS idx_targets_form_complexity_name ON targets(form_complexity, name) WHERE form_complexity IS NOT NULL;

-- Optimize for filtering queries
CREATE INDEX IF NOT EXISTS idx_targets_stage_focus_name ON targets USING GIN(stage_focus) WHERE stage_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_industry_focus_name ON targets USING GIN(industry_focus) WHERE industry_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_region_focus_name ON targets USING GIN(region_focus) WHERE region_focus IS NOT NULL;

-- Update table statistics for better query planning
ANALYZE targets;