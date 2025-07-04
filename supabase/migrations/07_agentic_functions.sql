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
    p_search TEXT DEFAULT NULL,
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
            lower(name) LIKE %L OR
            lower(COALESCE(notes, '''')) LIKE %L OR
            EXISTS (SELECT 1 FROM unnest(stage_focus) AS s WHERE lower(s::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(industry_focus) AS i WHERE lower(i::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(region_focus) AS r WHERE lower(r::text) LIKE %L) OR
            lower(submission_type::text) LIKE %L OR
            lower(COALESCE(form_complexity::text, '''')) LIKE %L
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
        where_conditions := array_append(where_conditions, format('submission_type = ANY(%L)', p_submission_types));
    END IF;
    
    IF p_stage_focus IS NOT NULL AND array_length(p_stage_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('stage_focus && %L', p_stage_focus));
    END IF;
    
    IF p_industry_focus IS NOT NULL AND array_length(p_industry_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('industry_focus && %L', p_industry_focus));
    END IF;
    
    IF p_region_focus IS NOT NULL AND array_length(p_region_focus, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('region_focus && %L', p_region_focus));
    END IF;
    
    IF p_form_complexity IS NOT NULL AND array_length(p_form_complexity, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('form_complexity = ANY(%L)', p_form_complexity));
    END IF;
    
    IF p_required_documents IS NOT NULL AND array_length(p_required_documents, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('required_documents && %L', p_required_documents));
    END IF;

    -- Build base query parts
    base_query := 'FROM targets';
    IF array_length(where_conditions, 1) > 0 THEN
        base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;

    -- Get count and data in single optimized query using CTE
    -- Build sort clause
    sort_clause := CASE
        WHEN p_sort_by = 'name' THEN 'name'
        WHEN p_sort_by = 'type' THEN 'submission_type, name'
        WHEN p_sort_by = 'complexity' THEN 
            'CASE form_complexity WHEN ''simple'' THEN 1 WHEN ''standard'' THEN 2 WHEN ''comprehensive'' THEN 3 ELSE 4 END, name'
        WHEN p_sort_by = 'focus' THEN 'array_to_string(stage_focus, '',''), name'
        WHEN p_sort_by = 'industry' THEN 'array_to_string(industry_focus, '',''), name'
        WHEN p_sort_by = 'region' THEN 'array_to_string(region_focus, '',''), name'
        WHEN p_sort_by = 'requirements' THEN 'array_length(required_documents, 1), name'
        ELSE 'name'
    END;

    -- Single query with CTE for better performance
    final_query := format('
        WITH filtered_targets AS (
            SELECT * %s
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_targets_simple(INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT[], TEXT[], TEXT[], TEXT[], TEXT[], TEXT[]) TO authenticated;

-- ==========================================
-- PERFORMANCE OPTIMIZATIONS
-- ==========================================

-- Add composite index for efficient pagination with sorting
CREATE INDEX IF NOT EXISTS idx_targets_name_id ON targets(name, id);
CREATE INDEX IF NOT EXISTS idx_targets_created_at_id ON targets(created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_targets_updated_at_id ON targets(updated_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_targets_submission_type_name ON targets(submission_type, name);
CREATE INDEX IF NOT EXISTS idx_targets_form_complexity_name ON targets(form_complexity, name) WHERE form_complexity IS NOT NULL;

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
CREATE INDEX IF NOT EXISTS idx_targets_form_complexity ON targets(form_complexity) WHERE form_complexity IS NOT NULL;

-- Ensure we have proper GIN indexes for array operations
CREATE INDEX IF NOT EXISTS idx_targets_stage_focus_gin ON targets USING GIN(stage_focus) WHERE stage_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_industry_focus_gin ON targets USING GIN(industry_focus) WHERE industry_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_region_focus_gin ON targets USING GIN(region_focus) WHERE region_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_required_documents_gin ON targets USING GIN(required_documents) WHERE required_documents IS NOT NULL;

-- Composite indexes for common sort patterns
CREATE INDEX IF NOT EXISTS idx_targets_name_asc ON targets(name ASC, id);
CREATE INDEX IF NOT EXISTS idx_targets_name_desc ON targets(name DESC, id);
CREATE INDEX IF NOT EXISTS idx_targets_type_name ON targets(submission_type, name);
CREATE INDEX IF NOT EXISTS idx_targets_complexity_name ON targets(form_complexity, name) WHERE form_complexity IS NOT NULL;

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_targets_active ON targets(name) WHERE submission_type IS NOT NULL;

-- Update table statistics for better query planning
ANALYZE targets;