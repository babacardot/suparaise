-- --------------------------------------------------
-- Supabase Storage Buckets
-- --------------------------------------------------

-- 1. Create the 'logos' bucket for startup logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the 'decks' bucket for pitch decks
INSERT INTO storage.buckets (id, name, public)
VALUES ('decks', 'decks', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create the 'videos' bucket for intro videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Create the 'support_request_images' bucket for support request attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('support_request_images', 'support_request_images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create the 'avatars' bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Create the 'financial_projections' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('financial_projections', 'financial_projections', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Create the 'business_plans' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('business_plans', 'business_plans', true)
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
CREATE POLICY "Allow public read on decks"
ON storage.objects FOR SELECT
USING (bucket_id = 'decks');

CREATE POLICY "Allow authenticated users to manage their deck"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'decks' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own deck"
ON storage.objects FOR UPDATE
USING (bucket_id = 'decks' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their own deck"
ON storage.objects FOR DELETE
USING (bucket_id = 'decks' AND auth.role() = 'authenticated');


-- Videos: Same policies as logos
CREATE POLICY "Allow public read on videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Allow authenticated users to manage their videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their own videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');


-- Support Request Images: Users can only access their own images
CREATE POLICY "Users can upload support request images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'support_request_images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view support request images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'support_request_images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
); 

-- Avatars: Public can read. Authenticated users can upload, update, and delete their own avatar.
-- The avatar file path will be prefixed with the user's UID. e.g., 'public/a1b2c3d4/avatar.png'

CREATE POLICY "Allow public read on avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Allow users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Allow users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Allow users to delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
); 

-- Financial Projections: Same policies as logos/decks
CREATE POLICY "Allow public read on financial_projections"
ON storage.objects FOR SELECT
USING (bucket_id = 'financial_projections');

CREATE POLICY "Allow authenticated users to manage their financial_projections"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'financial_projections' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own financial_projections"
ON storage.objects FOR UPDATE
USING (bucket_id = 'financial_projections' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their own financial_projections"
ON storage.objects FOR DELETE
USING (bucket_id = 'financial_projections' AND auth.role() = 'authenticated');


-- Business Plans: Same policies as logos/decks
CREATE POLICY "Allow public read on business_plans"
ON storage.objects FOR SELECT
USING (bucket_id = 'business_plans');

CREATE POLICY "Allow authenticated users to manage their business_plans"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business_plans' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own business_plans"
ON storage.objects FOR UPDATE
USING (bucket_id = 'business_plans' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their own business_plans"
ON storage.objects FOR DELETE
USING (bucket_id = 'business_plans' AND auth.role() = 'authenticated'); 