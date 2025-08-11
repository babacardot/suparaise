-- =============================================
-- Migration: Subscription Management RPC Functions
-- Description: Create RPC functions for Stripe subscription operations
-- =============================================

-- Function to get or create Stripe customer
CREATE OR REPLACE FUNCTION get_or_create_stripe_customer(
    p_user_id UUID,
    p_stripe_customer_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_profile RECORD;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile
    FROM profiles
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User profile not found'
        );
    END IF;
    
    -- If customer ID is provided and profile doesn't have one, update it
    IF p_stripe_customer_id IS NOT NULL AND v_profile.stripe_customer_id IS NULL THEN
        UPDATE profiles 
        SET stripe_customer_id = p_stripe_customer_id,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        v_profile.stripe_customer_id := p_stripe_customer_id;
    END IF;
    
    -- Return profile data
    RETURN json_build_object(
        'success', true,
        'profile', row_to_json(v_profile)
    );
END;
$$;

-- Function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status(
    p_stripe_customer_id TEXT,
    p_subscription_id TEXT,
    p_status subscription_status,
    p_current_period_end TIMESTAMPTZ DEFAULT NULL,
    p_is_subscribed BOOLEAN DEFAULT NULL,
    p_plan_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_affected_rows INTEGER;
    v_calculated_is_subscribed BOOLEAN;
    v_permission_level permission_level;
    v_monthly_limit INTEGER;
BEGIN
    -- Calculate is_subscribed if not provided
    IF p_is_subscribed IS NULL THEN
        v_calculated_is_subscribed := (p_status = 'active');
    ELSE
        v_calculated_is_subscribed := p_is_subscribed;
    END IF;
    
    -- Determine permission level and monthly limits based on plan
    IF p_plan_name IS NOT NULL THEN
        CASE 
            WHEN LOWER(p_plan_name) LIKE '%pro%' THEN
                v_permission_level := 'PRO';
                v_monthly_limit := 20;
            WHEN LOWER(p_plan_name) LIKE '%max%' THEN
                v_permission_level := 'MAX';
                v_monthly_limit := 50;
            ELSE
                v_permission_level := 'FREE';
                v_monthly_limit := 2;
        END CASE;
    ELSE
        -- Default based on subscription status
        IF v_calculated_is_subscribed THEN
            v_permission_level := 'PRO'; -- Default paid tier
            v_monthly_limit := 20;
        ELSE
            v_permission_level := 'FREE';
            v_monthly_limit := 2;
        END IF;
    END IF;
    
    -- Update profile subscription data
    UPDATE profiles 
    SET 
        is_subscribed = v_calculated_is_subscribed,
        stripe_subscription_id = p_subscription_id,
        subscription_status = p_status,
        subscription_current_period_end = p_current_period_end,
        permission_level = v_permission_level,
        monthly_submissions_limit = v_monthly_limit,
        updated_at = NOW()
    WHERE stripe_customer_id = p_stripe_customer_id;
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    IF v_affected_rows = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'affected_rows', v_affected_rows,
        'permission_level', v_permission_level,
        'monthly_limit', v_monthly_limit
    );
END;
$$;

-- Function to cancel subscription
CREATE OR REPLACE FUNCTION cancel_subscription(
    p_stripe_customer_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_affected_rows INTEGER;
BEGIN
    -- Update profile to cancel subscription
    UPDATE profiles 
    SET 
        is_subscribed = false,
        subscription_status = 'canceled',
        stripe_subscription_id = NULL,
        permission_level = 'FREE',
        monthly_submissions_limit = 2,
        updated_at = NOW()
    WHERE stripe_customer_id = p_stripe_customer_id;
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    IF v_affected_rows = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'affected_rows', v_affected_rows
    );
END;
$$;

-- Function to handle payment success
CREATE OR REPLACE FUNCTION handle_payment_success(
    p_stripe_customer_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_affected_rows INTEGER;
BEGIN
    -- Mark subscription as active
    UPDATE profiles 
    SET 
        is_subscribed = true,
        subscription_status = 'active',
        updated_at = NOW()
    WHERE stripe_customer_id = p_stripe_customer_id;
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    IF v_affected_rows = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'affected_rows', v_affected_rows
    );
END;
$$;

-- Function to handle payment failure
CREATE OR REPLACE FUNCTION handle_payment_failure(
    p_stripe_customer_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_affected_rows INTEGER;
BEGIN
    -- Mark subscription as past due
    UPDATE profiles 
    SET 
        is_subscribed = false,
        subscription_status = 'past_due',
        permission_level = 'FREE',
        monthly_submissions_limit = 2,
        updated_at = NOW()
    WHERE stripe_customer_id = p_stripe_customer_id;
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    IF v_affected_rows = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'affected_rows', v_affected_rows
    );
END;
$$;

-- Function to get subscription data
CREATE OR REPLACE FUNCTION get_subscription_data(
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_subscription RECORD;
BEGIN
    -- Get subscription data
    SELECT 
        is_subscribed,
        subscription_status,
        subscription_current_period_end,
        stripe_customer_id,
        stripe_subscription_id,
        permission_level,
        monthly_submissions_used,
        monthly_submissions_limit
    INTO v_subscription
    FROM profiles
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'subscription', row_to_json(v_subscription)
    );
END;
$$;

-- Function to check if user can make a submission (rate limiting)
CREATE OR REPLACE FUNCTION check_submission_limit(
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_profile RECORD;
    v_can_submit BOOLEAN;
    v_remaining INTEGER;
BEGIN
    -- Get user profile
    SELECT 
        monthly_submissions_used,
        monthly_submissions_limit,
        permission_level
    INTO v_profile
    FROM profiles
    WHERE id = p_user_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Check if user can submit
    v_can_submit := v_profile.monthly_submissions_used < v_profile.monthly_submissions_limit;
    v_remaining := v_profile.monthly_submissions_limit - v_profile.monthly_submissions_used;
    
    RETURN json_build_object(
        'success', true,
        'can_submit', v_can_submit,
        'remaining_submissions', v_remaining,
        'total_limit', v_profile.monthly_submissions_limit,
        'used_submissions', v_profile.monthly_submissions_used,
        'permission_level', v_profile.permission_level
    );
END;
$$;

-- Function to increment submission count
CREATE OR REPLACE FUNCTION increment_submission_count(
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_affected_rows INTEGER;
    v_new_count INTEGER;
BEGIN
    -- Increment submission count
    UPDATE profiles 
    SET 
        monthly_submissions_used = monthly_submissions_used + 1,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING monthly_submissions_used INTO v_new_count;
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    IF v_affected_rows = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'new_count', v_new_count
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_stripe_customer(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_subscription_status(TEXT, TEXT, subscription_status, TIMESTAMPTZ, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_subscription(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_payment_success(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_payment_failure(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_submission_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_submission_count(UUID) TO authenticated;

-- Also grant to service role for webhook operations
GRANT EXECUTE ON FUNCTION get_or_create_stripe_customer(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION update_subscription_status(TEXT, TEXT, subscription_status, TIMESTAMPTZ, BOOLEAN, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION cancel_subscription(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION handle_payment_success(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION handle_payment_failure(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_subscription_data(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION check_submission_limit(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION increment_submission_count(UUID) TO service_role;
