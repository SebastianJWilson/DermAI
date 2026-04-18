-- Migration 003: Storage bucket RLS policies for case-images
--
-- BEFORE running this script:
--   1. Go to Supabase Dashboard → Storage → New Bucket
--   2. Name it exactly:  case-images
--   3. Set it to Private (toggle off "Public bucket")
--   4. Click Save, then run this script.

CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'case-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Optional: allow users to delete their own images (not required for v1 but useful)
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
