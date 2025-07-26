-- Email Triggers for Suparaise
-- Triggers to automatically send emails when certain events occur

-- =================================================================
-- WELCOME EMAIL TRIGGER
-- =================================================================

-- Step 1: Create the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Step 2: Create the pg_net extension in the net schema
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA net;

CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
  supabase_url text;
  service_role_key text;
BEGIN
  -- We shouldn't block the user creation process if the email fails.
  -- The Edge Function will handle its own errors.
  BEGIN
    -- Get configuration values
    supabase_url := secrets.get_config('supabase_url');
    service_role_key := secrets.get_config('service_role_key');
    
    -- Build function URL
    function_url := supabase_url || '/functions/v1/send-email';
    
    -- Use pg_net to make HTTP request to Edge Function
    SELECT INTO request_id net.http_post(
      url := function_url,
      body := jsonb_build_object(
        'emailType', 'welcome',
        'userEmail', NEW.email,
        'userName', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      )
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to send welcome email for user %: %', NEW.email, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, secrets, net, pg_temp;

-- Trigger to send welcome email when a new user signs up in auth.users
CREATE TRIGGER on_auth_user_created_send_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_trigger();

-- =================================================================
-- SUBMISSION COMPLETION TRIGGER
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_submission_completion_trigger()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
  supabase_url text;
  service_role_key text;
BEGIN
  -- If the submission status changes to 'completed' or 'failed'
  IF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status AND (NEW.status = 'completed' OR NEW.status = 'failed')) THEN
    
    -- Get configuration values
    supabase_url := secrets.get_config('supabase_url');
    service_role_key := secrets.get_config('service_role_key');
    function_url := supabase_url || '/functions/v1/send-email';
    
    BEGIN
      -- Invoke edge function to send email to the admin
      SELECT INTO request_id net.http_post(
        url := function_url,
        body := jsonb_build_object(
          'emailType', 'agent_completion_admin',
          'submissionId', NEW.id
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send admin completion email for submission %: %', NEW.id, SQLERRM;
    END;

    BEGIN
      -- Invoke edge function to send email to the customer
      SELECT INTO request_id net.http_post(
        url := function_url,
        body := jsonb_build_object(
          'emailType', 'agent_completion_customer',
          'submissionId', NEW.id
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send customer completion email for submission %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, secrets, net, pg_temp;

-- Create a trigger on the submissions table
CREATE TRIGGER on_submission_status_change
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_completion_trigger();

-- =================================================================
-- SUBMISSION START ADMIN NOTIFICATION TRIGGER
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_submission_start_admin_notification()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
  supabase_url text;
  service_role_key text;
BEGIN
  -- If the submission status changes to 'in_progress' (task starts)
  IF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status AND NEW.status = 'in_progress') THEN
    
    -- Get configuration values
    supabase_url := secrets.get_config('supabase_url');
    service_role_key := secrets.get_config('service_role_key');
    function_url := supabase_url || '/functions/v1/send-email';
    
    BEGIN
      -- Invoke edge function to send admin notification when task starts
      SELECT INTO request_id net.http_post(
        url := function_url,
        body := jsonb_build_object(
          'emailType', 'agent_submission_start_admin',
          'submissionId', NEW.id
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send admin start notification for submission %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, secrets, net, pg_temp;

-- Create a trigger on the submissions table for start notifications
CREATE TRIGGER on_submission_start_admin_notification
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_start_admin_notification();

-- =================================================================
-- EMAIL TRIGGERS FOR ANGEL AND ACCELERATOR SUBMISSIONS
-- =================================================================

-- Create completion triggers for angel submissions
CREATE TRIGGER on_angel_submission_status_change
  AFTER UPDATE ON public.angel_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_completion_trigger();

CREATE TRIGGER on_angel_submission_start_admin_notification
  AFTER UPDATE ON public.angel_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_start_admin_notification();

-- Create completion triggers for accelerator submissions  
CREATE TRIGGER on_accelerator_submission_status_change
  AFTER UPDATE ON public.accelerator_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_completion_trigger();

CREATE TRIGGER on_accelerator_submission_start_admin_notification
  AFTER UPDATE ON public.accelerator_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_start_admin_notification();

-- =================================================================
-- SUBMISSION COMPLETION TRACKING TRIGGERS
-- =================================================================

-- Function to increment submission count when any submission type is completed
CREATE OR REPLACE FUNCTION public.handle_submission_count_increment()
RETURNS TRIGGER AS $$
DECLARE
  user_id_to_increment UUID;
BEGIN
  -- Only increment when status changes to 'completed'
  IF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status AND NEW.status = 'completed') THEN
    
    -- Get the user_id for this submission
    SELECT s.user_id INTO user_id_to_increment
    FROM startups s
    WHERE s.id = NEW.startup_id;
    
    IF user_id_to_increment IS NOT NULL THEN
      BEGIN
        -- Increment the user's monthly submission count
        PERFORM increment_submission_count(user_id_to_increment);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to increment submission count for user %: %', user_id_to_increment, SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for all submission tables
CREATE TRIGGER on_submission_completion
  AFTER UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_count_increment();

CREATE TRIGGER on_angel_submission_completion
  AFTER UPDATE ON public.angel_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_count_increment();

CREATE TRIGGER on_accelerator_submission_completion
  AFTER UPDATE ON public.accelerator_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_count_increment();

-- Trigger function to send subscription upgrade email
CREATE OR REPLACE FUNCTION public.send_subscription_upgrade_email_trigger()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
  supabase_url text;
  service_role_key text;
BEGIN
  -- Only send email when permission_level changes to PRO or MAX
  IF TG_OP = 'UPDATE' AND 
     OLD.permission_level <> NEW.permission_level AND
     NEW.permission_level IN ('PRO', 'MAX') THEN
    
    -- Get configuration values
    supabase_url := secrets.get_config('supabase_url');
    service_role_key := secrets.get_config('service_role_key');
    function_url := supabase_url || '/functions/v1/send-email';
    
    BEGIN
      -- Call the subscription upgrade email function via edge function
      SELECT INTO request_id net.http_post(
        url := function_url,
        body := jsonb_build_object(
          'emailType', 'subscription_upgrade',
          'userEmail', NEW.email,
          'userName', COALESCE(NEW.full_name, NEW.email),
          'planName', NEW.permission_level::TEXT
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send subscription upgrade email for user %: %', NEW.email, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, secrets, net, pg_temp;

-- Create trigger on profiles table for subscription upgrades
CREATE TRIGGER subscription_upgrade_email_trigger
AFTER UPDATE OF permission_level ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.send_subscription_upgrade_email_trigger();

-- =================================================================
-- SUBMISSION QUOTA ENFORCEMENT TRIGGER
-- =================================================================

-- Function to check submission quota before inserting a new submission
CREATE OR REPLACE FUNCTION public.check_submission_quota()
RETURNS TRIGGER AS $$
DECLARE
    monthly_used INTEGER;
    monthly_limit INTEGER;
    user_id_of_startup UUID;
BEGIN
    -- Get the user_id from the startup_id of the new submission
    SELECT s.user_id INTO user_id_of_startup
    FROM public.startups s
    WHERE s.id = NEW.startup_id;

    -- If user_id is not found, let it pass (or handle as error)
    -- The foreign key constraint on startup_id should prevent this.
    IF user_id_of_startup IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get the user's quota from their profile
    SELECT p.monthly_submissions_used, p.monthly_submissions_limit
    INTO monthly_used, monthly_limit
    FROM public.profiles p
    WHERE p.id = user_id_of_startup;

    -- Check if the quota is exceeded
    IF monthly_used >= monthly_limit THEN
        RAISE EXCEPTION 'You have reached your monthly submission limit of % submissions.', monthly_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for all submission tables to check quota before insert
CREATE TRIGGER check_quota_before_insert_on_submissions
  BEFORE INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_submission_quota();

CREATE TRIGGER check_quota_before_insert_on_angel_submissions
  BEFORE INSERT ON public.angel_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_submission_quota();

CREATE TRIGGER check_quota_before_insert_on_accelerator_submissions
  BEFORE INSERT ON public.accelerator_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_submission_quota(); 