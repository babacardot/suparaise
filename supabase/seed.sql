-- Seed data for the 'targets' table

INSERT INTO targets (
    name, website, application_url, application_email, submission_type, 
    stage_focus, industry_focus, region_focus, 
    form_complexity, question_count_range, required_documents, requires_video, notes
)
VALUES
(
    'Madica VC', 'https://www.madica.vc', 'https://madica.vc/apply', NULL, 'form',
    ARRAY['Pre-seed', 'Seed']::investment_stage[],
    ARRAY['B2B SaaS', 'FinTech', 'HealthTech', 'API']::industry_type[],
    ARRAY['Africa'],
    'standard', '11-20', ARRAY['pitch_deck'], FALSE, 'Focus on African startups.'
),
(
    'Quona', 'https://www.quona.com', 'https://quona.com/contact/', NULL, 'form',
    ARRAY['Seed', 'Series A', 'Series B']::investment_stage[],
    ARRAY['FinTech']::industry_type[],
    ARRAY['Emerging Markets'],
    'simple', '1-5', NULL, FALSE, 'Contact form is for general inquiries, but can be used for pitches.'
),
(
    'Andreessen Horowitz (a16z)', 'https://a16z.com', 'https://sr.a16z.com//', NULL, 'form',
    ARRAY['Seed', 'Series A', 'Series B', 'Series C', 'Growth']::investment_stage[],
    ARRAY['AI/ML', 'Web3', 'B2B SaaS', 'Consumer', 'FinTech']::industry_type[],
    ARRAY['Global'],
    'comprehensive', '21+', ARRAY['pitch_deck', 'intro_video'], TRUE, 'Requires a warm intro for best results, but cold submissions are accepted.'
),
(
    'Lateral Frontiers', 'https://www.lateralfrontiers.com', 'https://www.lateralfrontiers.com/contact', NULL, 'form',
    ARRAY['Pre-seed', 'Seed']::investment_stage[],
    ARRAY['Deep Tech', 'AI/ML']::industry_type[],
    ARRAY['Global'],
    'simple', '1-5', NULL, FALSE, NULL
),
(
    'Breega', 'https://www.breega.com', 'https://rm531z4dws8.typeform.com/to/NNZmuM7H?typeform-source=www.breega.com', NULL, 'form',
    ARRAY['Pre-seed', 'Seed', 'Series A']::investment_stage[],
    ARRAY['B2B SaaS', 'Marketplace', 'FinTech']::industry_type[],
    ARRAY['Europe'],
    'standard', '11-20', ARRAY['pitch_deck'], FALSE, 'Typeform-based application.'
),
(
    'Palm Drive Capital', 'https://palmdrive.vc/', 'https://formbricks-production-7002.up.railway.app/s/clwo0sdah000g94gj0hp5s319', NULL, 'form',
    ARRAY['Seed', 'Series A', 'Series B']::investment_stage[],
    ARRAY['B2B SaaS', 'FinTech', 'E-commerce']::industry_type[],
    ARRAY['North America', 'Europe'],
    'standard', '11-20', ARRAY['pitch_deck'], FALSE, NULL
),
(
    'Open Startup', 'https://open-startup.org/', 'https://open-startup.org/#get-in-contact', 'contact@open-startup.org', 'email',
    ARRAY['Pre-seed']::investment_stage[],
    ARRAY['B2B SaaS', 'Developer Tools']::industry_type[],
    ARRAY['Global'],
    'simple', '1-5', ARRAY['pitch_deck'], FALSE, 'Prefers email submissions with a loom video.'
);

-- Note: The data above contains assumptions for demonstration purposes.
-- You can adjust these values based on actual research. 