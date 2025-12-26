-- Reflection Survey Database Schema
-- Run this in your Supabase SQL Editor

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_user_id UUID REFERENCES trial_users(id),
  access_code VARCHAR(20),
  
  -- Section 1: Experience
  thought_change VARCHAR(50),
  what_changed TEXT,
  question_stayed BOOLEAN,
  which_question TEXT,
  
  -- Section 2: Fit & Friction
  felt_resistance VARCHAR(50),
  resistance_type TEXT,
  experience_statement VARCHAR(100),
  least_useful_period VARCHAR(50),
  least_useful_explanation TEXT,
  
  -- Section 3: Meaning
  would_miss BOOLEAN,
  why_miss TEXT,
  not_work_for TEXT,
  who_for TEXT,
  
  -- Section 4: Direction
  length_feeling VARCHAR(50),
  length_why TEXT,
  expected_next VARCHAR(100),
  
  -- Final Question
  definition TEXT,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own responses" ON survey_responses;
DROP POLICY IF EXISTS "Service role can read all" ON survey_responses;

-- Policy: Users can only insert their own responses
CREATE POLICY "Users can insert own responses" ON survey_responses
  FOR INSERT WITH CHECK (true);

-- Policy: Service role can read all
CREATE POLICY "Service role can read all" ON survey_responses
  FOR SELECT USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_survey_trial_user ON survey_responses(trial_user_id);
CREATE INDEX IF NOT EXISTS idx_survey_submitted ON survey_responses(submitted_at DESC);
