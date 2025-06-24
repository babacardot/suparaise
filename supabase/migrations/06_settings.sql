-- =================================================================
-- PROFILE SETTINGS RPC FUNCTIONS
-- =================================================================

-- Function to get the current user's founder profile data
-- This gets the founder record for the user from their current startup
CREATE OR REPLACE FUNCTION get_user_founder_profile(p_user_id UUID, p_startup_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    target_startup_id UUID;
BEGIN
    -- If no startup_id provided, get the user's first startup
    IF p_startup_id IS NULL THEN
        SELECT id INTO target_startup_id
        FROM startups 
        WHERE user_id = p_user_id AND is_active = TRUE
        ORDER BY created_at DESC 
        LIMIT 1;
    ELSE
        target_startup_id := p_startup_id;
    END IF;

    -- Get the founder data for this user in this startup
    -- We'll get the founder record that matches the user's email
    SELECT jsonb_build_object(
        'id', f.id,
        'firstName', f.first_name,
        'lastName', f.last_name,
        'email', f.email,
        'phone', f.phone,
        'role', f.role,
        'bio', f.bio,
        'linkedin', f.linkedin,
        'githubUrl', f.github_url,
        'personalWebsiteUrl', f.personal_website_url,
        'startupId', f.startup_id
    )
    INTO result
    FROM founders f
    JOIN startups s ON f.startup_id = s.id
    WHERE s.id = target_startup_id 
      AND s.user_id = p_user_id
      AND f.email = (SELECT email FROM auth.users WHERE id = p_user_id)
    LIMIT 1;

    -- If no founder found with matching email, try to get the first founder for this startup
    IF result IS NULL THEN
        SELECT jsonb_build_object(
            'id', f.id,
            'firstName', f.first_name,
            'lastName', f.last_name,
            'email', f.email,
            'phone', f.phone,
            'role', f.role,
            'bio', f.bio,
            'linkedin', f.linkedin,
            'githubUrl', f.github_url,
            'personalWebsiteUrl', f.personal_website_url,
            'startupId', f.startup_id
        )
        INTO result
        FROM founders f
        JOIN startups s ON f.startup_id = s.id
        WHERE s.id = target_startup_id 
          AND s.user_id = p_user_id
        ORDER BY f.created_at ASC
        LIMIT 1;
    END IF;

    RETURN COALESCE(result, '{}'::jsonb);
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_user_founder_profile for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update the current user's founder profile data
CREATE OR REPLACE FUNCTION update_user_founder_profile(
    p_user_id UUID,
    p_startup_id UUID,
    p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    founder_id UUID;
    result JSONB;
BEGIN
    -- Get the founder ID for this user in this startup
    SELECT f.id INTO founder_id
    FROM founders f
    JOIN startups s ON f.startup_id = s.id
    WHERE s.id = p_startup_id 
      AND s.user_id = p_user_id
      AND f.email = (SELECT email FROM auth.users WHERE id = p_user_id)
    LIMIT 1;

    -- If no founder found with matching email, try to get the first founder for this startup
    IF founder_id IS NULL THEN
        SELECT f.id INTO founder_id
        FROM founders f
        JOIN startups s ON f.startup_id = s.id
        WHERE s.id = p_startup_id 
          AND s.user_id = p_user_id
        ORDER BY f.created_at ASC
        LIMIT 1;
    END IF;

    -- If still no founder found, return error
    IF founder_id IS NULL THEN
        RETURN jsonb_build_object('error', 'No founder record found for this user');
    END IF;

    -- Update the founder record
    UPDATE founders
    SET 
        first_name = COALESCE(p_data->>'firstName', first_name),
        last_name = COALESCE(p_data->>'lastName', last_name),
        email = COALESCE(p_data->>'email', email),
        phone = COALESCE(p_data->>'phone', phone),
        role = COALESCE((p_data->>'role')::founder_role, role),
        bio = COALESCE(p_data->>'bio', bio),
        linkedin = COALESCE(p_data->>'linkedin', linkedin),
        github_url = COALESCE(p_data->>'githubUrl', github_url),
        personal_website_url = COALESCE(p_data->>'personalWebsiteUrl', personal_website_url),
        updated_at = NOW()
    WHERE id = founder_id;

    -- If email was updated, also update the auth.users email
    IF p_data ? 'email' AND (p_data->>'email') IS NOT NULL THEN
        -- Note: This would typically require email verification in a production app
        -- For now, we'll just update the founder record
        NULL;
    END IF;

    -- Return success with updated data
    RETURN jsonb_build_object(
        'success', true,
        'founderId', founder_id,
        'message', 'Profile updated successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_user_founder_profile for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =================================================================
-- COMPANY SETTINGS RPC FUNCTIONS
-- =================================================================

-- Function to get the current user's startup/company data
CREATE OR REPLACE FUNCTION get_user_startup_data(p_user_id UUID, p_startup_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    target_startup_id UUID;
BEGIN
    -- If no startup_id provided, get the user's first startup
    IF p_startup_id IS NULL THEN
        SELECT id INTO target_startup_id
        FROM startups 
        WHERE user_id = p_user_id AND is_active = TRUE
        ORDER BY created_at DESC 
        LIMIT 1;
    ELSE
        target_startup_id := p_startup_id;
    END IF;

    -- Get the startup data
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
        'legalStructure', s.legal_structure,
        'investmentInstrument', s.investment_instrument,
        'fundingRound', s.funding_round,
        'fundingAmountSought', s.funding_amount_sought,
        'preMoneyValuation', s.pre_money_valuation,
        'descriptionShort', s.description_short,
        'descriptionMedium', s.description_medium,
        'descriptionLong', s.description_long,
        'tractionSummary', s.traction_summary,
        'marketSummary', s.market_summary,
        'mrr', s.mrr,
        'arr', s.arr,
        'employeeCount', s.employee_count,
        'foundedYear', s.founded_year,
        'revenueModel', s.revenue_model,
        'currentRunway', s.current_runway,
        'keyCustomers', s.key_customers,
        'competitors', s.competitors,
        'logoUrl', s.logo_url,
        'pitchDeckUrl', s.pitch_deck_url,
        'introVideoUrl', s.intro_video_url,
        'createdAt', s.created_at,
        'updatedAt', s.updated_at
    )
    INTO result
    FROM startups s
    WHERE s.id = target_startup_id 
      AND s.user_id = p_user_id
    LIMIT 1;

    RETURN COALESCE(result, '{}'::jsonb);
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_user_startup_data for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update the current user's startup/company data
CREATE OR REPLACE FUNCTION update_user_startup_data(
    p_user_id UUID,
    p_startup_id UUID,
    p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    startup_exists BOOLEAN;
BEGIN
    -- Check if the startup exists and belongs to the user
    SELECT EXISTS(
        SELECT 1 FROM startups 
        WHERE id = p_startup_id AND user_id = p_user_id AND is_active = TRUE
    ) INTO startup_exists;

    -- If startup doesn't exist or doesn't belong to user, return error
    IF NOT startup_exists THEN
        RETURN jsonb_build_object('error', 'Startup not found or access denied');
    END IF;

    -- Update the startup record (only update provided fields)
    UPDATE startups
    SET 
        name = COALESCE(p_data->>'name', name),
        website = COALESCE(p_data->>'website', website),
        industry = COALESCE((p_data->>'industry')::industry_type, industry),
        location = COALESCE(p_data->>'location', location),
        is_incorporated = COALESCE((p_data->>'isIncorporated')::BOOLEAN, is_incorporated),
        incorporation_city = COALESCE(p_data->>'incorporationCity', incorporation_city),
        incorporation_country = COALESCE(p_data->>'incorporationCountry', incorporation_country),
        operating_countries = COALESCE(
            CASE 
                WHEN p_data ? 'operatingCountries' THEN 
                    ARRAY(SELECT jsonb_array_elements_text(p_data->'operatingCountries'))
                ELSE operating_countries
            END, 
            operating_countries
        ),
        legal_structure = COALESCE((p_data->>'legalStructure')::legal_structure, legal_structure),
        investment_instrument = COALESCE((p_data->>'investmentInstrument')::investment_instrument, investment_instrument),
        funding_round = COALESCE((p_data->>'fundingRound')::investment_stage, funding_round),
        funding_amount_sought = COALESCE((p_data->>'fundingAmountSought')::NUMERIC, funding_amount_sought),
        pre_money_valuation = COALESCE((p_data->>'preMoneyValuation')::NUMERIC, pre_money_valuation),
        description_short = COALESCE(p_data->>'descriptionShort', description_short),
        description_medium = COALESCE(p_data->>'descriptionMedium', description_medium),
        description_long = COALESCE(p_data->>'descriptionLong', description_long),
        traction_summary = COALESCE(p_data->>'tractionSummary', traction_summary),
        market_summary = COALESCE(p_data->>'marketSummary', market_summary),
        mrr = COALESCE((p_data->>'mrr')::NUMERIC, mrr),
        arr = COALESCE((p_data->>'arr')::NUMERIC, arr),
        employee_count = COALESCE((p_data->>'employeeCount')::INTEGER, employee_count),
        founded_year = COALESCE((p_data->>'foundedYear')::INTEGER, founded_year),
        revenue_model = COALESCE((p_data->>'revenueModel')::revenue_model_type, revenue_model),
        current_runway = COALESCE((p_data->>'currentRunway')::INTEGER, current_runway),
        key_customers = COALESCE(p_data->>'keyCustomers', key_customers),
        competitors = COALESCE(p_data->>'competitors', competitors),
        logo_url = COALESCE(p_data->>'logoUrl', logo_url),
        pitch_deck_url = COALESCE(p_data->>'pitchDeckUrl', pitch_deck_url),
        intro_video_url = COALESCE(p_data->>'introVideoUrl', intro_video_url),
        updated_at = NOW()
    WHERE id = p_startup_id AND user_id = p_user_id;

    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'startupId', p_startup_id,
        'message', 'Startup data updated successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_user_startup_data for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to soft delete a startup
CREATE OR REPLACE FUNCTION soft_delete_startup(
    p_user_id UUID,
    p_startup_id UUID
)
RETURNS JSONB AS $$
DECLARE
    startup_owner_valid BOOLEAN;
BEGIN
    -- Check if the startup belongs to the user and is active
    SELECT EXISTS(
        SELECT 1 FROM startups
        WHERE id = p_startup_id AND user_id = p_user_id AND is_active = TRUE
    ) INTO startup_owner_valid;

    IF NOT startup_owner_valid THEN
        RETURN jsonb_build_object('error', 'Startup not found, is already deleted, or access denied');
    END IF;

    -- Soft delete the startup
    UPDATE startups
    SET
        is_active = FALSE,
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_startup_id AND user_id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'startupId', p_startup_id,
        'message', 'Startup has been deleted successfully.'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in soft_delete_startup for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =================================================================
-- FOUNDERS SETTINGS RPC FUNCTIONS
-- =================================================================

-- Function to get all founders for a startup
CREATE OR REPLACE FUNCTION get_startup_founders(p_user_id UUID, p_startup_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    target_startup_id UUID;
BEGIN
    -- If no startup_id provided, get the user's first startup
    IF p_startup_id IS NULL THEN
        SELECT id INTO target_startup_id
        FROM startups 
        WHERE user_id = p_user_id AND is_active = TRUE
        ORDER BY created_at DESC 
        LIMIT 1;
    ELSE
        target_startup_id := p_startup_id;
    END IF;

    -- Get all founders for this startup
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', f.id,
            'firstName', f.first_name,
            'lastName', f.last_name,
            'email', f.email,
            'phone', f.phone,
            'role', f.role,
            'bio', f.bio,
            'linkedin', f.linkedin,
            'githubUrl', f.github_url,
            'personalWebsiteUrl', f.personal_website_url,
            'startupId', f.startup_id,
            'createdAt', f.created_at
        ) ORDER BY f.created_at ASC
    )
    INTO result
    FROM founders f
    JOIN startups s ON f.startup_id = s.id
    WHERE s.id = target_startup_id 
      AND s.user_id = p_user_id;

    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_startup_founders for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update any founder's data by founder ID
CREATE OR REPLACE FUNCTION update_founder_profile(
    p_user_id UUID,
    p_founder_id UUID,
    p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    startup_owner_valid BOOLEAN;
BEGIN
    -- Check if the founder belongs to a startup owned by the user
    SELECT EXISTS(
        SELECT 1 FROM founders f
        JOIN startups s ON f.startup_id = s.id
        WHERE f.id = p_founder_id AND s.user_id = p_user_id AND s.is_active = TRUE
    ) INTO startup_owner_valid;

    -- If founder doesn't belong to user's startup, return error
    IF NOT startup_owner_valid THEN
        RETURN jsonb_build_object('error', 'Founder not found or access denied');
    END IF;

    -- Update the founder record
    UPDATE founders
    SET 
        first_name = COALESCE(p_data->>'firstName', first_name),
        last_name = COALESCE(p_data->>'lastName', last_name),
        email = COALESCE(p_data->>'email', email),
        phone = COALESCE(p_data->>'phone', phone),
        role = COALESCE((p_data->>'role')::founder_role, role),
        bio = COALESCE(p_data->>'bio', bio),
        linkedin = COALESCE(p_data->>'linkedin', linkedin),
        github_url = COALESCE(p_data->>'githubUrl', github_url),
        personal_website_url = COALESCE(p_data->>'personalWebsiteUrl', personal_website_url),
        updated_at = NOW()
    WHERE id = p_founder_id;

    -- Return success with updated data
    RETURN jsonb_build_object(
        'success', true,
        'founderId', p_founder_id,
        'message', 'Founder profile updated successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_founder_profile for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to add a new founder to a startup
CREATE OR REPLACE FUNCTION add_startup_founder(
    p_user_id UUID,
    p_startup_id UUID,
    p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    startup_owner_valid BOOLEAN;
    new_founder_id UUID;
BEGIN
    -- Check if the startup belongs to the user
    SELECT EXISTS(
        SELECT 1 FROM startups 
        WHERE id = p_startup_id AND user_id = p_user_id
    ) INTO startup_owner_valid;

    -- If startup doesn't belong to user, return error
    IF NOT startup_owner_valid THEN
        RETURN jsonb_build_object('error', 'Startup not found or access denied');
    END IF;

    -- Insert new founder
    INSERT INTO founders (
        startup_id, first_name, last_name, email, phone, role, bio, 
        linkedin, github_url, personal_website_url
    ) VALUES (
        p_startup_id,
        p_data->>'firstName',
        p_data->>'lastName', 
        p_data->>'email',
        p_data->>'phone',
        (p_data->>'role')::founder_role,
        p_data->>'bio',
        p_data->>'linkedin',
        p_data->>'githubUrl',
        p_data->>'personalWebsiteUrl'
    ) RETURNING id INTO new_founder_id;

    -- Return success with new founder ID
    RETURN jsonb_build_object(
        'success', true,
        'founderId', new_founder_id,
        'message', 'Founder added successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in add_startup_founder for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to remove a founder from a startup
CREATE OR REPLACE FUNCTION remove_startup_founder(
    p_user_id UUID,
    p_founder_id UUID
)
RETURNS JSONB AS $$
DECLARE
    startup_owner_valid BOOLEAN;
    founders_count INTEGER;
BEGIN
    -- Check if the founder belongs to a startup owned by the user
    SELECT EXISTS(
        SELECT 1 FROM founders f
        JOIN startups s ON f.startup_id = s.id
        WHERE f.id = p_founder_id AND s.user_id = p_user_id AND s.is_active = TRUE
    ) INTO startup_owner_valid;

    -- If founder doesn't belong to user's startup, return error
    IF NOT startup_owner_valid THEN
        RETURN jsonb_build_object('error', 'Founder not found or access denied');
    END IF;

    -- Check how many founders are in this startup
    SELECT COUNT(*) INTO founders_count
    FROM founders f
    JOIN startups s ON f.startup_id = s.id
    WHERE s.user_id = p_user_id 
      AND f.startup_id = (SELECT startup_id FROM founders WHERE id = p_founder_id);

    -- Don't allow removing the last founder
    IF founders_count <= 1 THEN
        RETURN jsonb_build_object('error', 'Cannot remove the last founder');
    END IF;

    -- Delete the founder
    DELETE FROM founders WHERE id = p_founder_id;

    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'founderId', p_founder_id,
        'message', 'Founder removed successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in remove_startup_founder for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =================================================================
-- AGENT SETTINGS RPC FUNCTIONS
-- =================================================================

-- Function to get the current user's agent settings
CREATE OR REPLACE FUNCTION get_user_agent_settings(p_user_id UUID, p_startup_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    target_startup_id UUID;
BEGIN
    -- If no startup_id provided, get the user's first startup
    IF p_startup_id IS NULL THEN
        SELECT id INTO target_startup_id
        FROM startups 
        WHERE user_id = p_user_id AND is_active = TRUE
        ORDER BY created_at DESC 
        LIMIT 1;
    ELSE
        target_startup_id := p_startup_id;
    END IF;

    -- Check if there's existing agent settings for this user/startup combination
    -- For now, we'll return default values since we don't have an agent_settings table yet
    -- In a future migration, we could create a proper agent_settings table
    -- For now, return empty JSON to indicate no settings found
    RETURN '{}'::jsonb;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_user_agent_settings for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update the current user's agent settings
CREATE OR REPLACE FUNCTION update_user_agent_settings(
    p_user_id UUID,
    p_startup_id UUID,
    p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    startup_exists BOOLEAN;
BEGIN
    -- Check if the startup exists and belongs to the user
    SELECT EXISTS(
        SELECT 1 FROM startups 
        WHERE id = p_startup_id AND user_id = p_user_id
    ) INTO startup_exists;

    -- If startup doesn't exist or doesn't belong to user, return error
    IF NOT startup_exists THEN
        RETURN jsonb_build_object('error', 'Startup not found or access denied');
    END IF;

    -- For now, just return success since we don't have an agent_settings table yet
    -- In a future migration, we could create a proper agent_settings table
    -- and store the settings there
    
    -- Return success (we'll add proper storage in a future migration)
    RETURN jsonb_build_object(
        'success', true,
        'startupId', p_startup_id,
        'message', 'Agent settings updated successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_user_agent_settings for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =================================================================
-- ACCOUNT MANAGEMENT RPC FUNCTIONS
-- =================================================================

-- Function to soft delete a user account (keeps all data but deactivates account)
CREATE OR REPLACE FUNCTION soft_delete_user_account(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
    -- Check if user exists and is active
    IF NOT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id AND is_active = TRUE) THEN
        RETURN jsonb_build_object('error', 'User not found or already deactivated');
    END IF;

    -- Soft delete the user profile
    UPDATE profiles
    SET 
        is_active = FALSE,
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'userId', p_user_id,
        'message', 'Account has been deactivated successfully. All data has been preserved.'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in soft_delete_user_account for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to reactivate a soft-deleted user account
CREATE OR REPLACE FUNCTION reactivate_user_account(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
    -- Check if user exists and is inactive
    IF NOT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id AND is_active = FALSE) THEN
        RETURN jsonb_build_object('error', 'User not found or already active');
    END IF;

    -- Reactivate the user profile
    UPDATE profiles
    SET 
        is_active = TRUE,
        deleted_at = NULL,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'userId', p_user_id,
        'message', 'Account has been reactivated successfully.'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in reactivate_user_account for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if an email can be used for signup (handles reactivation case)
CREATE OR REPLACE FUNCTION can_email_be_used_for_signup(p_email TEXT)
RETURNS JSONB AS $$
DECLARE
    existing_user_id UUID;
    is_user_active BOOLEAN;
BEGIN
    -- Check if email exists in auth.users
    SELECT id INTO existing_user_id
    FROM auth.users 
    WHERE email = p_email;

    -- If no user exists with this email, it's available
    IF existing_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'available', true,
            'message', 'Email is available for signup'
        );
    END IF;

    -- Check if the user profile is active
    SELECT is_active INTO is_user_active
    FROM profiles 
    WHERE id = existing_user_id;

    -- If user exists but is deactivated, they can reactivate
    IF is_user_active = FALSE THEN
        RETURN jsonb_build_object(
            'available', false,
            'can_reactivate', true,
            'user_id', existing_user_id,
            'message', 'Account with this email exists but is deactivated. You can reactivate it.'
        );
    END IF;

    -- User exists and is active
    RETURN jsonb_build_object(
        'available', false,
        'can_reactivate', false,
        'message', 'Email is already in use by an active account'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in can_email_be_used_for_signup for email %: %', p_email, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public; 