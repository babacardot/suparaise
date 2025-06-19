-- Custom types
CREATE TYPE submission_type AS ENUM ('form', 'email', 'other');
CREATE TYPE submission_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE form_complexity AS ENUM ('simple', 'standard', 'comprehensive');
CREATE TYPE question_count_range AS ENUM ('1-5', '6-10', '11-20', '21+');
CREATE TYPE founder_role AS ENUM (
    'Founder', 
    'Co-founder', 
    'CEO', 
    'CTO', 
    'COO',
    'CPO',
    'CMO',
    'Lead Engineer',
    'Product Manager',
    'Designer',
    'Sales Lead',
    'Marketing Lead',
    'Advisor',
    'Legal Counsel',
    'Other'
);
CREATE TYPE investment_stage AS ENUM ('Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'All stages');
CREATE TYPE industry_type AS ENUM ('B2B SaaS', 'Fintech', 'Healthtech', 'AI/ML', 'Deep tech', 'Climate tech', 'Consumer', 'E-commerce', 'Marketplace', 'Edtech', 'Gaming', 'Web3', 'Developer tools', 'Cybersecurity', 'Logistics', 'Agritech', 'Other');

-- --------------------------------------------------
-- Auto-update `updated_at` column
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------
-- Table: targets
-- Stores all the VC firms we can apply to.
-- --------------------------------------------------
CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    website TEXT,
    application_url TEXT NOT NULL,
    application_email TEXT,
    submission_type submission_type DEFAULT 'form',
    stage_focus investment_stage[],
    industry_focus industry_type[],
    region_focus TEXT[],
    form_complexity form_complexity,
    question_count_range question_count_range,
    required_documents TEXT[],
    requires_video BOOLEAN DEFAULT FALSE,
    notes TEXT, -- For special instructions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_targets_timestamp
BEFORE UPDATE ON targets
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- --------------------------------------------------
-- Table: profiles
-- Stores public user data, linked to auth.users.
-- --------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT
);

-- --------------------------------------------------
-- Table: startups
-- Stores the core information about a founder's startup.
-- --------------------------------------------------
CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    website TEXT,
    industry industry_type,
    location TEXT,
    description_short TEXT,
    description_medium TEXT,
    description_long TEXT,
    traction_summary TEXT, -- For describing user growth, key metrics, etc.
    market_summary TEXT, -- For describing TAM, SAM, SOM, etc.
    mrr NUMERIC(12, 2) DEFAULT 0,
    arr NUMERIC(12, 2) DEFAULT 0,
    employee_count INTEGER,
    -- Asset URLs from Supabase Storage
    logo_url TEXT,
    pitch_deck_url TEXT,
    intro_video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_startups_timestamp
BEFORE UPDATE ON startups
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- --------------------------------------------------
-- Table: founders
-- Stores information about the founders of a startup.
-- --------------------------------------------------
CREATE TABLE founders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    role founder_role,
    bio TEXT,
    email TEXT UNIQUE,
    linkedin TEXT,
    github_url TEXT,
    personal_website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_founders_timestamp
BEFORE UPDATE ON founders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- --------------------------------------------------
-- Table: common_responses
-- Stores pre-written answers to common application questions.
-- --------------------------------------------------
CREATE TABLE common_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    UNIQUE(startup_id, question),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_common_responses_timestamp
BEFORE UPDATE ON common_responses
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- --------------------------------------------------
-- Table: submissions
-- Tracks the status of each application submission by the agent.
-- --------------------------------------------------
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
    target_id UUID REFERENCES targets(id) ON DELETE CASCADE NOT NULL,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    status submission_status DEFAULT 'pending',
    agent_notes TEXT, -- To store the agent's final report
    UNIQUE(startup_id, target_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- Row Level Security (RLS) Policies
-- --------------------------------------------------

-- Targets are public
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to targets" ON targets FOR SELECT USING (true);

-- Users can only see their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Users can only manage their own startup
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own startup" ON startups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to create their own startup" ON startups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own startup" ON startups FOR UPDATE USING (auth.uid() = user_id);

-- Users can only manage founders of their own startup
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage founders of their own startup" ON founders FOR ALL
USING (auth.uid() = (SELECT user_id FROM startups WHERE id = startup_id));

-- Users can only manage common responses for their own startup
ALTER TABLE common_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage responses for their own startup" ON common_responses FOR ALL
USING (auth.uid() = (SELECT user_id FROM startups WHERE id = startup_id));

-- Users can only manage submissions for their own startup
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage submissions for their own startup" ON submissions FOR ALL
USING (auth.uid() = (SELECT user_id FROM startups WHERE id = startup_id)); 