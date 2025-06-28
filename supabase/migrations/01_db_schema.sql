-- Custom types
CREATE TYPE submission_type AS ENUM ('form', 'email', 'other');
CREATE TYPE submission_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE form_complexity AS ENUM ('simple', 'standard', 'comprehensive');
CREATE TYPE question_count_range AS ENUM ('1-5', '6-10', '11-20', '21+');
CREATE TYPE required_document_type AS ENUM (
    'pitch_deck', 
    'video', 
    'financial_projections', 
    'business_plan', 
    'traction_data', 
    'legal_documents'
);
CREATE TYPE region_type AS ENUM (
    'Global',
    'North America', 
    'South America', 
    'LATAM',
    'Europe', 
    'Western Europe',
    'Eastern Europe',
    'Continental Europe',
    'Middle East', 
    'Africa', 
    'Asia', 
    'East Asia',
    'South Asia',
    'South East Asia', 
    'Oceania',
    'EMEA',
    'Emerging Markets'
);
CREATE TYPE founder_role AS ENUM (
    'Founder', 
    'Co-founder', 
    'CEO', 
    'CTO', 
    'COO',
    'CPO',
    'CMO',
    'Engineer',
    'Product',
    'Designer',
    'Advisor',
    'Legal Counsel',
    'Other'
);
CREATE TYPE investment_stage AS ENUM ('Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'All');
CREATE TYPE industry_type AS ENUM (
    -- Tech
    'B2B SaaS', 'Fintech', 'Healthtech', 'AI/ML', 'Deep tech', 'Climate tech', 
    'Consumer', 'E-commerce', 'Marketplace', 'Gaming', 'Web3', 
    'Developer tools', 'Cybersecurity', 'Logistics', 'AdTech', 'PropTech', 'InsurTech',
    -- Non-Tech / Other
    'Agriculture', 'Automotive', 'Biotechnology', 'Construction', 'Consulting', 
    'Consumer Goods', 'Education', 'Energy', 'Entertainment', 'Environmental Services', 
    'Fashion', 'Food & Beverage', 'Government', 'Healthcare Services', 'Hospitality', 
    'Human Resources', 'Insurance', 'Legal', 'Manufacturing', 'Media', 
    'Non-profit', 'Pharmaceuticals', 'Real Estate', 'Retail', 'Telecommunications', 
    'Transportation', 'Utilities', 'Other'
);
CREATE TYPE legal_structure AS ENUM (
    'Not yet incorporated',
    'Delaware C-Corp',
    'Canadian company',
    'B-Corp',
    'Public Benefit Corporation (PBC)',
    'LLC',
    'S-Corp',
    'Non-profit',
    'Other'
);
CREATE TYPE investment_instrument AS ENUM ('Equity', 'Debt', 'Convertible Note', 'SAFE', 'Other');
CREATE TYPE revenue_model_type AS ENUM (
    'Subscription', 'One-time purchase', 'Commission/Transaction fees', 'Advertising',
    'Freemium', 'Usage-based', 'Licensing', 'Consulting',
    'Affiliate', 'Marketplace fees', 'Data monetization', 'Hardware sales',
    'Hybrid', 'Other'
);
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'past_due', 'canceled', 'unpaid');
CREATE TYPE permission_level AS ENUM ('FREE', 'PRO', 'MAX');
CREATE TYPE agent_tone AS ENUM ('professional', 'enthusiastic', 'concise', 'detailed');
CREATE TYPE agent_submission_delay AS ENUM ('0', '15', '30');
CREATE TYPE agent_retry_attempts AS ENUM ('1', '3', '5', '10');
CREATE TYPE agent_parallel_submissions AS ENUM ('1', '3', '5', '15');
CREATE TYPE agent_timeout_minutes AS ENUM ('5', '10', '15',  '30');
CREATE TYPE check_size_range AS ENUM ('1K-10K', '10K-25K', '25K-50K', '50K-100K', '100K-250K', '250K-500K', '500K-1M', '1M+');
CREATE TYPE investment_approach AS ENUM ('hands-on', 'passive', 'advisory', 'network-focused');
CREATE TYPE response_time AS ENUM ('1-3 days', '1 week', '2 weeks', '1 month', '2+ months');
CREATE TYPE program_duration AS ENUM ('3 months','6 months', '12 months', 'ongoing', 'variable');
CREATE TYPE program_type AS ENUM ('in-person', 'remote', 'hybrid');
CREATE TYPE equity_range AS ENUM ('0%', '1-3%', '4-6%', '7-10%', '10%+', 'variable');
CREATE TYPE funding_range AS ENUM ('0-25K', '25K-50K', '50K-100K', '100K-250K', '250K-500K', '500K+');
CREATE TYPE batch_size AS ENUM ('1-10', '11-20', '21-50', '51-100', '100+');
CREATE TYPE acceptance_rate AS ENUM ('<1%', '1-5%', '6-10%', '11-20%', '20%+');

-- --------------------------------------------------
-- Auto-update `updated_at` column
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- --------------------------------------------------
-- Auto-create profile when user signs up
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data::jsonb)->>'full_name',
      (NEW.raw_user_meta_data::jsonb)->>'name',
      TRIM(CONCAT((NEW.raw_user_meta_data::jsonb)->>'first_name', ' ', (NEW.raw_user_meta_data::jsonb)->>'last_name')),
      split_part(NEW.email, '@', 1)
    ),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
    region_focus region_type[],
    form_complexity form_complexity,
    question_count_range question_count_range,
    required_documents required_document_type[],
    notes TEXT, -- For special instructions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_targets_timestamp
BEFORE UPDATE ON targets
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- --------------------------------------------------
-- Table: angels
-- Stores all the angel investors we can apply to.
-- --------------------------------------------------
CREATE TABLE angels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    linkedin TEXT,
    twitter TEXT,
    personal_website TEXT,
    location TEXT,
    bio TEXT,
    check_size check_size_range,
    stage_focus investment_stage[],
    industry_focus industry_type[],
    region_focus region_type[],
    investment_approach investment_approach,
    previous_exits TEXT[], -- Companies they've invested in that had exits
    domain_expertise TEXT[], -- Areas of expertise they can help with
    response_time response_time,
    submission_type submission_type DEFAULT 'email',
    application_url TEXT,
    application_email TEXT,
    form_complexity form_complexity,
    required_documents required_document_type[],
    notable_investments TEXT[], -- Notable companies in their portfolio
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT, -- For special instructions or additional info
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_angels_timestamp
BEFORE UPDATE ON angels
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- --------------------------------------------------
-- Table: accelerators
-- Stores all the accelerators/incubators we can apply to.
-- --------------------------------------------------
CREATE TABLE accelerators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    website TEXT,
    application_url TEXT,
    application_email TEXT,
    submission_type submission_type DEFAULT 'form',
    program_type program_type,
    program_duration program_duration,
    location TEXT,
    is_remote_friendly BOOLEAN DEFAULT FALSE,
    batch_size batch_size,
    batches_per_year INTEGER,
    next_application_deadline DATE,
    stage_focus investment_stage[],
    industry_focus industry_type[],
    region_focus region_type[],
    equity_taken equity_range,
    funding_provided funding_range,
    acceptance_rate acceptance_rate,
    form_complexity form_complexity,
    required_documents required_document_type[],
    program_fee NUMERIC(10, 2), -- Some charge program fees
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT, -- For special instructions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_accelerators_timestamp
BEFORE UPDATE ON accelerators
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- --------------------------------------------------
-- Table: profiles
-- Stores public user data, linked to auth.users.
-- --------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    is_subscribed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    subscription_status subscription_status,
    subscription_current_period_end TIMESTAMPTZ,
    permission_level permission_level DEFAULT 'FREE' NOT NULL,
    monthly_submissions_used INTEGER DEFAULT 0 NOT NULL,
    monthly_submissions_limit INTEGER DEFAULT 3 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_monthly_submissions_used CHECK (monthly_submissions_used >= 0),
    CONSTRAINT chk_monthly_submissions_limit CHECK (monthly_submissions_limit > 0)
);

-- Create trigger to auto-create profile when user signs up
CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user();

-- Create trigger to auto-update timestamp for profiles
CREATE TRIGGER set_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

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
    is_incorporated BOOLEAN DEFAULT TRUE,
    incorporation_city TEXT,
    incorporation_country TEXT,
    operating_countries TEXT[],
    legal_structure legal_structure,
    investment_instrument investment_instrument,
    funding_round investment_stage,
    funding_amount_sought NUMERIC(15, 2),
    pre_money_valuation NUMERIC(15, 2),
    description_short TEXT,
    description_medium TEXT,
    description_long TEXT,
    traction_summary TEXT, -- For describing user growth, key metrics, etc.
    market_summary TEXT, -- For describing TAM, SAM, SOM, etc.
    mrr NUMERIC(12, 2) DEFAULT 0,
    arr NUMERIC(12, 2) DEFAULT 0,
    employee_count INTEGER,
    founded_year INTEGER,
    revenue_model revenue_model_type,
    current_runway INTEGER, -- in months
    key_customers TEXT,
    competitors TEXT,
    onboarded BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    deleted_at TIMESTAMPTZ,
    -- Asset URLs from Supabase Storage
    logo_url TEXT,
    pitch_deck_url TEXT,
    intro_video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraints
    CONSTRAINT chk_founded_year CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM NOW()) + 1),
    CONSTRAINT chk_current_runway CHECK (current_runway >= 0)
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
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role founder_role,
    bio TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    linkedin TEXT,
    github_url TEXT,
    personal_website_url TEXT,
    twitter_url TEXT,
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
-- Table: angel_submissions
-- Tracks the status of each application submission to angels by the agent.
-- --------------------------------------------------
CREATE TABLE angel_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
    angel_id UUID REFERENCES angels(id) ON DELETE CASCADE NOT NULL,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    status submission_status DEFAULT 'pending',
    agent_notes TEXT, -- To store the agent's final report
    UNIQUE(startup_id, angel_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- Table: accelerator_submissions
-- Tracks the status of each application submission to accelerators by the agent.
-- --------------------------------------------------
CREATE TABLE accelerator_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
    accelerator_id UUID REFERENCES accelerators(id) ON DELETE CASCADE NOT NULL,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    status submission_status DEFAULT 'pending',
    agent_notes TEXT, -- To store the agent's final report
    UNIQUE(startup_id, accelerator_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------
-- Table: agent_settings
-- Stores agent configuration settings per startup.
-- --------------------------------------------------
CREATE TABLE agent_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    submission_delay agent_submission_delay DEFAULT '30' NOT NULL,
    retry_attempts agent_retry_attempts DEFAULT '3' NOT NULL,
    max_parallel_submissions agent_parallel_submissions DEFAULT '3' NOT NULL,
    timeout_minutes agent_timeout_minutes DEFAULT '10' NOT NULL,
    preferred_tone agent_tone DEFAULT 'professional' NOT NULL,
    debug_mode BOOLEAN DEFAULT FALSE NOT NULL,
    stealth BOOLEAN DEFAULT TRUE NOT NULL,
    custom_instructions TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(startup_id)
);

CREATE TRIGGER set_agent_settings_timestamp
BEFORE UPDATE ON agent_settings
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- =================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =================================================================

-- Index for startups.user_id (critical for dashboard queries)
CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);

-- Index for startups.onboarded (for filtering incomplete onboarding)
CREATE INDEX IF NOT EXISTS idx_startups_onboarded ON startups(onboarded);

-- Index for founders.startup_id (for founder lookups)
CREATE INDEX IF NOT EXISTS idx_founders_startup_id ON founders(startup_id);

-- Index for common_responses.startup_id (for response lookups)
CREATE INDEX IF NOT EXISTS idx_common_responses_startup_id ON common_responses(startup_id);

-- Index for submissions queries
CREATE INDEX IF NOT EXISTS idx_submissions_startup_id ON submissions(startup_id);
CREATE INDEX IF NOT EXISTS idx_submissions_target_id ON submissions(target_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Composite index for the unique constraint queries
CREATE INDEX IF NOT EXISTS idx_submissions_startup_target ON submissions(startup_id, target_id);

-- Indexes for angel_submissions queries
CREATE INDEX IF NOT EXISTS idx_angel_submissions_startup_id ON angel_submissions(startup_id);
CREATE INDEX IF NOT EXISTS idx_angel_submissions_angel_id ON angel_submissions(angel_id);
CREATE INDEX IF NOT EXISTS idx_angel_submissions_status ON angel_submissions(status);
CREATE INDEX IF NOT EXISTS idx_angel_submissions_startup_angel ON angel_submissions(startup_id, angel_id);

-- Indexes for accelerator_submissions queries
CREATE INDEX IF NOT EXISTS idx_accelerator_submissions_startup_id ON accelerator_submissions(startup_id);
CREATE INDEX IF NOT EXISTS idx_accelerator_submissions_accelerator_id ON accelerator_submissions(accelerator_id);
CREATE INDEX IF NOT EXISTS idx_accelerator_submissions_status ON accelerator_submissions(status);
CREATE INDEX IF NOT EXISTS idx_accelerator_submissions_startup_accelerator ON accelerator_submissions(startup_id, accelerator_id);
CREATE INDEX IF NOT EXISTS idx_common_responses_startup_question ON common_responses(startup_id, question);

-- Index for email lookups in founders (if used)
CREATE INDEX IF NOT EXISTS idx_founders_email ON founders(email) WHERE email IS NOT NULL;

-- Index for founded_year for filtering
CREATE INDEX IF NOT EXISTS idx_startups_founded_year ON startups(founded_year) WHERE founded_year IS NOT NULL;

-- Performance indexes for targets table (for filtering)
CREATE INDEX IF NOT EXISTS idx_targets_stage_focus ON targets USING GIN(stage_focus) WHERE stage_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_industry_focus ON targets USING GIN(industry_focus) WHERE industry_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_region_focus ON targets USING GIN(region_focus) WHERE region_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_targets_required_documents ON targets USING GIN(required_documents) WHERE required_documents IS NOT NULL;

-- Performance indexes for agent_settings table
CREATE INDEX IF NOT EXISTS idx_agent_settings_startup_id ON agent_settings(startup_id);
CREATE INDEX IF NOT EXISTS idx_agent_settings_user_id ON agent_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_settings_startup_user ON agent_settings(startup_id, user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_permission_level ON profiles(permission_level);
CREATE INDEX IF NOT EXISTS idx_profiles_is_subscribed ON profiles(is_subscribed);

-- Performance indexes for angels table
CREATE INDEX IF NOT EXISTS idx_angels_stage_focus ON angels USING GIN(stage_focus) WHERE stage_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angels_industry_focus ON angels USING GIN(industry_focus) WHERE industry_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angels_region_focus ON angels USING GIN(region_focus) WHERE region_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angels_investment_approach ON angels(investment_approach) WHERE investment_approach IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angels_check_size ON angels(check_size) WHERE check_size IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angels_response_time ON angels(response_time) WHERE response_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_angels_is_active ON angels(is_active);

-- Performance indexes for accelerators table
CREATE INDEX IF NOT EXISTS idx_accelerators_stage_focus ON accelerators USING GIN(stage_focus) WHERE stage_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_industry_focus ON accelerators USING GIN(industry_focus) WHERE industry_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_region_focus ON accelerators USING GIN(region_focus) WHERE region_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_program_type ON accelerators(program_type) WHERE program_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_program_duration ON accelerators(program_duration) WHERE program_duration IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_batch_size ON accelerators(batch_size) WHERE batch_size IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_equity_taken ON accelerators(equity_taken) WHERE equity_taken IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_funding_provided ON accelerators(funding_provided) WHERE funding_provided IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_acceptance_rate ON accelerators(acceptance_rate) WHERE acceptance_rate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accelerators_is_remote_friendly ON accelerators(is_remote_friendly);
CREATE INDEX IF NOT EXISTS idx_accelerators_is_active ON accelerators(is_active);
CREATE INDEX IF NOT EXISTS idx_accelerators_next_application_deadline ON accelerators(next_application_deadline) WHERE next_application_deadline IS NOT NULL;

-- --------------------------------------------------
-- Row Level Security (RLS) Policies
-- --------------------------------------------------

-- Targets are restricted - only authenticated users can view
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read targets" ON targets FOR SELECT USING (auth.role() = 'authenticated');

-- Angels are restricted - only authenticated users can view
ALTER TABLE angels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read angels" ON angels FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Accelerators are restricted - only authenticated users can view
ALTER TABLE accelerators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read accelerators" ON accelerators FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Users can only see their own profile (optimized with select auth.uid())
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own profile" ON profiles FOR SELECT USING ((select auth.uid()) = id AND is_active = TRUE);
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING ((select auth.uid()) = id AND is_active = TRUE);
CREATE POLICY "Allow users to insert their own profile" ON profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Users can only manage their own startup (optimized with select auth.uid())
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own startup" ON startups FOR SELECT USING ((select auth.uid()) = user_id AND is_active = TRUE AND (SELECT is_active FROM profiles WHERE id = user_id) = TRUE);
CREATE POLICY "Allow users to create their own startup" ON startups FOR INSERT WITH CHECK ((select auth.uid()) = user_id AND (SELECT is_active FROM profiles WHERE id = user_id) = TRUE);
CREATE POLICY "Allow users to update their own startup" ON startups FOR UPDATE USING ((select auth.uid()) = user_id AND is_active = TRUE AND (SELECT is_active FROM profiles WHERE id = user_id) = TRUE);

-- Users can only manage founders of their own startup (optimized with select auth.uid())
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage founders of their own startup" ON founders FOR ALL
USING ((select auth.uid()) = (SELECT user_id FROM startups WHERE id = startup_id));

-- Users can only manage common responses for their own startup (optimized with select auth.uid())
ALTER TABLE common_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage responses for their own startup" ON common_responses FOR ALL
USING ((select auth.uid()) = (SELECT user_id FROM startups WHERE id = startup_id));

-- Users can only manage submissions for their own startup (optimized with select auth.uid())
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage submissions for their own startup" ON submissions FOR ALL
USING ((select auth.uid()) = (SELECT user_id FROM startups WHERE id = startup_id));

-- Users can only manage angel submissions for their own startup (optimized with select auth.uid())
ALTER TABLE angel_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage angel submissions for their own startup" ON angel_submissions FOR ALL
USING ((select auth.uid()) = (SELECT user_id FROM startups WHERE id = startup_id));

-- Users can only manage accelerator submissions for their own startup (optimized with select auth.uid())
ALTER TABLE accelerator_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage accelerator submissions for their own startup" ON accelerator_submissions FOR ALL
USING ((select auth.uid()) = (SELECT user_id FROM startups WHERE id = startup_id));

-- Row Level Security for agent_settings
ALTER TABLE agent_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage agent settings for their own startup" ON agent_settings FOR ALL
USING ((select auth.uid()) = user_id AND (SELECT is_active FROM profiles WHERE id = user_id) = TRUE);

-- =================================================================
-- ANALYZE TABLES FOR OPTIMAL QUERY PLANNING
-- =================================================================
-- Update table statistics for better query planning
ANALYZE profiles;
ANALYZE startups;
ANALYZE founders;
ANALYZE common_responses;
ANALYZE submissions;
ANALYZE angel_submissions;
ANALYZE accelerator_submissions;
ANALYZE targets;
ANALYZE angels;
ANALYZE accelerators;
ANALYZE agent_settings;