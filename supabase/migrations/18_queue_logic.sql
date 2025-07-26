
-- =================================================================
-- Migration: Fix Queue Processing Logic
-- Description: This migration corrects the status of dequeued submissions
-- and introduces a function to centralize task starting for reliability.
-- =================================================================

-- Step 1: Create a function to process the next queued submission.
-- This function is used to move a submission from the queue to processing.
    
CREATE OR REPLACE FUNCTION process_next_queued_submission(p_startup_id UUID)
RETURNS JSONB AS $$
DECLARE
    next_submission_id UUID;
    queue_pos INTEGER;
BEGIN
    -- Atomically find and update the next queued submission
    WITH next_in_queue AS (
        SELECT id
        FROM submissions
        WHERE startup_id = p_startup_id
          AND status = 'pending'
          AND queue_position IS NOT NULL
        ORDER BY queue_position ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    UPDATE submissions
    SET
        status = 'in_progress', -- FIX: Correctly set status to in_progress
        queue_position = NULL,
        queued_at = NULL,
        started_at = NOW()
    WHERE id = (SELECT id FROM next_in_queue)
    RETURNING id, queue_position INTO next_submission_id, queue_pos;

    IF next_submission_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'No queued submissions to process'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'submissionId', next_submission_id,
        'previousQueuePosition', queue_pos,
        'message', 'Submission moved from queue to processing'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in process_next_queued_submission for startup %: %', p_startup_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions on the updated function
GRANT EXECUTE ON FUNCTION process_next_queued_submission(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION process_next_queued_submission(UUID) TO service_role;


-- Step 2: Create a function to get all data required to start a task.
-- This centralizes data fetching for both new and queued submissions.
CREATE OR REPLACE FUNCTION get_submission_start_data(p_submission_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'submission', to_jsonb(s),
        'startup', to_jsonb(st),
        'target', to_jsonb(t),
        'founders', COALESCE(jsonb_agg(to_jsonb(f)) FILTER (WHERE f.id IS NOT NULL), '[]'::jsonb),
        'agentSettings', to_jsonb(ags)
    )
    INTO result
    FROM submissions s
    JOIN startups st ON s.startup_id = st.id
    JOIN targets t ON s.target_id = t.id
    JOIN agent_settings ags ON s.startup_id = ags.startup_id
    LEFT JOIN founders f ON s.startup_id = f.startup_id
    WHERE s.id = p_submission_id
    GROUP BY s.id, st.id, t.id, ags.id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_submission_start_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_submission_start_data(UUID) TO service_role; 