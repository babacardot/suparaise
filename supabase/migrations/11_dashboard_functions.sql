-- ==========================================
-- DASHBOARD RPC FUNCTIONS
-- Optimized functions for dashboard data retrieval
-- ==========================================

-- Function to get startup metadata for page title
CREATE OR REPLACE FUNCTION get_startup_metadata(
    p_startup_id UUID
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'name', COALESCE(name, 'Company'),
        'id', id
    ) INTO result
    FROM startups
    WHERE id = p_startup_id
    AND is_active = true;

    IF result IS NULL THEN
        result := jsonb_build_object(
            'name', 'Company',
            'id', NULL
        );
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Function to get profile submission limits and usage
CREATE OR REPLACE FUNCTION get_profile_submission_info(
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'monthly_submissions_used', monthly_submissions_used,
        'monthly_submissions_limit', monthly_submissions_limit,
        'permission_level', permission_level,
        'is_subscribed', is_subscribed,
        'subscription_status', subscription_status
    ) INTO result
    FROM profiles
    WHERE id = p_user_id
    AND is_active = true;

    IF result IS NULL THEN
        result := jsonb_build_object(
            'monthly_submissions_used', 0,
            'monthly_submissions_limit', 3,
            'permission_level', 'FREE',
            'is_subscribed', false,
            'subscription_status', null
        );
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Function to get total application counts for a startup
CREATE OR REPLACE FUNCTION get_total_applications_count(
    p_startup_id UUID
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    fund_count INTEGER := 0;
    angel_count INTEGER := 0;
    accelerator_count INTEGER := 0;
    total_count INTEGER := 0;
BEGIN
    -- Get counts for each type
    SELECT COUNT(*) INTO fund_count
    FROM submissions
    WHERE startup_id = p_startup_id;

    SELECT COUNT(*) INTO angel_count
    FROM angel_submissions
    WHERE startup_id = p_startup_id;

    SELECT COUNT(*) INTO accelerator_count
    FROM accelerator_submissions
    WHERE startup_id = p_startup_id;

    total_count := fund_count + angel_count + accelerator_count;

    result := jsonb_build_object(
        'fund_submissions', fund_count,
        'angel_submissions', angel_count,
        'accelerator_submissions', accelerator_count,
        'total_applications', total_count
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_startup_metadata(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_submission_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_applications_count(UUID) TO authenticated;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_startups_user_id_active ON startups(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(id, is_active);
CREATE INDEX IF NOT EXISTS idx_submissions_startup_count ON submissions(startup_id) WHERE startup_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angel_submissions_startup_count ON angel_submissions(startup_id) WHERE startup_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerator_submissions_startup_count ON accelerator_submissions(startup_id) WHERE startup_id IS NOT NULL;

-- Update table statistics
ANALYZE startups;
ANALYZE profiles;
ANALYZE submissions;
ANALYZE angel_submissions;
ANALYZE accelerator_submissions; 