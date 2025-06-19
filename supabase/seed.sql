-- Seed data for the 'targets' table

-- Clear existing data from all tables to prevent foreign key constraint errors
TRUNCATE TABLE 
    profiles, 
    startups, 
    founders, 
    common_responses, 
    targets, 
    submissions 
RESTART IDENTITY CASCADE;

INSERT INTO targets (
    name, website, application_url, application_email, submission_type, 
    stage_focus, industry_focus, region_focus, 
    form_complexity, question_count_range, required_documents, requires_video, notes
)
VALUES
(
    'Madica VC', 'https://www.madica.vc', 'https://madica.vc/apply', NULL, 'form',
    ARRAY['Pre-seed', 'Seed']::investment_stage[],
    ARRAY['B2B SaaS', 'Fintech', 'Healthtech', 'Developer tools']::industry_type[],
    ARRAY['Africa'],
    'standard', '11-20', ARRAY['pitch_deck'], FALSE, 'Focus on African startups with a strong technical team.'
),
(
    'Quona', 'https://www.quona.com', 'https://quona.com/contact/', 'submissions@quona.com', 'email',
    ARRAY['Seed', 'Series A', 'Series B']::investment_stage[],
    ARRAY['Fintech']::industry_type[],
    ARRAY['Emerging Markets'],
    'simple', '1-5', ARRAY['pitch_deck'], FALSE, 'Prefers email submissions with a clear one-pager.'
),
(
    'Andreessen Horowitz (a16z)', 'https://a16z.com', 'https://a16z.com/submissions/', NULL, 'form',
    ARRAY['All stages']::investment_stage[],
    ARRAY['AI/ML', 'Web3', 'B2B SaaS', 'Consumer', 'Fintech', 'Healthtech']::industry_type[],
    ARRAY['Global'],
    'comprehensive', '21+', ARRAY['pitch_deck', 'intro_video'], TRUE, 'Requires a warm intro for best results, but cold submissions are accepted via the form.'
),
(
    'Lateral Frontiers', 'https://www.lateralfrontiers.com', 'https://www.lateralfrontiers.com/contact', 'deals@lateralfrontiers.com', 'email',
    ARRAY['Pre-seed', 'Seed']::investment_stage[],
    ARRAY['Deep tech', 'AI/ML', 'Climate tech']::industry_type[],
    ARRAY['Global'],
    'simple', '1-5', ARRAY['pitch_deck'], FALSE, 'Email pitch is preferred.'
),
(
    'Breega', 'https://www.breega.com', 'https://rm531z4dws8.typeform.com/to/NNZmuM7H?typeform-source=www.breega.com', NULL, 'form',
    ARRAY['Pre-seed', 'Seed', 'Series A']::investment_stage[],
    ARRAY['B2B SaaS', 'Marketplace', 'Fintech']::industry_type[],
    ARRAY['Europe'],
    'standard', '11-20', ARRAY['pitch_deck'], FALSE, 'Typeform-based application. Be concise.'
),
(
    'Palm Drive Capital', 'https://palmdrive.vc/', 'https://formbricks-production-7002.up.railway.app/s/clwo0sdah000g94gj0hp5s319', NULL, 'form',
    ARRAY['Seed', 'Series A', 'Series B']::investment_stage[],
    ARRAY['B2B SaaS', 'Fintech', 'E-commerce']::industry_type[],
    ARRAY['North America', 'Europe'],
    'standard', '11-20', ARRAY['pitch_deck'], FALSE, NULL
),
(
    'Open Startup', 'https://open-startup.org/', 'https://open-startup.org/#get-in-contact', 'contact@open-startup.org', 'email',
    ARRAY['Pre-seed']::investment_stage[],
    ARRAY['Developer tools', 'B2B SaaS']::industry_type[],
    ARRAY['Global'],
    'simple', '1-5', ARRAY['pitch_deck'], FALSE, 'Prefers email submissions with a loom video and public metrics.'
);

-- Note: The data above contains assumptions for demonstration purposes.
-- You can adjust these values based on actual research. 