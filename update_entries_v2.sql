-- SQL Migration to add is_completed column
ALTER TABLE entries ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- Update existing entries with ai_text to be completed
UPDATE entries SET is_completed = true WHERE ai_text IS NOT NULL AND ai_text != '';
