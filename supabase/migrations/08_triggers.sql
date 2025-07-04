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