-- =================================================================
-- ONBOARDING RPC FUNCTIONS
-- =================================================================

-- Creates a new startup and its associated founders in a single transaction
-- This startup will have onboarded=TRUE since it's completing the full onboarding process
CREATE OR REPLACE FUNCTION create_startup_and_founders(p_data JSONB)
RETURNS JSONB AS $$
DECLARE
    new_startup_id UUID;
    founder_data JSONB;
    result JSONB;
BEGIN
    -- Insert into startups table
    INSERT INTO startups (
        user_id, name, website, industry, location, is_incorporated,
        incorporation_city, incorporation_country, operating_countries,
        legal_structure, investment_instrument, funding_round, funding_amount_sought,
        pre_money_valuation, description_short, description_medium, description_long,
        traction_summary, market_summary, mrr, arr, employee_count,
        founded_year, revenue_model, current_runway, 
        key_customers, competitors,
        logo_url, pitch_deck_url, intro_video_url, onboarded
    )
    VALUES (
        (p_data->>'user_id')::UUID,
        p_data->>'name',
        p_data->>'website',
        (p_data->>'industry')::industry_type,
        p_data->>'location',
        (p_data->>'is_incorporated')::BOOLEAN,
        p_data->>'incorporation_city',
        p_data->>'incorporation_country',
        string_to_array(p_data->>'operating_countries', ','),
        (p_data->>'legal_structure')::legal_structure,
        (p_data->>'investment_instrument')::investment_instrument,
        (p_data->>'funding_round')::investment_stage,
        (p_data->>'funding_amount_sought')::NUMERIC,
        (p_data->>'pre_money_valuation')::NUMERIC,
        p_data->>'description_short',
        p_data->>'description_medium',
        p_data->>'description_long',
        p_data->>'traction_summary',
        p_data->>'market_summary',
        (p_data->>'mrr')::NUMERIC,
        (p_data->>'arr')::NUMERIC,
        (p_data->>'employee_count')::INTEGER,
        (p_data->>'founded_year')::INTEGER,
        (p_data->>'revenue_model')::revenue_model_type,
        (p_data->>'current_runway')::INTEGER,
        p_data->>'key_customers',
        p_data->>'competitors',
        p_data->>'logo_url',
        p_data->>'pitch_deck_url',
        p_data->>'intro_video_url',
        TRUE -- Mark this startup as onboarded since it's completing the full process
    )
    RETURNING id INTO new_startup_id;

    -- Insert founders if the array exists in the payload
    IF p_data ? 'founders' THEN
        FOR founder_data IN SELECT * FROM jsonb_array_elements(p_data->'founders')
        LOOP
            INSERT INTO founders (
                startup_id, first_name, last_name, role, bio, email, phone,
                linkedin, github_url, personal_website_url
            )
            VALUES (
                new_startup_id,
                founder_data->>'firstName',
                founder_data->>'lastName',
                (founder_data->>'role')::founder_role,
                founder_data->>'bio',
                founder_data->>'email',
                founder_data->>'phone',
                founder_data->>'linkedin',
                founder_data->>'githubUrl',
                founder_data->>'personalWebsiteUrl'
            );
        END LOOP;
    END IF;

    -- Return the new startup ID as a JSON object
    SELECT jsonb_build_object('id', new_startup_id) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enhanced function to get user profile with startup data
-- This version is optimized for the dashboard layout requirements with a single JOIN query
CREATE OR REPLACE FUNCTION get_user_profile_with_startup(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    profile_data JSONB;
    startup_data JSONB;
BEGIN
    -- Get profile data
    SELECT jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email
    )
    INTO profile_data
    FROM profiles p
    WHERE p.id = p_user_id;

    -- Get startup data if it exists, including logo_url
    SELECT jsonb_build_object(
        'name', s.name,
        'id', s.id,
        'logo_url', s.logo_url
    )
    INTO startup_data
    FROM startups s
    WHERE s.user_id = p_user_id
    LIMIT 1;

    -- Combine into a single result
    RETURN jsonb_build_object(
        'profile', profile_data,
        'startup', startup_data
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_user_profile_with_startup for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object(
            'profile', null,
            'startup', null,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if user needs to create their first startup or if any startup needs onboarding
CREATE OR REPLACE FUNCTION check_user_onboarding_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    startup_exists BOOLEAN;
    profile_name TEXT;
    has_incomplete_startups BOOLEAN;
BEGIN
    -- Check if user has any startups
    SELECT EXISTS(
        SELECT 1 FROM startups WHERE user_id = p_user_id
    ) INTO startup_exists;

    -- Check if user has any startups that need onboarding
    SELECT EXISTS(
        SELECT 1 FROM startups WHERE user_id = p_user_id AND onboarded = FALSE
    ) INTO has_incomplete_startups;

    -- Get profile info
    SELECT full_name INTO profile_name
    FROM profiles
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'needsOnboarding', NOT startup_exists OR has_incomplete_startups,
        'profileName', COALESCE(profile_name, ''),
        'hasStartup', startup_exists,
        'hasIncompleteStartups', has_incomplete_startups
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =================================================================
-- MULTI-STARTUP FUNCTIONS
-- =================================================================

-- Function to get all startups for a user (including onboarding status)
CREATE OR REPLACE FUNCTION get_user_startups(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'logo_url', s.logo_url,
            'onboarded', s.onboarded,
            'created_at', s.created_at
        ) ORDER BY s.created_at DESC
    )
    INTO result
    FROM startups s
    WHERE s.user_id = p_user_id;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to switch active startup (for session management)
CREATE OR REPLACE FUNCTION get_startup_by_id(p_startup_id UUID, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Verify the startup belongs to the user
    SELECT jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'logo_url', s.logo_url,
        'website', s.website,
        'industry', s.industry,
        'location', s.location,
        'funding_round', s.funding_round,
        'description_short', s.description_short
    )
    INTO result
    FROM startups s
    WHERE s.id = p_startup_id AND s.user_id = p_user_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public; 