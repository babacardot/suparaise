-- Suparaise Email Functions Migration

-- Function to send welcome email when user signs up
CREATE OR REPLACE FUNCTION public.send_suparaise_welcome_email(user_email TEXT, user_name TEXT)
RETURNS void AS $$
DECLARE
  resend_api_key TEXT;
  email_subject TEXT := 'Let''s get you started !';
  email_content TEXT;
  email_html TEXT;
  response_status INTEGER;
  response_body TEXT;
  first_name TEXT;
BEGIN
  RAISE NOTICE 'Starting send_suparaise_welcome_email for user: % (%)', user_name, user_email;

  -- Extract first name
  first_name := CASE
    WHEN user_name LIKE '% %' THEN split_part(user_name, ' ', 1)
    ELSE user_name
  END;

  -- Get the Resend API key securely
  BEGIN
    resend_api_key := secrets.get_suparaise_resend_api_key();
    RAISE NOTICE 'Successfully retrieved Suparaise Resend API key';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to get Suparaise Resend API key: %', SQLERRM;
    RETURN;
  END;

  -- Compose the email content (plain text)
  email_content := format(E'Hello %s,

Welcome to suparaise.com! We''re thrilled to have you on board. What started as a CLI experiment has evolved into both a product and a mission: building the world''s most powerful fundraising automation platform. We''ve built AI agents to empower founders like you to raise capital efficiently while focusing on what matters most: growing your business.

Here''s how you can get started:

1. Go through the onboarding process
2. Browse our database of 2,000+ funds, angels, and accelerators
3. Let agents automatically apply to the investors you like while you focus on acquiring customers

We''ve designed Suparaise to be exceptionally user-friendly, with different tiers (Pro and Max) that can adapt to your specific needs and budget.

Research shows that most founders apply to fewer than 50 funds during their fundraising process. With Suparaise, you can achieve this same volume in days through parallel submissions at just $0.60 per application. Our intelligent queuing system allows you to run agents concurrently and queue up to 50 applications as background jobs.

Access your dashboard at https://suparaise.com/dashboard to get started now.

This is an automated email, but if you need any help or there''s anything we could do to improve Suparaise for you, our team is at your entire disposal — we read all emails and will respond to anything you send us, anytime.

Making fundraising effortless and phenomenal for founders is our number one priority.

Best regards,

Babacar Diop
Founder @ Suparaise

---

Follow us:

X: https://x.com/suparaise
PH: https://www.producthunt.com/posts/suparaise',
    first_name
  );

  -- Compose HTML email content (plain style matching text version)
  email_html := format('
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Let''s get you started !</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; }
    .content { line-height: 1.6; }
    p { margin-bottom: 15px; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hello %s,</p>
      
      <p>Welcome to suparaise.com! We''re thrilled to have you on board. What started as a CLI experiment has evolved into both a product and a mission: building the world''s most powerful fundraising automation platform. We''ve built AI agents to empower founders like you to raise capital efficiently while focusing on what matters most: growing your business.</p>
      
      <p>Here''s how you can get started:</p>
      
      <p>1. Go through the onboarding process</p>
      
      <p>2. Browse our database of 2,000+ funds, angels, and accelerators</p>
      
      <p>3. Let agents automatically apply to the investors you like while you focus on acquiring customers</p>
      
      <p>We''ve designed Suparaise to be exceptionally user-friendly, with different tiers (Pro and Max) that can adapt to your specific needs and budget.</p>
      
      <p>Research shows that most founders apply to fewer than 50 funds during their fundraising process. With Suparaise, you can achieve this same volume in days through parallel submissions at just $0.60 per application. Our intelligent queuing system allows you to run agents concurrently and queue up to 50 applications as background jobs.</p>
      
      <p>Access your dashboard at <a href="https://suparaise.com/dashboard">https://suparaise.com/dashboard</a> to get started now.</p>
      
      <p>This is an automated email, but if you need any help or there''s anything we could do to improve Suparaise for you, our team is at your entire disposal — we read all emails and will respond to anything you send us, anytime.</p>
      
      <p>Making fundraising effortless and phenomenal for founders is our number one priority.</p>
      
      <p>Best regards,</p>
      
      <p>Babacar Diop</p>
      
      <p>Founder @ Suparaise</p>
      
      <p>---</p>
      
      <p>Follow us:</p>
      
      <p>X: <a href="https://x.com/suparaise">https://x.com/suparaise</a></p>
      
      <p>PH: <a href="https://www.producthunt.com/posts/suparaise">https://www.producthunt.com/posts/suparaise</a></p>
    </div>
  </div>
</body>
</html>',
    first_name
  );

  -- Send the email via Resend
  BEGIN
    RAISE NOTICE 'Attempting to send welcome email via Resend API';

    SELECT
      status,
      content::text
    INTO
      response_status,
      response_body
    FROM extensions.http((
      'POST',
      'https://api.resend.com/emails',
      ARRAY[('Authorization', 'Bearer ' || resend_api_key)::extensions.http_header],
      'application/json',
      jsonb_build_object(
        'from', 'Babacar Diop <welcome@app.suparaise.com>',
        'reply_to', 'Support <hello@suparaise.com>',
        'to', user_email,
        'subject', email_subject,
        'text', email_content,
        'html', email_html,
        'click_tracking', true,
        'open_tracking', true
      )::text
    ));

    IF response_status >= 400 THEN
      RAISE WARNING 'Resend API returned error status %: %', response_status, response_body;
    ELSE
      RAISE NOTICE 'Welcome email sent successfully. Status: %, Response: %', response_status, response_body;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Function to send agent completion email to admin with full details
CREATE OR REPLACE FUNCTION public.send_agent_completion_admin_email(
  p_submission_id UUID
)
RETURNS void AS $$
DECLARE
  resend_api_key TEXT;
  v_startup_name TEXT;
  v_target_name TEXT;
  v_user_email TEXT;
  v_user_name TEXT;
  v_status TEXT;
  v_agent_notes TEXT;
  v_started_at TIMESTAMP;
  v_completed_at TIMESTAMP;
  v_application_url TEXT;
  v_duration_minutes INTEGER;
  email_subject TEXT;
  email_html TEXT;
  response_status INTEGER;
  response_body TEXT;
BEGIN
  -- Get submission details
  SELECT
    s.status,
    s.agent_notes,
    s.started_at,
    s.updated_at,
    st.name as startup_name,
    t.name as target_name,
    t.application_url,
    p.email as user_email,
    p.full_name as user_name,
    EXTRACT(EPOCH FROM (s.updated_at - s.started_at))/60 as duration_minutes
  INTO
    v_status,
    v_agent_notes,
    v_started_at,
    v_completed_at,
    v_startup_name,
    v_target_name,
    v_application_url,
    v_user_email,
    v_user_name,
    v_duration_minutes
  FROM
    submissions s
    JOIN startups st ON s.startup_id = st.id
    JOIN targets t ON s.target_id = t.id
    JOIN profiles p ON st.user_id = p.id
  WHERE
    s.id = p_submission_id;

  -- Get the Resend API key
  BEGIN
    resend_api_key := secrets.get_suparaise_resend_api_key();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to get Suparaise Resend API key: %', SQLERRM;
    RETURN;
  END;

  -- Skip if essential information is missing
  IF v_startup_name IS NULL OR v_target_name IS NULL THEN
    RAISE WARNING 'Missing essential information for submission_id: %', p_submission_id;
    RETURN;
  END IF;

  -- Prepare email subject
  email_subject := format('[ADMIN] Agent Run %s - %s → %s',
    CASE WHEN v_status = 'completed' THEN 'Completed' ELSE 'Failed' END,
    v_startup_name,
    v_target_name
  );

  -- HTML email content
  email_html := format('
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent run report</title>
  <style>
    body { font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
    .header { background: %s; padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .info-table { width: 100%%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .info-table td:first-child { background-color: #f8fafc; font-weight: 600; width: 200px; }
    .status-success { color: #059669; font-weight: bold; }
    .status-failed { color: #dc2626; font-weight: bold; }
    .agent-notes { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .agent-notes h3 { margin-top: 0; color: #374151; }
    .agent-notes pre { white-space: pre-wrap; font-family: "Monaco", "Courier New", monospace; font-size: 13px; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Agent run report</h1>
    </div>
    <div class="content">
      <h2>Agent execution summary</h2>
      
      <table class="info-table">
        <tr>
          <td>Submission ID</td>
          <td><code>%s</code></td>
        </tr>
        <tr>
          <td>Status</td>
          <td class="%s">%s</td>
        </tr>
        <tr>
          <td>Company</td>
          <td><strong>%s</strong></td>
        </tr>
        <tr>
          <td>Fund</td>
          <td><strong>%s</strong></td>
        </tr>
        <tr>
          <td>Application URL</td>
          <td><a href="%s" target="_blank">%s</a></td>
        </tr>
        <tr>
          <td>User</td>
          <td>%s (%s)</td>
        </tr>
        <tr>
          <td>Started at</td>
          <td>%s</td>
        </tr>
        <tr>
          <td>Completed at</td>
          <td>%s</td>
        </tr>
        <tr>
          <td>Duration</td>
          <td>%s minutes</td>
        </tr>
      </table>

      <div class="agent-notes">
        <h3>Agent response & notes</h3>
        <pre>%s</pre>
      </div>

      <p><a href="https://suparaise.com/dashboard" target="_blank">View in Dashboard →</a></p>
    </div>
  </div>
</body>
</html>',
    CASE WHEN v_status = 'completed' THEN 'linear-gradient(135deg, #059669 0%, #047857 100%)' ELSE 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' END,
    p_submission_id,
    CASE WHEN v_status = 'completed' THEN 'status-success' ELSE 'status-failed' END,
    UPPER(v_status),
    v_startup_name,
    v_target_name,
    COALESCE(v_application_url, 'N/A'),
    COALESCE(v_application_url, 'N/A'),
    COALESCE(v_user_name, 'Unknown'),
    COALESCE(v_user_email, 'Unknown'),
    COALESCE(v_started_at::TEXT, 'Unknown'),
    COALESCE(v_completed_at::TEXT, 'Unknown'),
    COALESCE(v_duration_minutes::TEXT, 'Unknown'),
    COALESCE(v_agent_notes, 'No agent notes available')
  );

  -- Send email to admin
  BEGIN
    SELECT
      status,
      content::text
    INTO
      response_status,
      response_body
    FROM extensions.http((
      'POST',
      'https://api.resend.com/emails',
      ARRAY[('Authorization', 'Bearer ' || resend_api_key)::extensions.http_header],
      'application/json',
      jsonb_build_object(
        'from', 'Babacar Diop <admin@app.suparaise.com>',
        'reply_to', 'Admin <admin@app.suparaise.com>',
        'to', 'hello@suparaise.com',
        'subject', email_subject,
        'html', email_html,
        'click_tracking', false,
        'open_tracking', false
      )::text
    ));

    IF response_status >= 400 THEN
      RAISE WARNING 'Failed to send admin email: status %, body %', response_status, response_body;
    ELSE
      RAISE NOTICE 'Admin notification email sent successfully';
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send admin notification email: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Function to send simple completion email to customer
CREATE OR REPLACE FUNCTION public.send_agent_completion_customer_email(
  p_submission_id UUID
)
RETURNS void AS $$
DECLARE
  resend_api_key TEXT;
  v_startup_name TEXT;
  v_target_name TEXT;
  v_user_email TEXT;
  v_user_name TEXT;
  v_first_name TEXT;
  v_status TEXT;
  email_subject TEXT;
  email_html TEXT;
  response_status INTEGER;
  response_body TEXT;
BEGIN
  -- Get submission details
  SELECT
    s.status,
    st.name as startup_name,
    t.name as target_name,
    p.email as user_email,
    p.full_name as user_name
  INTO
    v_status,
    v_startup_name,
    v_target_name,
    v_user_email,
    v_user_name
  FROM
    submissions s
    JOIN startups st ON s.startup_id = st.id
    JOIN targets t ON s.target_id = t.id
    JOIN profiles p ON st.user_id = p.id
  WHERE
    s.id = p_submission_id;

  -- Extract first name
  v_first_name := CASE
    WHEN v_user_name LIKE '% %' THEN split_part(v_user_name, ' ', 1)
    ELSE COALESCE(v_user_name, 'there')
  END;

  -- Get the Resend API key
  BEGIN
    resend_api_key := secrets.get_suparaise_resend_api_key();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to get Suparaise Resend API key: %', SQLERRM;
    RETURN;
  END;

  -- Skip if essential information is missing
  IF v_user_email IS NULL OR v_startup_name IS NULL OR v_target_name IS NULL THEN
    RAISE WARNING 'Missing essential information for submission_id: %', p_submission_id;
    RETURN;
  END IF;

  -- Prepare email subject and content based on status
  IF v_status = 'completed' THEN
    email_subject := format('Application submitted to %s', v_target_name);
    
    email_html := format('
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Application submitted</title>
  <style>
    body { font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #059669 0%%, #047857 100%%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application submitted!</h1>
    </div>
    <div class="content">
      <div class="success-icon">🎉</div>
      
      <h2>Hi %s,</h2>
      
      <p>Great news! Your application for funding has been successfully submitted to <strong>%s</strong>.</p>
      
      <p>An agent has completed filling out the application form with your information. You should expect to hear back from them according to their typical response timeline.</p>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
        <p style="margin: 0;"><strong>Pro Tip:</strong> While you wait for their response, consider applying to more funds to increase your chances. Remember, fundraising is a numbers game!</p>
      </div>
      
      <div style="text-align: center;">
        <a href="https://suparaise.com/dashboard" class="cta-button">Apply to more funds</a>
      </div>
      
      <p>Keep building amazing things! 🚀</p>
      
      <p>Best,<br><strong>Suparaise</strong></p>
    </div>
    <div class="footer">
      <p>Any questions? Reply to this email!</p>
    </div>
  </div>
</body>
</html>',
      v_first_name,
      v_target_name
    );
  ELSE
    email_subject := format('Issue with application to %s', v_target_name);
    
    email_html := format('
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Application Issue</title>
  <style>
    body { font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #dc2626 0%%, #b91c1c 100%%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Issue</h1>
    </div>
    <div class="content">
      <h2>Hi %s,</h2>
      
      <p>We encountered an issue while trying to submit your funding application to <strong>%s</strong>.</p>
      
      <p>Don''t worry - this happens sometimes due to website changes or technical issues. Our team has been notified and will investigate.</p>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p style="margin: 0;"><strong>What happens next:</strong></p>
        <ul style="margin: 10px 0 0 0;">
          <li>We''ll review the issue and attempt to resubmit if possible</li>
          <li>If manual submission is needed, we''ll reach out with instructions</li>
          <li>In the meantime, you can continue applying to other funds</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="https://suparaise.com/dashboard" class="cta-button">Continue applying</a>
      </div>
      
      <p>We apologize for the inconvenience and appreciate your patience.</p>
      
      <p>Best,<br><strong>Suparaise</strong></p>
    </div>
    <div class="footer">
      <p>Any questions? Reply to this email!</p>
    </div>
  </div>
</body>
</html>',
      v_first_name,
      v_target_name
    );
  END IF;

  -- Send email to customer
  BEGIN
    SELECT
      status,
      content::text
    INTO
      response_status,
      response_body
    FROM extensions.http((
      'POST',
      'https://api.resend.com/emails',
      ARRAY[('Authorization', 'Bearer ' || resend_api_key)::extensions.http_header],
      'application/json',
      jsonb_build_object(
        'from', 'Suparaise <agents@app.suparaise.com>',
        'reply_to', 'Support <hello@suparaise.com>',
        'to', v_user_email,
        'subject', email_subject,
        'html', email_html,
        'click_tracking', true,
        'open_tracking', true
      )::text
    ));

    IF response_status >= 400 THEN
      RAISE WARNING 'Failed to send customer email: status %, body %', response_status, response_body;
    ELSE
      RAISE NOTICE 'Customer notification email sent successfully to %', v_user_email;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send customer notification email: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Function to send subscription upgrade email (PRO/MAX)
CREATE OR REPLACE FUNCTION public.send_subscription_upgrade_email(
  user_email TEXT,
  user_name TEXT,
  plan_name TEXT
)
RETURNS void AS $$
DECLARE
  resend_api_key TEXT;
  email_subject TEXT;
  email_html TEXT;
  response_status INTEGER;
  response_body TEXT;
  first_name TEXT;
  plan_benefits TEXT;
BEGIN
  -- Extract first name
  first_name := CASE
    WHEN user_name LIKE '% %' THEN split_part(user_name, ' ', 1)
    ELSE COALESCE(user_name, 'there')
  END;

  -- Get the Resend API key
  BEGIN
    resend_api_key := secrets.get_suparaise_resend_api_key();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to get Suparaise Resend API key: %', SQLERRM;
    RETURN;
  END;

  -- Set plan-specific benefits
  IF plan_name = 'PRO' THEN
    plan_benefits := '
        <li><strong>50 runs per month</strong></li>
        <li><strong>Access to 1,200 global funds</strong></li>
        <li><strong>3 parallel submissions</strong></li>
        <li><strong>Smart queuing system</strong></li>
        <li><strong>Agent customization</strong></li>
        <li><strong>Standard support</strong></li>';
  ELSIF plan_name = 'MAX' THEN
    plan_benefits := '
        <li><strong>120 runs per month</strong></li>
        <li><strong>Access to 2,000+ global funds</strong></li>
        <li><strong>5 parallel submissions</strong></li>
        <li><strong>Advanced application tracking</strong></li>
        <li><strong>Integrations</strong></li>
        <li><strong>Priority support</strong></li>';
  ELSE
    plan_benefits := '<li><strong>Enhanced features</strong> for better fundraising success</li>';
  END IF;

  email_subject := format('🚀 Welcome to Suparaise %s!', plan_name);

  email_html := format('
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Suparaise %s</title>
  <style>
    body { font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
    .content { padding: 40px 30px; }
    .benefits-list { list-style: none; padding: 0; margin: 20px 0; }
    .benefits-list li { padding: 12px 0; border-left: 3px solid #667eea; padding-left: 20px; margin-bottom: 10px; background-color: #f8fafc; padding-right: 15px; border-radius: 0 8px 8px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
    .highlight-box { background: linear-gradient(135deg, #667eea20 0%%, #764ba220 100%%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #667eea40; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 You''re now %s!</h1>
      <div class="badge">%s PLAN ACTIVATED</div>
    </div>
    <div class="content">
      <h2>Hey %s! 🎉</h2>
      
      <p>Congratulations on upgrading to <strong>Suparaise %s</strong>! You''ve just unlocked the full power of AI-driven fundraising automation.</p>
      
      <div class="highlight-box">
        <h3>🎯 Here''s what you can do now:</h3>
        <ul class="benefits-list">%s
        </ul>
      </div>
      
      <p>Your enhanced features are active immediately. Head to your dashboard to start taking advantage of your new capabilities!</p>
      
      <div style="text-align: center;">
        <a href="https://suparaise.com/dashboard" class="cta-button">Explore Your New Features</a>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
        <p style="margin: 0;"><strong>💡 Pro Tip:</strong> With your %s plan, we recommend setting up custom agent instructions to personalize how your applications are filled. This can significantly improve your success rate!</p>
      </div>
      
      <p>Ready to raise that round? Let''s make it happen!</p>
      
      <p>Best,<br><strong>Suparaise</strong></p>
    </div>
    <div class="footer">
      <p>Any questions? Reply to this email!</p>
    </div>
  </div>
</body>
</html>',
    plan_name,
    plan_name,
    plan_name,
    first_name,
    plan_name,
    plan_benefits,
    plan_name
  );

  -- Send email
  BEGIN
    SELECT
      status,
      content::text
    INTO
      response_status,
      response_body
    FROM extensions.http((
      'POST',
      'https://api.resend.com/emails',
      ARRAY[('Authorization', 'Bearer ' || resend_api_key)::extensions.http_header],
      'application/json',
      jsonb_build_object(
        'from', 'Suparaise <thankyou@app.suparaise.com>',
        'reply_to', 'Support <hello@suparaise.com>',
        'to', user_email,
        'subject', email_subject,
        'html', email_html,
        'click_tracking', true,
        'open_tracking', true
      )::text
    ));

    IF response_status >= 400 THEN
      RAISE WARNING 'Failed to send subscription upgrade email: status %, body %', response_status, response_body;
    ELSE
      RAISE NOTICE 'Subscription upgrade email sent successfully to %', user_email;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send subscription upgrade email: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp; 