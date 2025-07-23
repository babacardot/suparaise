-- ==========================================
-- SESSION REPLAY AND DEBUGGING SUPPORT
-- Functions for managing session recording data
-- ==========================================

-- Function to update submission with session replay data
CREATE OR REPLACE FUNCTION update_submission_session_data(
    p_submission_id UUID,
    p_submission_type TEXT,
    p_session_id TEXT,
    p_session_replay_url TEXT,
    p_screenshots_taken INTEGER DEFAULT 0,
    p_debug_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_submission_type = 'fund' THEN
        UPDATE submissions 
        SET 
            browserbase_session_id = p_session_id,
            session_replay_url = p_session_replay_url,
            screenshots_taken = p_screenshots_taken,
            debug_data = p_debug_data,
            updated_at = NOW()
        WHERE id = p_submission_id;
        
    ELSIF p_submission_type = 'angel' THEN
        UPDATE angel_submissions 
        SET 
            browserbase_session_id = p_session_id,
            session_replay_url = p_session_replay_url,
            screenshots_taken = p_screenshots_taken,
            debug_data = p_debug_data,
            updated_at = NOW()
        WHERE id = p_submission_id;
        
    ELSIF p_submission_type = 'accelerator' THEN
        UPDATE accelerator_submissions 
        SET 
            browserbase_session_id = p_session_id,
            session_replay_url = p_session_replay_url,
            screenshots_taken = p_screenshots_taken,
            debug_data = p_debug_data,
            updated_at = NOW()
        WHERE id = p_submission_id;
    ELSE
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error updating session data for submission %: %', p_submission_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the get_applications_advanced function to include session data
CREATE OR REPLACE FUNCTION get_applications_advanced(
    p_startup_id UUID,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0,
    p_sort_by TEXT DEFAULT 'submission_date',
    p_sort_direction TEXT DEFAULT 'desc',
    p_search TEXT DEFAULT NULL,
    p_status_filter TEXT[] DEFAULT NULL,
    p_type_filter TEXT[] DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
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
    where_conditions := array_append(where_conditions, format('startup_id = %L', p_startup_id));
    
    -- Optimized search with normalized input
    IF p_search IS NOT NULL AND length(trim(p_search)) > 0 THEN
        normalized_search := lower(trim(p_search));
        where_conditions := array_append(where_conditions, format('(
            lower(submitted_to_name) LIKE %L OR
            lower(COALESCE(agent_notes, '''')) LIKE %L OR
            lower(submitted_to_type) LIKE %L OR
            lower(status::text) LIKE %L OR
            EXISTS (SELECT 1 FROM unnest(stage_focus) AS s WHERE lower(s::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(industry_focus) AS i WHERE lower(i::text) LIKE %L) OR
            EXISTS (SELECT 1 FROM unnest(region_focus) AS r WHERE lower(r::text) LIKE %L) OR
            lower(submission_type::text) LIKE %L
        )',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%',
        '%' || normalized_search || '%'));
    END IF;
    
    -- Status filter
    IF p_status_filter IS NOT NULL AND array_length(p_status_filter, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('status = ANY(%L)', p_status_filter));
    END IF;
    
    -- Type filter
    IF p_type_filter IS NOT NULL AND array_length(p_type_filter, 1) > 0 THEN
        where_conditions := array_append(where_conditions, format('submitted_to_type = ANY(%L)', p_type_filter));
    END IF;
    
    -- Date range filter
    IF p_date_from IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('submission_date::date >= %L', p_date_from));
    END IF;
    
    IF p_date_to IS NOT NULL THEN
        where_conditions := array_append(where_conditions, format('submission_date::date <= %L', p_date_to));
    END IF;
    
    -- Build sort clause
    sort_clause := CASE
        WHEN p_sort_by = 'submission_date' THEN 'submission_date'
        WHEN p_sort_by = 'submitted_to_name' THEN 'submitted_to_name'
        WHEN p_sort_by = 'status' THEN 'status, submission_date'
        WHEN p_sort_by = 'type' THEN 'submitted_to_type, submission_date'
        ELSE 'submission_date'
    END;
    
    -- Validate direction
    IF UPPER(p_sort_direction) NOT IN ('ASC', 'DESC') THEN
        p_sort_direction := 'DESC';
    END IF;
    
    -- Build the unified submissions CTE with session replay data
    base_query := format('
    WITH all_submissions_detailed AS (
        -- Fund submissions
        SELECT
            s.id AS submission_id,
            s.startup_id,
            t.name AS submitted_to_name,
            ''Fund'' AS submitted_to_type,
            s.submission_date,
            s.status,
            s.agent_notes,
            s.queue_position,
            s.queued_at,
            s.started_at,
            t.website AS website_url,
            t.id AS entity_id,
            t.application_url,
            t.submission_type,
            t.form_complexity,
            t.stage_focus,
            t.industry_focus,
            t.region_focus,
            t.required_documents,
            s.browserbase_session_id,
            s.session_replay_url,
            s.screenshots_taken,
            s.debug_data,
            s.created_at,
            s.updated_at
        FROM submissions s
        JOIN targets t ON s.target_id = t.id
        
        UNION ALL
        
        -- Angel submissions
        SELECT
            asub.id AS submission_id,
            asub.startup_id,
            (a.first_name || '' '' || a.last_name) AS submitted_to_name,
            ''Angel'' AS submitted_to_type,
            asub.submission_date,
            asub.status,
            asub.agent_notes,
            NULL AS queue_position,
            NULL AS queued_at,
            NULL AS started_at,
            a.linkedin AS website_url,
            a.id AS entity_id,
            a.application_url,
            a.submission_type,
            a.form_complexity,
            a.stage_focus,
            a.industry_focus,
            a.region_focus,
            a.required_documents,
            asub.browserbase_session_id,
            asub.session_replay_url,
            asub.screenshots_taken,
            asub.debug_data,
            asub.created_at,
            asub.updated_at
        FROM angel_submissions asub
        JOIN angels a ON asub.angel_id = a.id
        
        UNION ALL
        
        -- Accelerator submissions
        SELECT
            accs.id AS submission_id,
            accs.startup_id,
            acc.name AS submitted_to_name,
            ''Accelerator'' AS submitted_to_type,
            accs.submission_date,
            accs.status,
            accs.agent_notes,
            NULL AS queue_position,
            NULL AS queued_at,
            NULL AS started_at,
            acc.website AS website_url,
            acc.id AS entity_id,
            acc.application_url,
            acc.submission_type,
            acc.form_complexity,
            acc.stage_focus,
            acc.industry_focus,
            acc.region_focus,
            acc.required_documents,
            accs.browserbase_session_id,
            accs.session_replay_url,
            accs.screenshots_taken,
            accs.debug_data,
            accs.created_at,
            accs.updated_at
        FROM accelerator_submissions accs
        JOIN accelerators acc ON accs.accelerator_id = acc.id
    ),
    filtered_submissions AS (
        SELECT * FROM all_submissions_detailed
        WHERE %s
    ),
    count_data AS (
        SELECT COUNT(*) as total_count FROM filtered_submissions
    ),
    paginated_data AS (
        SELECT * FROM filtered_submissions
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
    array_to_string(where_conditions, ' AND '),
    sort_clause, UPPER(p_sort_direction),
    p_limit, p_offset,
    p_offset + p_limit,
    CASE WHEN p_limit > 0 THEN (p_offset / p_limit) + 1 ELSE 1 END,
    p_limit,
    p_offset
    );
    
    EXECUTE base_query INTO result;
    
    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_applications_advanced for startup %: %', p_startup_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_submission_session_data(UUID, TEXT, TEXT, TEXT, INTEGER, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_applications_advanced(UUID, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT[], TEXT[], DATE, DATE) TO authenticated;