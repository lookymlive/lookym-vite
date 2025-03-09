-- Create storage buckets for the application

-- Create videos bucket for merchant content
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for videos
CREATE POLICY "Videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Merchants can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND
  auth.uid() = owner AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'merchant'
  )
);

CREATE POLICY "Merchants can update their own videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos' AND
  auth.uid() = owner AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'merchant'
  )
);

CREATE POLICY "Merchants can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' AND
  auth.uid() = owner AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'merchant'
  )
);