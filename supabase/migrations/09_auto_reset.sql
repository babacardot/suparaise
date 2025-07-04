-- =============================================
-- Migration: Automatic Monthly Subscription Reset
-- Description: Add automatic monthly reset functionality for subscription limits
-- =============================================

-- Function to check and reset free users on their monthly anniversary
CREATE OR REPLACE FUNCTION check_and_reset_free_users()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_affected_rows INTEGER;
BEGIN
    -- Reset monthly submission counts for free users whose monthly anniversary has passed
    UPDATE profiles 
    SET 
        monthly_submissions_used = 0,
        updated_at = NOW()
    WHERE 
        is_active = TRUE 
        AND permission_level = 'FREE'
        AND monthly_submissions_used > 0
        AND (
            -- For users created more than a month ago, check if we've passed their monthly reset date
            (created_at + INTERVAL '1 month' * FLOOR(EXTRACT(EPOCH FROM (NOW() - created_at)) / (30.44 * 24 * 3600))) <= NOW()
            AND
            -- Only reset if we haven't already reset this month
            DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', NOW())
        );
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'affected_rows', v_affected_rows,
        'type', 'free_users_auto_reset'
    );
END;
$$;

-- Function to check and reset paid users when their billing period ends
CREATE OR REPLACE FUNCTION check_and_reset_paid_users()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_affected_rows INTEGER;
BEGIN
    -- Reset monthly submission counts for paid users whose billing period has ended
    UPDATE profiles 
    SET 
        monthly_submissions_used = 0,
        updated_at = NOW()
    WHERE 
        is_active = TRUE 
        AND is_subscribed = TRUE
        AND permission_level IN ('PRO', 'MAX')
        AND monthly_submissions_used > 0
        AND subscription_current_period_end IS NOT NULL
        AND subscription_current_period_end <= NOW()
        AND (
            -- Only reset if we haven't already reset since the period end
            updated_at < subscription_current_period_end
            OR
            -- Or if updated_at is older than the current period end by more than a day
            updated_at < (subscription_current_period_end - INTERVAL '1 day')
        );
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'affected_rows', v_affected_rows,
        'type', 'paid_users_auto_reset'
    );
END;
$$;

-- Function to run all automatic resets (can be called by cron or manually)
CREATE OR REPLACE FUNCTION run_automatic_subscription_resets()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_free_result JSON;
    v_paid_result JSON;
    v_total_affected INTEGER;
BEGIN
    -- Reset free users
    SELECT check_and_reset_free_users() INTO v_free_result;
    
    -- Reset paid users
    SELECT check_and_reset_paid_users() INTO v_paid_result;
    
    -- Calculate total affected rows
    v_total_affected := 
        COALESCE((v_free_result->>'affected_rows')::INTEGER, 0) + 
        COALESCE((v_paid_result->>'affected_rows')::INTEGER, 0);
    
    RETURN json_build_object(
        'success', true,
        'total_affected_rows', v_total_affected,
        'free_users_result', v_free_result,
        'paid_users_result', v_paid_result,
        'executed_at', NOW()
    );
END;
$$;

-- Create a trigger function that runs on profile updates to check for resets
CREATE OR REPLACE FUNCTION trigger_check_submission_reset()
RETURNS TRIGGER AS $$
DECLARE
    v_should_reset BOOLEAN := FALSE;
BEGIN
    -- Only check for resets if this is an update (not insert)
    IF TG_OP = 'UPDATE' THEN
        -- Check if this is a free user who might need a reset
        IF NEW.permission_level = 'FREE' AND NEW.monthly_submissions_used > 0 THEN
            -- Check if it's been at least 30 days since account creation
            IF NEW.created_at + INTERVAL '30 days' <= NOW() THEN
                -- Check if we haven't reset this month
                IF DATE_TRUNC('month', OLD.updated_at) < DATE_TRUNC('month', NOW()) THEN
                    v_should_reset := TRUE;
                END IF;
            END IF;
        END IF;
        
        -- Check if this is a paid user who might need a reset
        IF NEW.is_subscribed = TRUE AND NEW.permission_level IN ('PRO', 'MAX') 
           AND NEW.monthly_submissions_used > 0 
           AND NEW.subscription_current_period_end IS NOT NULL THEN
            -- Check if billing period has ended
            IF NEW.subscription_current_period_end <= NOW() THEN
                -- Check if we haven't reset since the period ended
                IF OLD.updated_at < NEW.subscription_current_period_end THEN
                    v_should_reset := TRUE;
                END IF;
            END IF;
        END IF;
        
        -- If we should reset, do it
        IF v_should_reset THEN
            NEW.monthly_submissions_used := 0;
            NEW.updated_at := NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger (but make it conditional to avoid affecting other updates)
CREATE TRIGGER auto_reset_subscription_limits
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    WHEN (
        -- Only trigger when relevant fields are being accessed/updated
        OLD.monthly_submissions_used IS DISTINCT FROM NEW.monthly_submissions_used
        OR OLD.subscription_current_period_end IS DISTINCT FROM NEW.subscription_current_period_end
        OR OLD.permission_level IS DISTINCT FROM NEW.permission_level
    )
    EXECUTE FUNCTION trigger_check_submission_reset();

-- Grant execute permissions for the new functions
GRANT EXECUTE ON FUNCTION check_and_reset_free_users() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_reset_paid_users() TO authenticated;
GRANT EXECUTE ON FUNCTION run_automatic_subscription_resets() TO authenticated;

-- Also grant to service role for automated operations
GRANT EXECUTE ON FUNCTION check_and_reset_free_users() TO service_role;
GRANT EXECUTE ON FUNCTION check_and_reset_paid_users() TO service_role;
GRANT EXECUTE ON FUNCTION run_automatic_subscription_resets() TO service_role;

-- Create a simple view for monitoring subscription usage (explicitly without SECURITY DEFINER)
-- This view uses the permissions of the querying user, not the view creator
DROP VIEW IF EXISTS subscription_usage_summary;
CREATE VIEW subscription_usage_summary AS
SELECT 
    permission_level,
    COUNT(*) as user_count,
    AVG(monthly_submissions_used) as avg_submissions_used,
    AVG(monthly_submissions_limit) as avg_submissions_limit,
    COUNT(CASE WHEN monthly_submissions_used >= monthly_submissions_limit THEN 1 END) as users_at_limit,
    COUNT(CASE WHEN is_subscribed THEN 1 END) as subscribed_users
FROM profiles 
WHERE is_active = TRUE
GROUP BY permission_level
ORDER BY permission_level;

-- Grant select on the view
GRANT SELECT ON subscription_usage_summary TO authenticated;
GRANT SELECT ON subscription_usage_summary TO service_role; 

ALTER VIEW public.subscription_usage_summary SET (security_invoker=on);