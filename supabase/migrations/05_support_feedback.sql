-- Create support_requests table
CREATE TABLE IF NOT EXISTS support_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    startup_id uuid REFERENCES startups(id) ON DELETE CASCADE,
    category text NOT NULL CHECK (category IN ('account', 'billing', 'technical', 'feature', 'other')),
    subject text NOT NULL,
    message text NOT NULL,
    image_url text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_startup_id ON support_requests(startup_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own support requests"
    ON support_requests FOR SELECT
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own support requests"
    ON support_requests FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

-- Storage bucket and policies for support request images are defined in 02_buckets.sql

-- Create RPC function to create support request
CREATE OR REPLACE FUNCTION create_support_request(
    p_user_id uuid,
    p_startup_id uuid,
    p_category text,
    p_subject text,
    p_message text,
    p_image_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    request_id uuid;
BEGIN
    -- Validate that the user can create this request
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only create support requests for yourself';
    END IF;

    -- Validate that the startup belongs to the user (if startup_id is provided)
    IF p_startup_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM startups WHERE id = p_startup_id AND user_id = p_user_id) THEN
            RAISE EXCEPTION 'Unauthorized: You can only create support requests for your own startups';
        END IF;
    END IF;

    -- Insert the support request
    INSERT INTO support_requests (
        user_id,
        startup_id,
        category,
        subject,
        message,
        image_url
    ) VALUES (
        p_user_id,
        p_startup_id,
        p_category,
        p_subject,
        p_message,
        p_image_url
    ) RETURNING id INTO request_id;

    RETURN request_id;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION create_support_request(uuid, uuid, text, text, text, text) TO authenticated;

--------------------------------------------------------------------------------
-- FEEDBACK
--------------------------------------------------------------------------------
-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    startup_id uuid REFERENCES startups(id) ON DELETE CASCADE, -- Link feedback to specific startup
    sentiment TEXT, -- e.g., 'positive', 'neutral', 'negative'
    message TEXT NOT NULL
);

-- RLS policies for feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert their own feedback"
ON feedback
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow users to view their own feedback"
ON feedback
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_startup_id ON feedback(startup_id);

-- Create RPC function to create feedback
CREATE OR REPLACE FUNCTION create_feedback(
    p_user_id uuid,
    p_sentiment text,
    p_message text,
    p_startup_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    feedback_id uuid;
BEGIN
    -- Validate that the user can create this feedback
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: You can only create feedback for yourself';
    END IF;

    -- Validate that the startup belongs to the user (if startup_id is provided)
    IF p_startup_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM startups WHERE id = p_startup_id AND user_id = p_user_id) THEN
            RAISE EXCEPTION 'Unauthorized: You can only create feedback for your own startups';
        END IF;
    END IF;

    -- Insert the feedback
    INSERT INTO feedback (
        user_id,
        sentiment,
        message,
        startup_id
    ) VALUES (
        p_user_id,
        p_sentiment,
        p_message,
        p_startup_id
    ) RETURNING id INTO feedback_id;

    RETURN feedback_id;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION create_feedback(uuid, text, text, uuid) TO authenticated;
