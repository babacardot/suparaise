-- Email Triggers for Suparaise
-- Triggers to automatically send emails when certain events occur

-- Trigger function to send welcome email when user signs up
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send email for new profiles (signup)
  IF TG_OP = 'INSERT' THEN
    -- Call the welcome email function asynchronously
    PERFORM public.send_suparaise_welcome_email(
      NEW.email,
      COALESCE(NEW.full_name, NEW.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Create trigger on profiles table for new signups
CREATE TRIGGER welcome_email_trigger
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.send_welcome_email_trigger();

-- Trigger function to send subscription upgrade email
CREATE OR REPLACE FUNCTION public.send_subscription_upgrade_email_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send email when permission_level changes to PRO or MAX
  IF TG_OP = 'UPDATE' AND 
     OLD.permission_level <> NEW.permission_level AND
     NEW.permission_level IN ('PRO', 'MAX') THEN
    
    -- Call the subscription upgrade email function
    PERFORM public.send_subscription_upgrade_email(
      NEW.email,
      COALESCE(NEW.full_name, NEW.email),
      NEW.permission_level::TEXT
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Create trigger on profiles table for subscription upgrades
CREATE TRIGGER subscription_upgrade_email_trigger
AFTER UPDATE OF permission_level ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.send_subscription_upgrade_email_trigger(); 