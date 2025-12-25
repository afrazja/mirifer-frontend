-- EMERGENCY FIX: Remove mandatory user_id requirement
-- Run this in your Supabase SQL Editor

ALTER TABLE entries ALTER COLUMN user_id DROP NOT NULL;

-- Verify the change was successful by running this:
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'entries' AND column_name = 'user_id';
