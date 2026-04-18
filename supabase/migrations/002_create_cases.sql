-- Migration 002: cases table
-- Run after 001_create_profiles.sql

CREATE TABLE IF NOT EXISTS cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- User input
  title           TEXT NOT NULL,
  image_path      TEXT,

  -- Pipeline status
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN (
                    'pending',
                    'diagnosing',
                    'diagnosis_complete',
                    'searching_products',
                    'ranking_products',
                    'complete',
                    'error'
                  )),
  error_message   TEXT,

  -- Diagnosis output
  conditions          JSONB,
  selected_condition  TEXT,

  -- Product pipeline output
  raw_products_and_reviews  JSONB,
  ranked_products           JSONB,

  -- Denormalised top recommendation (for quick display on cases list)
  top_product  JSONB
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cases_updated_at ON cases;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Row Level Security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cases"
  ON cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases"
  ON cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON cases FOR UPDATE
  USING (auth.uid() = user_id);
