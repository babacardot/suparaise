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
    -- Add comprehensive search clause first for better performance
    IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
        where_clauses := array_append(where_clauses, format('(
            -- Name and notes (primary search fields)
            name ILIKE %L OR
            COALESCE(notes, '''') ILIKE %L OR
            
            -- Stage focus (funding rounds) - including common synonyms
            array_to_string(stage_focus, '' '') ILIKE %L OR
            EXISTS (SELECT 1 FROM unnest(stage_focus) AS stage WHERE stage::text ILIKE %L) OR
            (lower(%L) = ''preseed'' AND ''Pre-seed'' = ANY(stage_focus)) OR
            (lower(%L) IN (''series-a'', ''seriesa'', ''round-a'') AND ''Series A'' = ANY(stage_focus)) OR
            (lower(%L) IN (''series-b'', ''seriesb'', ''round-b'') AND ''Series B'' = ANY(stage_focus)) OR
            (lower(%L) IN (''series-c'', ''seriesc'', ''round-c'') AND ''Series C'' = ANY(stage_focus)) OR
            
            -- Industry focus
            array_to_string(industry_focus, '' '') ILIKE %L OR
            EXISTS (SELECT 1 FROM unnest(industry_focus) AS industry WHERE industry::text ILIKE %L) OR
            -- Common industry synonyms
            (lower(%L) IN (''saas'', ''software'') AND ''B2B SaaS'' = ANY(industry_focus)) OR
            (lower(%L) IN (''ai'', ''artificial intelligence'', ''machine learning'', ''ml'') AND ''AI/ML'' = ANY(industry_focus)) OR
            (lower(%L) IN (''fintech'', ''finance'', ''financial'') AND ''Fintech'' = ANY(industry_focus)) OR
            (lower(%L) IN (''healthtech'', ''health'', ''medical'', ''healthcare'') AND ''Healthtech'' = ANY(industry_focus)) OR
            (lower(%L) IN (''climate'', ''green'', ''sustainability'', ''cleantech'') AND ''Climate tech'' = ANY(industry_focus)) OR
            (lower(%L) IN (''crypto'', ''blockchain'', ''defi'', ''nft'') AND ''Web3'' = ANY(industry_focus)) OR
            
            -- Region focus
            array_to_string(region_focus, '' '') ILIKE %L OR
            EXISTS (SELECT 1 FROM unnest(region_focus) AS region WHERE region::text ILIKE %L) OR
            -- Common region synonyms
            (lower(%L) IN (''usa'', ''us'', ''america'', ''united states'') AND ''North America'' = ANY(region_focus)) OR
            (lower(%L) IN (''eu'', ''european union'') AND ''Europe'' = ANY(region_focus)) OR
            (lower(%L) IN (''uk'', ''united kingdom'', ''britain'') AND ''Western Europe'' = ANY(region_focus)) OR
            (lower(%L) IN (''asia pacific'', ''apac'') AND ''Asia'' = ANY(region_focus)) OR
            (lower(%L) IN (''latin america'', ''south america'') AND ''LATAM'' = ANY(region_focus)) OR
            
            -- Submission type and form complexity
            submission_type::text ILIKE %L OR
            COALESCE(form_complexity::text, '''') ILIKE %L OR
            -- Form complexity synonyms
            (lower(%L) IN (''easy'', ''quick'', ''fast'') AND form_complexity = ''simple'') OR
            (lower(%L) IN (''complex'', ''detailed'', ''thorough'') AND form_complexity = ''comprehensive'') OR
            
            -- Required documents with common synonyms
            array_to_string(required_documents, '' '') ILIKE %L OR
            EXISTS (SELECT 1 FROM unnest(required_documents) AS doc WHERE doc::text ILIKE %L) OR
            (lower(%L) IN (''deck'', ''presentation'', ''slides'') AND ''pitch_deck'' = ANY(required_documents)) OR
            (lower(%L) IN (''financials'', ''projections'', ''forecast'') AND ''financial_projections'' = ANY(required_documents)) OR
            (lower(%L) IN (''plan'', ''business model'') AND ''business_plan'' = ANY(required_documents)) OR
            (lower(%L) IN (''metrics'', ''kpis'', ''growth'') AND ''traction_data'' = ANY(required_documents)) OR
            
            -- Website domain (extract domain from URL for search)
            CASE 
                WHEN website IS NOT NULL THEN 
                    regexp_replace(regexp_replace(website, ''https?://(www\.)?'', '''', ''g''), ''/.*'', '''', ''g'') ILIKE %L
                ELSE FALSE
            END OR
            
            -- Full-text search on concatenated fields for better relevance
            to_tsvector(''english'', 
                COALESCE(name, '''') || '' '' || 
                COALESCE(notes, '''') || '' '' || 
                COALESCE(array_to_string(stage_focus, '' ''), '''') || '' '' ||
                COALESCE(array_to_string(industry_focus, '' ''), '''') || '' '' ||
                COALESCE(array_to_string(region_focus, '' ''), '''') || '' '' ||
                COALESCE(submission_type::text, '''') || '' '' ||
                COALESCE(form_complexity::text, '''')
            ) @@ plainto_tsquery(''english'', %L)
        )', 
        '%' || trim(p_search) || '%',  -- name
        '%' || trim(p_search) || '%',  -- notes
        '%' || trim(p_search) || '%',  -- stage_focus array
        '%' || trim(p_search) || '%',  -- stage_focus individual
        trim(p_search),                -- preseed synonym
        trim(p_search),                -- series-a synonyms
        trim(p_search),                -- series-b synonyms  
        trim(p_search),                -- series-c synonyms
        '%' || trim(p_search) || '%',  -- industry_focus array
        '%' || trim(p_search) || '%',  -- industry_focus individual
        trim(p_search),                -- saas synonyms
        trim(p_search),                -- ai synonyms
        trim(p_search),                -- fintech synonyms
        trim(p_search),                -- healthtech synonyms
        trim(p_search),                -- climate synonyms
        trim(p_search),                -- web3 synonyms
        '%' || trim(p_search) || '%',  -- region_focus array
        '%' || trim(p_search) || '%',  -- region_focus individual
        trim(p_search),                -- usa synonyms
        trim(p_search),                -- eu synonyms
        trim(p_search),                -- uk synonyms
        trim(p_search),                -- apac synonyms
        trim(p_search),                -- latam synonyms
        '%' || trim(p_search) || '%',  -- submission_type
        '%' || trim(p_search) || '%',  -- form_complexity
        trim(p_search),                -- simple synonyms
        trim(p_search),                -- comprehensive synonyms
        '%' || trim(p_search) || '%',  -- required_documents array
        '%' || trim(p_search) || '%',  -- required_documents individual
        trim(p_search),                -- deck synonyms
        trim(p_search),                -- financials synonyms
        trim(p_search),                -- business plan synonyms
        trim(p_search),                -- traction synonyms
        '%' || trim(p_search) || '%',  -- website domain
        trim(p_search)));              -- full-text search
    END IF;
    
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