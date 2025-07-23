
-- =================================================================
-- RETRY LOGIC FOR FAILED SUBMISSIONS
-- =================================================================

CREATE OR REPLACE FUNCTION retry_submission(
    p_user_id UUID,
    p_startup_id UUID,
    p_submission_id UUID,
    p_submission_type TEXT -- 'fund', 'angel', 'accelerator'
)
RETURNS JSONB AS $$
DECLARE
    target_id UUID;
    submission_record RECORD;
    queue_function_result JSONB;
BEGIN
    -- Verify user owns the startup
    IF NOT EXISTS (
        SELECT 1 FROM startups s WHERE s.id = p_startup_id AND s.user_id = p_user_id
    ) THEN
        RETURN jsonb_build_object('error', 'Access denied or startup not found.');
    END IF;

    -- Handle different submission types
    IF p_submission_type = 'fund' THEN
        -- Check if the failed submission exists
        SELECT * INTO submission_record 
        FROM submissions 
        WHERE id = p_submission_id AND startup_id = p_startup_id AND status = 'failed';

        IF submission_record IS NULL THEN
            RETURN jsonb_build_object('error', 'Failed fund submission not found or it is not in a failed state.');
        END IF;

        -- Get the target ID and delete the old record
        target_id := submission_record.target_id;
        DELETE FROM submissions WHERE id = p_submission_id;

        -- Call the queue function again
        SELECT queue_submission(p_user_id, p_startup_id, target_id, submission_record.browserbase_job_id) INTO queue_function_result;
        RETURN queue_function_result;

    ELSIF p_submission_type = 'angel' THEN
        -- Logic for angel submissions (to be implemented)
        -- Similar to funds: find failed, delete, re-queue
        RETURN jsonb_build_object('error', 'Angel submission retry not yet implemented.');

    ELSIF p_submission_type = 'accelerator' THEN
        -- Logic for accelerator submissions (to be implemented)
        -- Similar to funds: find failed, delete, re-queue
        RETURN jsonb_build_object('error', 'Accelerator submission retry not yet implemented.');

    ELSE
        RETURN jsonb_build_object('error', 'Invalid submission type provided.');
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in retry_submission for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION retry_submission(UUID, UUID, UUID, TEXT) TO authenticated;

