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
        'isIncorporated', s.is_incorporated,
        'incorporationCity', s.incorporation_city,
        'incorporationCountry', s.incorporation_country,
        'operatingCountries', s.operating_countries,
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
                'phone', f.phone,
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

-- ==========================================
-- PROFILE FUNCTIONS
-- ==========================================

-- Function to get profile by user ID
CREATE OR REPLACE FUNCTION get_profile_by_id(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT to_jsonb(p.*)
    INTO result
    FROM profiles p
    WHERE p.id = p_user_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile
CREATE OR REPLACE FUNCTION update_profile(p_user_id UUID, p_full_name TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    UPDATE profiles 
    SET 
        full_name = COALESCE(p_full_name, full_name)
    WHERE id = p_user_id
    RETURNING to_jsonb(profiles.*) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get user profile with startup data
CREATE OR REPLACE FUNCTION get_user_profile_with_startup(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'profile', (
            SELECT to_jsonb(p.*)
            FROM profiles p
            WHERE p.id = p_user_id
        ),
        'startup', (
            SELECT jsonb_build_object(
                'name', s.name
            )
            FROM startups s
            WHERE s.user_id = p_user_id
        )
    )
    INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TARGET FUNCTIONS
-- ==========================================

-- Function to get all targets
CREATE OR REPLACE FUNCTION get_all_targets()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(to_jsonb(t.*) ORDER BY t.name)
    INTO result
    FROM targets t;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function to get target by ID
CREATE OR REPLACE FUNCTION get_target_by_id(p_target_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT to_jsonb(t.*)
    INTO result
    FROM targets t
    WHERE t.id = p_target_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to search targets by name or notes
CREATE OR REPLACE FUNCTION search_targets(p_query TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(to_jsonb(t.*) ORDER BY t.name)
    INTO result
    FROM targets t
    WHERE t.name ILIKE '%' || p_query || '%' 
       OR t.notes ILIKE '%' || p_query || '%';

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function to filter targets by stages, industries, and regions
CREATE OR REPLACE FUNCTION filter_targets(
    p_stages TEXT[] DEFAULT NULL,
    p_industries TEXT[] DEFAULT NULL,
    p_regions TEXT[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(to_jsonb(t.*) ORDER BY t.name)
    INTO result
    FROM targets t
    WHERE (p_stages IS NULL OR t.stage_focus && p_stages::investment_stage[])
      AND (p_industries IS NULL OR t.industry_focus && p_industries::industry_type[])
      AND (p_regions IS NULL OR t.region_focus && p_regions);

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- STARTUP FUNCTIONS
-- ==========================================

-- Function to create a new startup
CREATE OR REPLACE FUNCTION create_startup(p_startup_data JSONB)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    INSERT INTO startups (
        user_id,
        name,
        website,
        industry,
        location,
        is_incorporated,
        incorporation_city,
        incorporation_country,
        operating_countries,
        description_short,
        description_medium,
        description_long,
        traction_summary,
        market_summary,
        mrr,
        arr,
        employee_count,
        logo_url,
        pitch_deck_url,
        intro_video_url
    )
    VALUES (
        (p_startup_data->>'user_id')::UUID,
        p_startup_data->>'name',
        p_startup_data->>'website',
        (p_startup_data->>'industry')::industry_type,
        p_startup_data->>'location',
        (p_startup_data->>'is_incorporated')::BOOLEAN,
        p_startup_data->>'incorporation_city',
        p_startup_data->>'incorporation_country',
        string_to_array(p_startup_data->>'operating_countries', ','),
        p_startup_data->>'description_short',
        p_startup_data->>'description_medium',
        p_startup_data->>'description_long',
        p_startup_data->>'traction_summary',
        p_startup_data->>'market_summary',
        (p_startup_data->>'mrr')::NUMERIC,
        (p_startup_data->>'arr')::NUMERIC,
        (p_startup_data->>'employee_count')::INTEGER,
        p_startup_data->>'logo_url',
        p_startup_data->>'pitch_deck_url',
        p_startup_data->>'intro_video_url'
    )
    RETURNING to_jsonb(startups.*) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update startup
CREATE OR REPLACE FUNCTION update_startup(p_startup_id UUID, p_updates JSONB)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    UPDATE startups 
    SET 
        name = COALESCE((p_updates->>'name'), name),
        website = COALESCE((p_updates->>'website'), website),
        industry = COALESCE((p_updates->>'industry')::industry_type, industry),
        location = COALESCE((p_updates->>'location'), location),
        is_incorporated = COALESCE((p_updates->>'is_incorporated')::BOOLEAN, is_incorporated),
        incorporation_city = COALESCE((p_updates->>'incorporation_city'), incorporation_city),
        incorporation_country = COALESCE((p_updates->>'incorporation_country'), incorporation_country),
        operating_countries = COALESCE(string_to_array(p_updates->>'operating_countries', ','), operating_countries),
        description_short = COALESCE((p_updates->>'description_short'), description_short),
        description_medium = COALESCE((p_updates->>'description_medium'), description_medium),
        description_long = COALESCE((p_updates->>'description_long'), description_long),
        traction_summary = COALESCE((p_updates->>'traction_summary'), traction_summary),
        market_summary = COALESCE((p_updates->>'market_summary'), market_summary),
        mrr = COALESCE((p_updates->>'mrr')::NUMERIC, mrr),
        arr = COALESCE((p_updates->>'arr')::NUMERIC, arr),
        employee_count = COALESCE((p_updates->>'employee_count')::INTEGER, employee_count),
        logo_url = COALESCE((p_updates->>'logo_url'), logo_url),
        pitch_deck_url = COALESCE((p_updates->>'pitch_deck_url'), pitch_deck_url),
        intro_video_url = COALESCE((p_updates->>'intro_video_url'), intro_video_url),
        updated_at = NOW()
    WHERE id = p_startup_id
    RETURNING to_jsonb(startups.*) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql; 