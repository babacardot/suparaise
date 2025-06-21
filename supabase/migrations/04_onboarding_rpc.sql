-- =================================================================
-- ONBOARDING RPC FUNCTIONS
-- =================================================================

-- This function creates a new startup and its associated founders
-- in a single transaction. This ensures that we don't end up with
-- orphaned startup records if founder creation fails.
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
        logo_url, pitch_deck_url, intro_video_url
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
        p_data->>'logo_url',
        p_data->>'pitch_deck_url',
        p_data->>'intro_video_url'
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

    -- Update the user's profile to mark them as onboarded
    UPDATE public.profiles
    SET onboarded = TRUE
    WHERE id = (p_data->>'user_id')::UUID;

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
    -- Get profile data, including the new 'onboarded' flag
    SELECT jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email,
        'onboarded', p.onboarded
    )
    INTO profile_data
    FROM profiles p
    WHERE p.id = p_user_id;

    -- Get startup data if it exists
    SELECT jsonb_build_object(
        'name', s.name,
        'id', s.id
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

-- Create a faster lightweight version for onboarding checks
CREATE OR REPLACE FUNCTION check_user_onboarding_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    startup_exists BOOLEAN;
    profile_name TEXT;
BEGIN
    -- Check if startup exists (faster than full data fetch)
    SELECT EXISTS(
        SELECT 1 FROM startups WHERE user_id = p_user_id
    ) INTO startup_exists;

    -- Get profile name
    SELECT full_name INTO profile_name
    FROM profiles
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'needsOnboarding', NOT startup_exists,
        'profileName', COALESCE(profile_name, ''),
        'hasStartup', startup_exists
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public; 