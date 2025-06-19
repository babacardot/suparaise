-- --------------------------------------------------
-- Supabase Storage Buckets
-- --------------------------------------------------

-- 1. Create the 'logos' bucket for startup logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the 'pitch_decks' bucket for pitch decks
INSERT INTO storage.buckets (id, name, public)
VALUES ('pitch_decks', 'pitch_decks', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create the 'intro_videos' bucket for intro videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('intro_videos', 'intro_videos', true)
ON CONFLICT (id) DO NOTHING;


-- --------------------------------------------------
-- Storage Security Policies
-- --------------------------------------------------

-- Logos: Anyone can view, authenticated users can upload/edit/delete their own.
CREATE POLICY "Allow public read on logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Allow authenticated users to manage their logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their own logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'logos' AND auth.role() = 'authenticated');


-- Pitch Decks: Same policies as logos
CREATE POLICY "Allow public read on pitch_decks"
ON storage.objects FOR SELECT
USING (bucket_id = 'pitch_decks');

CREATE POLICY "Allow authenticated users to manage their pitch_decks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pitch_decks' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own pitch_decks"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pitch_decks' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their own pitch_decks"
ON storage.objects FOR DELETE
USING (bucket_id = 'pitch_decks' AND auth.role() = 'authenticated');


-- Intro Videos: Same policies as logos
CREATE POLICY "Allow public read on intro_videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'intro_videos');

CREATE POLICY "Allow authenticated users to manage their intro_videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'intro_videos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own intro_videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'intro_videos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their own intro_videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'intro_videos' AND auth.role() = 'authenticated'); 