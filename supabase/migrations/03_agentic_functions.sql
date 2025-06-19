-- Function to get all data for a specific startup by user_id
CREATE OR REPLACE FUNCTION get_startup_data_by_user_id(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'website', s.website,
        'industry', s.industry,
        'location', s.location,
        'oneLiner', s.description_short,
        'description', s.description_long,
        'traction_summary', s.traction_summary,
        'market_summary', s.market_summary,
        'mrr', s.mrr,
        'arr', s.arr,
        'employee_count', s.employee_count,
        'logo_url', s.logo_url,
        'pitch_deck_url', s.pitch_deck_url,
        'intro_video_url', s.intro_video_url,
        'founders', (
            SELECT jsonb_agg(jsonb_build_object(
                'fullName', f.full_name,
                'email', f.email,
                'linkedin', f.linkedin,
                'bio', f.bio,
                'github_url', f.github_url,
                'personal_website_url', f.personal_website_url
            ))
            FROM founders f
            WHERE f.startup_id = s.id
        ),
        'commonResponses', (
            SELECT jsonb_object_agg(cr.question, cr.answer)
            FROM common_responses cr
            WHERE cr.startup_id = s.id
        )
    )
    INTO result
    FROM startups s
    WHERE s.user_id = p_user_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql; 