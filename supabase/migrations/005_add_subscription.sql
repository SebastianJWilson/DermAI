-- Migration 005: Add subscription tier to profiles
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium'));
