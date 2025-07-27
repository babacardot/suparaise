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
    -- Only reset plan-based submissions, not usage billing submissions
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
    -- Only reset plan-based submissions, not usage billing submissions
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

-- Function to reset usage billing monthly counters (separate from plan-based)
CREATE OR REPLACE FUNCTION reset_monthly_usage_billing()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_affected_rows INTEGER;
BEGIN
    -- Reset usage billing counters but preserve actual costs until next invoice period
    -- This depends on your billing cycle - for weekly billing, you might want different logic
    UPDATE profiles 
    SET 
        monthly_usage_submissions_count = 0,
        monthly_estimated_usage_cost = 0.00,
        -- Keep actual_usage_cost - it gets reset when Stripe processes the invoice
        updated_at = NOW()
    WHERE 
        is_active = TRUE 
        AND usage_billing_enabled = TRUE
        AND (monthly_usage_submissions_count > 0 OR monthly_estimated_usage_cost > 0);
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'affected_rows', v_affected_rows,
        'type', 'usage_billing_estimated_reset'
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
    v_usage_result JSON;
    v_total_affected INTEGER;
BEGIN
    -- Reset free users (plan-based submissions)
    SELECT check_and_reset_free_users() INTO v_free_result;
    
    -- Reset paid users (plan-based submissions)
    SELECT check_and_reset_paid_users() INTO v_paid_result;
    
    -- Reset usage billing counters (usage-based submissions)
    SELECT reset_monthly_usage_billing() INTO v_usage_result;
    
    -- Calculate total affected rows
    v_total_affected := 
        COALESCE((v_free_result->>'affected_rows')::INTEGER, 0) + 
        COALESCE((v_paid_result->>'affected_rows')::INTEGER, 0) +
        COALESCE((v_usage_result->>'affected_rows')::INTEGER, 0);
    
    RETURN json_build_object(
        'success', true,
        'total_affected_rows', v_total_affected,
        'free_users_result', v_free_result,
        'paid_users_result', v_paid_result,
        'usage_billing_result', v_usage_result,
        'executed_at', NOW()
    );
END;
$$;

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