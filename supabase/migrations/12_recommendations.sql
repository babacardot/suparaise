-- =================================================================
-- RECOMMENDATIONS REWORK (SINGLE TABLE & RPC)
-- =================================================================

-- 1. Create the single table to store recommendation state for each user
CREATE TABLE user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
    recommendation_key TEXT NOT NULL,
    text TEXT NOT NULL,
    priority INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, startup_id, recommendation_key)
);

-- 2. Indexes & RLS
CREATE INDEX idx_user_recommendations_user_startup ON user_recommendations(user_id, startup_id);
CREATE INDEX idx_user_recommendations_startup_id ON user_recommendations(startup_id);
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own recommendations" ON user_recommendations FOR ALL
USING ((select auth.uid()) = user_id);

-- 3. Timestamp trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_user_recommendations_timestamp
BEFORE UPDATE ON user_recommendations
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- 4. RPC function to dismiss a recommendation
CREATE OR REPLACE FUNCTION dismiss_startup_recommendation(
    p_startup_id UUID,
    p_recommendation_key TEXT
)
RETURNS JSONB AS $$
DECLARE
    user_id_var UUID := auth.uid();
BEGIN
    UPDATE user_recommendations
    SET is_dismissed = TRUE, dismissed_at = NOW()
    WHERE startup_id = p_startup_id
      AND user_id = user_id_var
      AND recommendation_key = p_recommendation_key;
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Main RPC function to get and sync recommendations
CREATE OR REPLACE FUNCTION get_startup_recommendations(
    p_startup_id UUID
)
RETURNS JSONB AS $$
DECLARE
    startup_info RECORD;
    user_id_var UUID;
    recommendations_list JSONB;
BEGIN
    -- Get startup and user info
    SELECT * INTO startup_info FROM startups s WHERE s.id = p_startup_id;

    IF NOT FOUND THEN
        RETURN '{"recommendations": [], "count": 0}'::jsonb;
    END IF;

    user_id_var := startup_info.user_id;

    -- Define all possible recommendations and their active status in a single CTE
    WITH master_recs (key, text, priority) AS (
        VALUES
            ('complete_onboarding', 'Complete your company profile to unlock more features.', 1),
            ('upload_pitch_deck', 'Upload your pitch deck to start applying to investors.', 2),
            ('add_logo', 'Add your company logo to make your profile stand out.', 3),
            ('add_website', 'Add your company website to build credibility with investors.', 3),
            ('add_short_desc', 'Add a compelling short description to improve your applications.', 4),
            ('add_founder_bio', 'Complete your founder bio to build a personal connection.', 4),
            ('add_founder_linkedin', 'Add your LinkedIn profile for professional validation.', 4),
            ('update_pitch_deck', 'Your pitch deck hasn''t been updated in over 45 days. Consider a refresh.', 5),
            ('add_competitors', 'Add your competitors to show your market awareness.', 6),
            ('start_applying', 'Start applying to investors to kick off your fundraising journey.', 7)
    ),
    recs_with_status AS (
        SELECT
            mr.key,
            mr.text,
            mr.priority,
            CASE
                WHEN (mr.key = 'complete_onboarding' AND NOT startup_info.onboarded) THEN TRUE
                WHEN (mr.key = 'upload_pitch_deck' AND startup_info.pitch_deck_url IS NULL) THEN TRUE
                WHEN (mr.key = 'add_logo' AND startup_info.logo_url IS NULL) THEN TRUE
                WHEN (mr.key = 'add_website' AND startup_info.website IS NULL) THEN TRUE
                WHEN (mr.key = 'add_short_desc' AND (startup_info.description_short IS NULL OR length(trim(startup_info.description_short)) < 50)) THEN TRUE
                WHEN (mr.key = 'update_pitch_deck' AND startup_info.pitch_deck_url IS NOT NULL AND startup_info.updated_at < (NOW() - INTERVAL '45 days')) THEN TRUE
                WHEN (mr.key = 'add_competitors' AND startup_info.competitors IS NULL) THEN TRUE
                WHEN (mr.key = 'start_applying' AND NOT EXISTS (SELECT 1 FROM submissions WHERE startup_id = p_startup_id)) THEN TRUE
                WHEN (mr.key = 'add_founder_bio' AND EXISTS (SELECT 1 FROM founders WHERE startup_id = p_startup_id AND (bio IS NULL OR length(trim(bio)) < 50))) THEN TRUE
                WHEN (mr.key = 'add_founder_linkedin' AND EXISTS (SELECT 1 FROM founders WHERE startup_id = p_startup_id AND linkedin IS NULL)) THEN TRUE
                ELSE FALSE
            END AS is_currently_active
        FROM master_recs mr
    ),
    -- Sync the user_recommendations table
    synced_recs AS (
        INSERT INTO user_recommendations (user_id, startup_id, recommendation_key, text, priority, is_active)
        SELECT
            user_id_var,
            p_startup_id,
            rws.key,
            rws.text,
            rws.priority,
            rws.is_currently_active
        FROM recs_with_status rws
        ON CONFLICT (user_id, startup_id, recommendation_key) DO UPDATE
        SET
            is_active = EXCLUDED.is_active,
            text = EXCLUDED.text,
            priority = EXCLUDED.priority,
            updated_at = NOW()
        RETURNING *
    )
    -- Finally, select the active and non-dismissed recommendations
    SELECT jsonb_agg(jsonb_build_object('key', sr.recommendation_key, 'text', sr.text) ORDER BY sr.priority)
    INTO recommendations_list
    FROM synced_recs sr
    WHERE sr.user_id = user_id_var
      AND sr.startup_id = p_startup_id
      AND sr.is_active = TRUE
      AND sr.is_dismissed = FALSE
    LIMIT 4;

    RETURN jsonb_build_object(
        'recommendations', COALESCE(recommendations_list, '[]'::jsonb),
        'count', jsonb_array_length(COALESCE(recommendations_list, '[]'::jsonb))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Function to get comprehensive dashboard data
CREATE OR REPLACE FUNCTION get_dashboard_data(p_startup_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    user_id_var UUID;
    profile_data JSONB;
    startup_data JSONB;
    submission_counts JSONB;
    recent_submissions_data JSONB;
    recommendations_data JSONB;
BEGIN
    SELECT user_id INTO user_id_var FROM startups WHERE id = p_startup_id;
    IF user_id_var IS NULL THEN
        RETURN jsonb_build_object('error', 'Startup not found');
    END IF;

    -- Get profile, startup, and submission data in parallel
    SELECT
        (SELECT jsonb_build_object(
            'monthly_submissions_used', p.monthly_submissions_used,
            'monthly_submissions_limit', p.monthly_submissions_limit,
            'permission_level', p.permission_level
        ) FROM profiles p WHERE p.id = user_id_var),
        (SELECT jsonb_build_object(
            'name', s.name,
            'pitch_deck_url', s.pitch_deck_url,
            'updated_at', s.updated_at
        ) FROM startups s WHERE s.id = p_startup_id),
        (SELECT jsonb_build_object(
            'total_applications',
                (SELECT COUNT(*) FROM submissions WHERE startup_id = p_startup_id) +
                (SELECT COUNT(*) FROM angel_submissions WHERE startup_id = p_startup_id) +
                (SELECT COUNT(*) FROM accelerator_submissions WHERE startup_id = p_startup_id)
        ))
    INTO profile_data, startup_data, submission_counts;

    -- Get recommendations and recent submissions with detailed information
    SELECT get_startup_recommendations(p_startup_id) INTO recommendations_data;
    SELECT fetch_recent_submissions_detailed(p_startup_id, 3) INTO recent_submissions_data;

    -- Build final result
    result := jsonb_build_object(
        'profile', profile_data,
        'startup', startup_data,
        'submission_counts', submission_counts,
        'recent_submissions', recent_submissions_data,
        'recommendations', recommendations_data->'recommendations',
        'success', true
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION dismiss_startup_recommendation(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_startup_recommendations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_data(UUID) TO authenticated; 