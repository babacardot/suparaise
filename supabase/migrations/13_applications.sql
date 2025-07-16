-- ==========================================
-- APPLICATIONS PAGE FUNCTIONS
-- Comprehensive functions for the applications page
-- ==========================================

-- Function to get all submissions with comprehensive details for applications page
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
    
    -- Optimized search with normalized input - following pattern from get_targets_simple
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
    
    -- Build the unified submissions CTE with detailed information
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
GRANT EXECUTE ON FUNCTION get_applications_advanced(UUID, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT[], TEXT[], DATE, DATE) TO authenticated;

-- Keep the old function for backward compatibility temporarily
CREATE OR REPLACE FUNCTION get_all_submissions_detailed(
    p_startup_id UUID,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0,
    p_sort_by TEXT DEFAULT 'submission_date',
    p_sort_direction TEXT DEFAULT 'desc',
    p_search TEXT DEFAULT NULL, -- Add search parameter
    p_status_filter TEXT[] DEFAULT NULL,
    p_type_filter TEXT[] DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
    RETURN get_applications_advanced(
        p_startup_id,
        p_limit,
        p_offset,
        p_sort_by,
        p_sort_direction,
        p_search, -- Pass search parameter
        p_status_filter,
        p_type_filter,
        p_date_from,
        p_date_to
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Function to get submission statistics for the applications page
CREATE OR REPLACE FUNCTION get_submission_statistics(p_startup_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    fund_stats JSONB;
    angel_stats JSONB;
    accelerator_stats JSONB;
    total_stats JSONB;
BEGIN
    -- Get fund submission statistics
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'failed', COUNT(*) FILTER (WHERE status = 'failed'),
        'queued', COUNT(*) FILTER (WHERE queue_position IS NOT NULL)
    ) INTO fund_stats
    FROM submissions
    WHERE startup_id = p_startup_id;
    
    -- Get angel submission statistics
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'failed', COUNT(*) FILTER (WHERE status = 'failed')
    ) INTO angel_stats
    FROM angel_submissions
    WHERE startup_id = p_startup_id;
    
    -- Get accelerator submission statistics
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'failed', COUNT(*) FILTER (WHERE status = 'failed')
    ) INTO accelerator_stats
    FROM accelerator_submissions
    WHERE startup_id = p_startup_id;
    
    -- Calculate total statistics
    total_stats := jsonb_build_object(
        'total', 
        (fund_stats->>'total')::INTEGER + 
        (angel_stats->>'total')::INTEGER + 
        (accelerator_stats->>'total')::INTEGER,
        'pending',
        (fund_stats->>'pending')::INTEGER + 
        (angel_stats->>'pending')::INTEGER + 
        (accelerator_stats->>'pending')::INTEGER,
        'in_progress',
        (fund_stats->>'in_progress')::INTEGER + 
        (angel_stats->>'in_progress')::INTEGER + 
        (accelerator_stats->>'in_progress')::INTEGER,
        'completed',
        (fund_stats->>'completed')::INTEGER + 
        (angel_stats->>'completed')::INTEGER + 
        (accelerator_stats->>'completed')::INTEGER,
        'failed',
        (fund_stats->>'failed')::INTEGER + 
        (angel_stats->>'failed')::INTEGER + 
        (accelerator_stats->>'failed')::INTEGER,
        'queued',
        (fund_stats->>'queued')::INTEGER
    );
    
    result := jsonb_build_object(
        'funds', fund_stats,
        'angels', angel_stats,
        'accelerators', accelerator_stats,
        'total', total_stats
    );
    
    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_submission_statistics for startup %: %', p_startup_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Function to retry a failed submission
CREATE OR REPLACE FUNCTION retry_submission(
    p_user_id UUID,
    p_startup_id UUID,
    p_submission_id UUID,
    p_submission_type TEXT -- 'fund', 'angel', or 'accelerator'
)
RETURNS JSONB AS $$
DECLARE
    target_id UUID;
    angel_id UUID;
    accelerator_id UUID;
    current_status TEXT;
    queue_result JSONB;
BEGIN
    -- Verify the submission belongs to the user's startup and get current status
    IF p_submission_type = 'fund' THEN
        SELECT s.target_id, s.status INTO target_id, current_status
        FROM submissions s
        JOIN startups st ON s.startup_id = st.id
        WHERE s.id = p_submission_id 
          AND st.user_id = p_user_id 
          AND s.startup_id = p_startup_id;
          
        IF target_id IS NULL THEN
            RETURN jsonb_build_object('error', 'Submission not found or access denied');
        END IF;
        
        -- Only allow retry for failed submissions
        IF current_status != 'failed' THEN
            RETURN jsonb_build_object('error', 'Can only retry failed submissions');
        END IF;
        
        -- Delete the old submission
        DELETE FROM submissions WHERE id = p_submission_id;
        
        -- Queue new submission
        SELECT queue_submission(p_user_id, p_startup_id, target_id) INTO queue_result;
        
    ELSIF p_submission_type = 'angel' THEN
        SELECT asub.angel_id, asub.status INTO angel_id, current_status
        FROM angel_submissions asub
        JOIN startups st ON asub.startup_id = st.id
        WHERE asub.id = p_submission_id 
          AND st.user_id = p_user_id 
          AND asub.startup_id = p_startup_id;
          
        IF angel_id IS NULL THEN
            RETURN jsonb_build_object('error', 'Angel submission not found or access denied');
        END IF;
        
        IF current_status != 'failed' THEN
            RETURN jsonb_build_object('error', 'Can only retry failed submissions');
        END IF;
        
        -- Update status to pending for retry
        UPDATE angel_submissions 
        SET status = 'pending', 
            submission_date = NOW(),
            agent_notes = NULL,
            updated_at = NOW()
        WHERE id = p_submission_id;
        
        queue_result := jsonb_build_object(
            'success', true,
            'message', 'Angel submission reset for retry'
        );
        
    ELSIF p_submission_type = 'accelerator' THEN
        SELECT accs.accelerator_id, accs.status INTO accelerator_id, current_status
        FROM accelerator_submissions accs
        JOIN startups st ON accs.startup_id = st.id
        WHERE accs.id = p_submission_id 
          AND st.user_id = p_user_id 
          AND accs.startup_id = p_startup_id;
          
        IF accelerator_id IS NULL THEN
            RETURN jsonb_build_object('error', 'Accelerator submission not found or access denied');
        END IF;
        
        IF current_status != 'failed' THEN
            RETURN jsonb_build_object('error', 'Can only retry failed submissions');
        END IF;
        
        -- Update status to pending for retry
        UPDATE accelerator_submissions 
        SET status = 'pending', 
            submission_date = NOW(),
            agent_notes = NULL,
            updated_at = NOW()
        WHERE id = p_submission_id;
        
        queue_result := jsonb_build_object(
            'success', true,
            'message', 'Accelerator submission reset for retry'
        );
        
    ELSE
        RETURN jsonb_build_object('error', 'Invalid submission type');
    END IF;
    
    RETURN queue_result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in retry_submission for submission %: %', p_submission_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_applications_advanced(UUID, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT[], TEXT[], DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_submissions_detailed(UUID, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT[], TEXT[], DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_submission_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION retry_submission(UUID, UUID, UUID, TEXT) TO authenticated;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_submissions_startup_date ON submissions(startup_id, submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_startup_status ON submissions(startup_id, status);
CREATE INDEX IF NOT EXISTS idx_angel_submissions_startup_date ON angel_submissions(startup_id, submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_angel_submissions_startup_status ON angel_submissions(startup_id, status);
CREATE INDEX IF NOT EXISTS idx_accelerator_submissions_startup_date ON accelerator_submissions(startup_id, submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_accelerator_submissions_startup_status ON accelerator_submissions(startup_id, status);

-- Update table statistics
ANALYZE submissions;
ANALYZE angel_submissions;
ANALYZE accelerator_submissions; 