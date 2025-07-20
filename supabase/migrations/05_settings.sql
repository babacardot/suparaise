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
        'financialProjectionsUrl', s.financial_projections_url,
        'businessPlanUrl', s.business_plan_url,
        'googleDriveUrl', s.google_drive_url,
        'hyperbrowserSessionId', s.hyperbrowser_session_id,
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
        logo_url = CASE 
            WHEN p_data ? 'logoUrl' THEN p_data->>'logoUrl'
            ELSE logo_url 
        END,
        pitch_deck_url = CASE 
            WHEN p_data ? 'pitchDeckUrl' THEN p_data->>'pitchDeckUrl'
            ELSE pitch_deck_url 
        END,
        intro_video_url = CASE 
            WHEN p_data ? 'introVideoUrl' THEN p_data->>'introVideoUrl'
            ELSE intro_video_url 
        END,
        financial_projections_url = CASE
            WHEN p_data ? 'financialProjectionsUrl' THEN p_data->>'financialProjectionsUrl'
            ELSE financial_projections_url
        END,
        business_plan_url = CASE
            WHEN p_data ? 'businessPlanUrl' THEN p_data->>'businessPlanUrl'
            ELSE business_plan_url
        END,
        google_drive_url = CASE
            WHEN p_data ? 'googleDriveUrl' THEN p_data->>'googleDriveUrl'
            ELSE google_drive_url
        END,
        hyperbrowser_session_id = CASE
            WHEN p_data ? 'hyperbrowserSessionId' THEN p_data->>'hyperbrowserSessionId'
            ELSE hyperbrowser_session_id
        END,
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
    user_permission permission_level;
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

    -- Get user's permission level
    SELECT permission_level INTO user_permission
    FROM profiles
    WHERE id = p_user_id AND is_active = TRUE;

    -- Get the agent settings for this user/startup combination
    SELECT jsonb_build_object(
        'submissionDelay', ags.submission_delay::text::integer,
        'maxParallelSubmissions', ags.max_parallel_submissions::text::integer,
        'maxQueueSize', ags.max_queue_size,
        'preferredTone', CASE 
            WHEN user_permission IN ('PRO', 'MAX') THEN ags.preferred_tone
            ELSE 'professional'
        END,
        'enableDebugMode', CASE 
            WHEN user_permission = 'MAX' THEN ags.debug_mode
            ELSE false
        END,
        'enableStealth', ags.stealth,
        'customInstructions', ags.custom_instructions,
        'permissionLevel', user_permission
    )
    INTO result
    FROM agent_settings ags
    WHERE ags.startup_id = target_startup_id 
      AND ags.user_id = p_user_id;

    -- If no settings found, return defaults based on permission level
    IF result IS NULL THEN
        result := jsonb_build_object(
            'submissionDelay', 30,
            'maxParallelSubmissions', CASE 
                WHEN user_permission = 'FREE' THEN 1
                WHEN user_permission = 'PRO' THEN 3
                WHEN user_permission = 'MAX' THEN 5
                ELSE 1
            END,
            'maxQueueSize', CASE 
                WHEN user_permission = 'FREE' THEN 3
                WHEN user_permission = 'PRO' THEN 25
                WHEN user_permission = 'MAX' THEN 50
                ELSE 3
            END,
            'preferredTone', CASE 
                WHEN user_permission IN ('PRO', 'MAX') THEN 'professional'
                ELSE 'professional'
            END,
            'enableDebugMode', CASE 
                WHEN user_permission = 'MAX' THEN false
                ELSE false
            END,
            'enableStealth', true,
            'customInstructions', '',
            'permissionLevel', user_permission
        );
    ELSE
        -- Add permission level to existing result
        result := result || jsonb_build_object('permissionLevel', user_permission);
    END IF;

    RETURN result;

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
    user_permission permission_level;
    settings_exist BOOLEAN;
    max_parallel_allowed INTEGER;
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

    -- Get user's permission level
    SELECT permission_level INTO user_permission
    FROM profiles
    WHERE id = p_user_id AND is_active = TRUE;

    -- Set max parallel submissions and queue size based on permission level
    max_parallel_allowed := CASE 
        WHEN user_permission = 'FREE' THEN 1
        WHEN user_permission = 'PRO' THEN 3
        WHEN user_permission = 'MAX' THEN 35 -- Allow enterprise-level for MAX users
        ELSE 1
    END;

    -- Validate max parallel submissions doesn't exceed permission limit
    -- For MAX users, allow enterprise values (15, 25, 35) but validate they're valid enum values
    IF p_data ? 'maxParallelSubmissions' THEN
        DECLARE
            requested_parallel INTEGER;
            valid_enterprise_values INTEGER[] := ARRAY[1, 3, 5, 15, 25, 35];
        BEGIN
            requested_parallel := (p_data->>'maxParallelSubmissions')::INTEGER;
            
            -- For non-MAX users, enforce strict limits
            IF user_permission != 'MAX' AND requested_parallel > max_parallel_allowed THEN
                RETURN jsonb_build_object(
                    'error', 
                    format('Maximum parallel submissions exceeded. Your plan allows up to %s.', max_parallel_allowed)
                );
            END IF;
            
            -- For MAX users, ensure the value is in our allowed list
            IF user_permission = 'MAX' AND requested_parallel > 5 THEN
                IF NOT (requested_parallel = ANY(valid_enterprise_values)) THEN
                    RETURN jsonb_build_object(
                        'error', 
                        'Invalid parallel submissions value. Enterprise values must be 15, 25, or 35.'
                    );
                END IF;
            END IF;
        END;
    END IF;

    -- Validate max queue size based on permission level
    IF p_data ? 'maxQueueSize' THEN
        DECLARE
            max_queue_allowed INTEGER;
        BEGIN
            max_queue_allowed := CASE 
                WHEN user_permission = 'FREE' THEN 3
                WHEN user_permission = 'PRO' THEN 25
                WHEN user_permission = 'MAX' THEN 50
                ELSE 3
            END;
            
            IF (p_data->>'maxQueueSize')::INTEGER > max_queue_allowed THEN
                RETURN jsonb_build_object(
                    'error', 
                    format('Maximum queue size exceeded. Your plan allows up to %s queued applications.', max_queue_allowed)
                );
            END IF;
        END;
    END IF;

    -- Validate premium features based on permission level
    IF p_data ? 'preferredTone' AND user_permission NOT IN ('PRO', 'MAX') THEN
        RETURN jsonb_build_object(
            'error', 
            'Tone selection is only available for PRO and MAX users. Please upgrade your plan.'
        );
    END IF;

    IF p_data ? 'enableDebugMode' AND user_permission != 'MAX' THEN
        RETURN jsonb_build_object(
            'error', 
            'Debug mode is only available for MAX users. Please upgrade your plan.'
        );
    END IF;

    -- Check if settings already exist
    SELECT EXISTS(
        SELECT 1 FROM agent_settings 
        WHERE startup_id = p_startup_id AND user_id = p_user_id
    ) INTO settings_exist;

    IF settings_exist THEN
        -- Update existing settings (only update fields that are present in p_data)
        UPDATE agent_settings
        SET 
            submission_delay = CASE 
                WHEN p_data ? 'submissionDelay' THEN (p_data->>'submissionDelay')::agent_submission_delay
                ELSE submission_delay
            END,
            max_parallel_submissions = CASE 
                WHEN p_data ? 'maxParallelSubmissions' THEN (p_data->>'maxParallelSubmissions')::agent_parallel_submissions
                ELSE max_parallel_submissions
            END,
            max_queue_size = CASE 
                WHEN p_data ? 'maxQueueSize' THEN (p_data->>'maxQueueSize')::INTEGER
                ELSE max_queue_size
            END,
            preferred_tone = CASE 
                WHEN user_permission IN ('PRO', 'MAX') AND p_data ? 'preferredTone' 
                THEN (p_data->>'preferredTone')::agent_tone
                ELSE preferred_tone
            END,
            debug_mode = CASE 
                WHEN user_permission = 'MAX' AND p_data ? 'enableDebugMode' 
                THEN (p_data->>'enableDebugMode')::BOOLEAN
                ELSE debug_mode
            END,
            stealth = CASE 
                WHEN p_data ? 'enableStealth' THEN (p_data->>'enableStealth')::BOOLEAN
                ELSE stealth
            END,
            custom_instructions = CASE 
                WHEN p_data ? 'customInstructions' THEN p_data->>'customInstructions'
                ELSE custom_instructions
            END,
            updated_at = NOW()
        WHERE startup_id = p_startup_id AND user_id = p_user_id;
    ELSE
        -- Insert new settings
        INSERT INTO agent_settings (
            startup_id, user_id, submission_delay, 
            max_parallel_submissions, max_queue_size, preferred_tone,
            debug_mode, stealth, custom_instructions
        ) VALUES (
            p_startup_id, p_user_id,
            CASE 
                WHEN p_data ? 'submissionDelay' THEN (p_data->>'submissionDelay')::agent_submission_delay
                ELSE '30'::agent_submission_delay
            END,
            CASE 
                WHEN p_data ? 'maxParallelSubmissions' THEN (p_data->>'maxParallelSubmissions')::agent_parallel_submissions
                ELSE CASE 
                    WHEN user_permission = 'FREE' THEN '1'::agent_parallel_submissions
                    WHEN user_permission = 'PRO' THEN '3'::agent_parallel_submissions
                    WHEN user_permission = 'MAX' THEN '5'::agent_parallel_submissions
                    ELSE '1'::agent_parallel_submissions
                END
            END,
            CASE 
                WHEN p_data ? 'maxQueueSize' THEN (p_data->>'maxQueueSize')::INTEGER
                ELSE CASE 
                    WHEN user_permission = 'FREE' THEN 3
                    WHEN user_permission = 'PRO' THEN 25
                    WHEN user_permission = 'MAX' THEN 50
                    ELSE 3
                END
            END,
            CASE 
                WHEN user_permission IN ('PRO', 'MAX') AND p_data ? 'preferredTone' 
                THEN (p_data->>'preferredTone')::agent_tone
                ELSE 'professional'
            END,
            CASE 
                WHEN user_permission = 'MAX' AND p_data ? 'enableDebugMode' 
                THEN (p_data->>'enableDebugMode')::BOOLEAN
                ELSE false
            END,
            CASE 
                WHEN p_data ? 'enableStealth' THEN (p_data->>'enableStealth')::BOOLEAN
                ELSE true
            END,
            CASE 
                WHEN p_data ? 'customInstructions' THEN p_data->>'customInstructions'
                ELSE ''
            END
        );
    END IF;
    
    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'startupId', p_startup_id,
        'message', 'Agent settings updated successfully',
        'permissionLevel', user_permission,
        'maxParallelAllowed', max_parallel_allowed
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

-- Function to archive and delete a user account (preserves data but clears constraints)
CREATE OR REPLACE FUNCTION soft_delete_user_account(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    startup_ids UUID[];
BEGIN
    -- Check if user exists and is active
    IF NOT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id AND is_active = TRUE) THEN
        RETURN jsonb_build_object('error', 'User not found or already deleted');
    END IF;

    -- Get all startup IDs for this user
    SELECT ARRAY(SELECT id FROM startups WHERE user_id = p_user_id AND is_active = TRUE) INTO startup_ids;

    -- STEP 1: Archive all data before deletion
    
    -- Archive agent settings
    INSERT INTO agent_settings_archive (
        id, startup_id, user_id, submission_delay, max_parallel_submissions,
        preferred_tone, debug_mode, stealth, custom_instructions,
        created_at, updated_at, original_id, original_startup_id, original_user_id
    )
    SELECT 
        gen_random_uuid(), startup_id, user_id, submission_delay, max_parallel_submissions,
        preferred_tone, debug_mode, stealth, custom_instructions,
        created_at, updated_at, id, startup_id, user_id
    FROM agent_settings 
    WHERE user_id = p_user_id;

    -- Archive submissions
    INSERT INTO submissions_archive (
        id, startup_id, target_id, submission_date, status, agent_notes, created_at,
        original_id, original_startup_id
    )
    SELECT 
        gen_random_uuid(), startup_id, target_id, submission_date, status, agent_notes, created_at,
        id, startup_id
    FROM submissions 
    WHERE startup_id = ANY(startup_ids);

    -- Archive angel submissions
    INSERT INTO angel_submissions_archive (
        id, startup_id, angel_id, submission_date, status, agent_notes, created_at,
        original_id, original_startup_id
    )
    SELECT 
        gen_random_uuid(), startup_id, angel_id, submission_date, status, agent_notes, created_at,
        id, startup_id
    FROM angel_submissions 
    WHERE startup_id = ANY(startup_ids);

    -- Archive accelerator submissions
    INSERT INTO accelerator_submissions_archive (
        id, startup_id, accelerator_id, submission_date, status, agent_notes, created_at,
        original_id, original_startup_id
    )
    SELECT 
        gen_random_uuid(), startup_id, accelerator_id, submission_date, status, agent_notes, created_at,
        id, startup_id
    FROM accelerator_submissions 
    WHERE startup_id = ANY(startup_ids);

    -- Archive founders
    INSERT INTO founders_archive (
        id, startup_id, first_name, last_name, role, bio, email, phone,
        linkedin, github_url, personal_website_url, twitter_url,
        created_at, updated_at, original_id, original_startup_id
    )
    SELECT 
        gen_random_uuid(), startup_id, first_name, last_name, role, bio, email, phone,
        linkedin, github_url, personal_website_url, twitter_url,
        created_at, updated_at, id, startup_id
    FROM founders 
    WHERE startup_id = ANY(startup_ids);

    -- Archive startups
    INSERT INTO startups_archive (
        id, user_id, name, website, industry, location, is_incorporated,
        incorporation_city, incorporation_country, operating_countries,
        legal_structure, investment_instrument, funding_round, funding_amount_sought,
        pre_money_valuation, description_short, description_medium, description_long,
        traction_summary, market_summary, mrr, arr, employee_count, founded_year,
        revenue_model, current_runway, key_customers, competitors, onboarded,
        is_active, deleted_at, logo_url, pitch_deck_url, intro_video_url,
        financial_projections_url, business_plan_url, google_drive_url,
        hyperbrowser_session_id,
        created_at, updated_at, original_id, original_user_id
    )
    SELECT 
        gen_random_uuid(), user_id, name, website, industry, location, is_incorporated,
        incorporation_city, incorporation_country, operating_countries,
        legal_structure, investment_instrument, funding_round, funding_amount_sought,
        pre_money_valuation, description_short, description_medium, description_long,
        traction_summary, market_summary, mrr, arr, employee_count, founded_year,
        revenue_model, current_runway, key_customers, competitors, onboarded,
        is_active, deleted_at, logo_url, pitch_deck_url, intro_video_url,
        financial_projections_url, business_plan_url, google_drive_url,
        hyperbrowser_session_id,
        created_at, updated_at, id, user_id
    FROM startups 
    WHERE user_id = p_user_id AND is_active = TRUE;

    -- Archive profile
    INSERT INTO profiles_archive (
        id, full_name, email, is_subscribed, is_active, deleted_at,
        stripe_customer_id, stripe_subscription_id, subscription_status,
        subscription_current_period_end, permission_level, monthly_submissions_used,
        monthly_submissions_limit, created_at, updated_at, original_id
    )
    SELECT 
        gen_random_uuid(), full_name, email, is_subscribed, is_active, deleted_at,
        stripe_customer_id, stripe_subscription_id, subscription_status,
        subscription_current_period_end, permission_level, monthly_submissions_used,
        monthly_submissions_limit, created_at, updated_at, id
    FROM profiles 
    WHERE id = p_user_id;

    -- STEP 2: Hard delete all live data (in proper order for foreign key constraints)
    
    -- Delete submissions first
    DELETE FROM submissions WHERE startup_id = ANY(startup_ids);
    DELETE FROM angel_submissions WHERE startup_id = ANY(startup_ids);
    DELETE FROM accelerator_submissions WHERE startup_id = ANY(startup_ids);
    
    -- Delete agent settings
    DELETE FROM agent_settings WHERE user_id = p_user_id;
    
    -- Delete founders
    DELETE FROM founders WHERE startup_id = ANY(startup_ids);
    
    -- Delete startups
    DELETE FROM startups WHERE user_id = p_user_id;
    
    -- Delete profile
    DELETE FROM profiles WHERE id = p_user_id;

    -- Return success with archive info
    RETURN jsonb_build_object(
        'success', true,
        'userId', p_user_id,
        'message', 'Account deleted and data archived successfully.',
        'archivedStartups', array_length(startup_ids, 1),
        'archiveTimestamp', NOW()
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

-- Function to retrieve archived user data (for compliance/recovery)
CREATE OR REPLACE FUNCTION get_archived_user_data(p_original_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Get archived data
    SELECT jsonb_build_object(
        'profile', (
            SELECT jsonb_build_object(
                'id', original_id,
                'full_name', full_name,
                'email', email,
                'archived_at', archived_at,
                'archived_reason', archived_reason
            )
            FROM profiles_archive 
            WHERE original_id = p_original_user_id
            LIMIT 1
        ),
        'startups', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', original_id,
                    'name', name,
                    'website', website,
                    'industry', industry,
                    'archived_at', archived_at
                )
            )
            FROM startups_archive 
            WHERE original_user_id = p_original_user_id
        ),
        'founders_count', (
            SELECT COUNT(*)
            FROM founders_archive fa
            JOIN startups_archive sa ON fa.original_startup_id = sa.original_id
            WHERE sa.original_user_id = p_original_user_id
        )
    ) INTO result;

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions for all settings functions
GRANT EXECUTE ON FUNCTION get_user_founder_profile(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_founder_profile(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_startup_data(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_startup_data(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_startup(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_startup_founders(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_founder_profile(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION add_startup_founder(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_startup_founder(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_agent_settings(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_agent_settings(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_email_be_used_for_signup(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_archived_user_data(UUID) TO authenticated;

-- =================================================================
-- QUEUE MANAGEMENT RPC FUNCTIONS
-- =================================================================

-- Function to get current queue status for a startup
CREATE OR REPLACE FUNCTION get_queue_status(p_user_id UUID, p_startup_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    target_startup_id UUID;
    current_in_progress INTEGER;
    current_queued INTEGER;
    agent_settings_data JSONB;
    max_parallel INTEGER;
    max_queue INTEGER;
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

    -- Get agent settings to know limits
    SELECT get_user_agent_settings(p_user_id, target_startup_id) INTO agent_settings_data;
    max_parallel := (agent_settings_data->>'maxParallelSubmissions')::INTEGER;
    max_queue := (agent_settings_data->>'maxQueueSize')::INTEGER;

    -- Count current in-progress submissions
    SELECT COUNT(*) INTO current_in_progress
    FROM submissions
    WHERE startup_id = target_startup_id 
      AND status = 'in_progress';

    -- Count current queued submissions
    SELECT COUNT(*) INTO current_queued
    FROM submissions
    WHERE startup_id = target_startup_id 
      AND status = 'pending'
      AND queue_position IS NOT NULL;

    -- Build result
    result := jsonb_build_object(
        'maxParallel', max_parallel,
        'maxQueue', max_queue,
        'currentInProgress', current_in_progress,
        'currentQueued', current_queued,
        'availableSlots', GREATEST(0, max_parallel - current_in_progress),
        'availableQueueSlots', GREATEST(0, max_queue - current_queued),
        'canSubmitMore', (current_in_progress < max_parallel) OR (current_queued < max_queue)
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_queue_status for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to add a submission to the queue
DROP FUNCTION IF EXISTS public.queue_submission(UUID, UUID, UUID);
CREATE OR REPLACE FUNCTION queue_submission(
    p_user_id UUID,
    p_startup_id UUID,
    p_target_id UUID,
    p_hyperbrowser_job_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    submission_id UUID;
    existing_submission RECORD;
    queue_status_data JSONB;
    current_in_progress INTEGER;
    max_parallel INTEGER;
    next_queue_position INTEGER;
    submission_status submission_status;
BEGIN
    -- Check if submission already exists and is not failed
    SELECT id, status INTO existing_submission
    FROM submissions
    WHERE startup_id = p_startup_id AND target_id = p_target_id;

    IF existing_submission.id IS NOT NULL THEN
        IF existing_submission.status = 'failed' THEN
            -- Allow retry for failed submissions by deleting the old one
            DELETE FROM submissions WHERE id = existing_submission.id;
        ELSE
            RETURN jsonb_build_object('error', 'A submission for this target is already ' || existing_submission.status);
        END IF;
    END IF;

    -- Get queue status to determine if we should queue or process immediately
    SELECT get_queue_status(p_user_id, p_startup_id) INTO queue_status_data;
    current_in_progress := (queue_status_data->>'currentInProgress')::INTEGER;
    max_parallel := (queue_status_data->>'maxParallel')::INTEGER;

    -- Determine if we should start processing immediately or queue
    IF current_in_progress < max_parallel THEN
        -- Start processing immediately
        submission_status := 'in_progress';
        INSERT INTO submissions (startup_id, target_id, status, started_at, hyperbrowser_job_id)
        VALUES (p_startup_id, p_target_id, submission_status, NOW(), p_hyperbrowser_job_id)
        RETURNING id INTO submission_id;

        RETURN jsonb_build_object(
            'success', true,
            'submissionId', submission_id,
            'status', 'in_progress',
            'message', 'Submission is now being processed by the agent.'
        );
    ELSE
        -- Add to queue
        submission_status := 'pending';
        
        -- Get next queue position
        SELECT COALESCE(MAX(queue_position), 0) + 1 INTO next_queue_position
        FROM submissions
        WHERE startup_id = p_startup_id AND queue_position IS NOT NULL;

        INSERT INTO submissions (startup_id, target_id, status, queue_position, queued_at)
        VALUES (p_startup_id, p_target_id, submission_status, next_queue_position, NOW())
        RETURNING id INTO submission_id;

        RETURN jsonb_build_object(
            'success', true,
            'submissionId', submission_id,
            'status', 'queued',
            'queuePosition', next_queue_position,
            'message', 'Submission added to queue at position ' || next_queue_position
        );
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in queue_submission for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to process the next item in queue (moves from queued to processing)
CREATE OR REPLACE FUNCTION process_next_queued_submission(p_startup_id UUID)
RETURNS JSONB AS $$
DECLARE
    next_submission UUID;
    queue_pos INTEGER;
BEGIN
    -- Find the next queued submission (lowest queue_position)
    SELECT id, queue_position INTO next_submission, queue_pos
    FROM submissions
    WHERE startup_id = p_startup_id 
      AND status = 'pending'
      AND queue_position IS NOT NULL
    ORDER BY queue_position ASC
    LIMIT 1;

    IF next_submission IS NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'No queued submissions to process'
        );
    END IF;

    -- Move submission from queued to processing
    UPDATE submissions
    SET 
        status = 'pending',
        queue_position = NULL,
        queued_at = NULL,
        started_at = NOW()
    WHERE id = next_submission;

    RETURN jsonb_build_object(
        'success', true,
        'submissionId', next_submission,
        'previousQueuePosition', queue_pos,
        'message', 'Submission moved from queue to processing'
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in process_next_queued_submission for startup %: %', p_startup_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get all submissions with queue info for a startup
CREATE OR REPLACE FUNCTION get_submissions_with_queue(p_user_id UUID, p_startup_id UUID DEFAULT NULL)
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

    -- Get all submissions with queue information
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'targetId', s.target_id,
            'targetName', t.name,
            'status', s.status,
            'queuePosition', s.queue_position,
            'queuedAt', s.queued_at,
            'startedAt', s.started_at,
            'submissionDate', s.submission_date,
            'agentNotes', s.agent_notes,
            'createdAt', s.created_at
        ) ORDER BY 
            CASE 
                WHEN s.status = 'in_progress' THEN 1
                WHEN s.status = 'pending' AND s.queue_position IS NULL THEN 2
                WHEN s.status = 'pending' AND s.queue_position IS NOT NULL THEN 3 + s.queue_position
                ELSE 999
            END
    )
    INTO result
    FROM submissions s
    JOIN targets t ON s.target_id = t.id
    WHERE s.startup_id = target_startup_id;

    RETURN COALESCE(result, '[]'::jsonb);

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_submissions_with_queue for user %: %', p_user_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permissions for queue management functions
GRANT EXECUTE ON FUNCTION get_queue_status(UUID, UUID) TO authenticated;
DROP FUNCTION IF EXISTS public.queue_submission(UUID, UUID, UUID);
GRANT EXECUTE ON FUNCTION queue_submission(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_next_queued_submission(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_submissions_with_queue(UUID, UUID) TO authenticated; 

-- New function to update submission status from Hyperbrowser result
CREATE OR REPLACE FUNCTION public.update_submission_status(
    p_submission_id UUID,
    p_new_status submission_status,
    p_agent_notes TEXT
)
RETURNS JSONB AS $$
DECLARE
  current_submission RECORD;
BEGIN
    -- Check if the submission exists
    SELECT * INTO current_submission FROM submissions WHERE id = p_submission_id;

    IF current_submission IS NULL THEN
        RETURN jsonb_build_object('error', 'Submission not found');
    END IF;

    -- Update the submission record
    UPDATE submissions
    SET
        status = p_new_status,
        agent_notes = p_agent_notes,
        updated_at = NOW()
    WHERE id = p_submission_id;

    -- Increment user's submission count if completed successfully
    /* IF p_new_status = 'completed' THEN
      PERFORM increment_submission_count(
        (SELECT user_id FROM startups WHERE id = current_submission.startup_id)
      );
    END IF; */

    RETURN jsonb_build_object(
        'success', true,
        'submissionId', p_submission_id,
        'message', 'Submission status updated successfully.'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_submission_status for submission %: %', p_submission_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION update_submission_status(UUID, submission_status, TEXT) TO authenticated;

-- New function to update angel submission status
CREATE OR REPLACE FUNCTION public.update_angel_submission_status(
    p_submission_id UUID,
    p_new_status submission_status,
    p_agent_notes TEXT
)
RETURNS JSONB AS $$
DECLARE
  current_submission RECORD;
BEGIN
    -- Check if the submission exists
    SELECT * INTO current_submission FROM angel_submissions WHERE id = p_submission_id;

    IF current_submission IS NULL THEN
        RETURN jsonb_build_object('error', 'Angel submission not found');
    END IF;

    -- Update the submission record
    UPDATE angel_submissions
    SET
        status = p_new_status,
        agent_notes = p_agent_notes,
        updated_at = NOW()
    WHERE id = p_submission_id;

    -- Increment user's submission count if completed successfully
    /* IF p_new_status = 'completed' THEN
      PERFORM increment_submission_count(
        (SELECT user_id FROM startups WHERE id = current_submission.startup_id)
      );
    END IF; */

    RETURN jsonb_build_object(
        'success', true,
        'submissionId', p_submission_id,
        'message', 'Angel submission status updated successfully.'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_angel_submission_status for submission %: %', p_submission_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION update_angel_submission_status(UUID, submission_status, TEXT) TO authenticated;

-- New function to update accelerator submission status
CREATE OR REPLACE FUNCTION public.update_accelerator_submission_status(
    p_submission_id UUID,
    p_new_status submission_status,
    p_agent_notes TEXT
)
RETURNS JSONB AS $$
DECLARE
  current_submission RECORD;
BEGIN
    -- Check if the submission exists
    SELECT * INTO current_submission FROM accelerator_submissions WHERE id = p_submission_id;

    IF current_submission IS NULL THEN
        RETURN jsonb_build_object('error', 'Accelerator submission not found');
    END IF;

    -- Update the submission record
    UPDATE accelerator_submissions
    SET
        status = p_new_status,
        agent_notes = p_agent_notes,
        updated_at = NOW()
    WHERE id = p_submission_id;

    -- Increment user's submission count if completed successfully
    /* IF p_new_status = 'completed' THEN
      PERFORM increment_submission_count(
        (SELECT user_id FROM startups WHERE id = current_submission.startup_id)
      );
    END IF; */

    RETURN jsonb_build_object(
        'success', true,
        'submissionId', p_submission_id,
        'message', 'Accelerator submission status updated successfully.'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in update_accelerator_submission_status for submission %: %', p_submission_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION update_accelerator_submission_status(UUID, submission_status, TEXT) TO authenticated;

-- New function to get a submission's details, including the job_id
CREATE OR REPLACE FUNCTION public.get_submission_details(p_submission_id UUID)
RETURNS JSONB AS $$
DECLARE
    submission_details JSONB;
BEGIN
    SELECT json_build_object(
        'id', s.id,
        'status', s.status,
        'agent_notes', s.agent_notes,
        'hyperbrowser_job_id', s.hyperbrowser_job_id
    )
    INTO submission_details
    FROM submissions s
    WHERE s.id = p_submission_id
    AND (select auth.uid()) = (SELECT user_id FROM startups WHERE id = s.startup_id);

    IF submission_details IS NULL THEN
        RETURN jsonb_build_object('error', 'Submission not found or access denied');
    END IF;

    RETURN submission_details;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_submission_details for submission %: %', p_submission_id, SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_submission_details(UUID) TO authenticated; 