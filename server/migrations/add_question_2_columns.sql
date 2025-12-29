-- Add columns for Question 2 and its responses
ALTER TABLE entries
ADD COLUMN IF NOT EXISTS question_2 TEXT,
ADD COLUMN IF NOT EXISTS user_text_2 TEXT,
ADD COLUMN IF NOT EXISTS ai_text_2 TEXT,
ADD COLUMN IF NOT EXISTS question_2_generated_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN entries.question_2 IS 'AI-generated follow-up question based on user_text';
COMMENT ON COLUMN entries.user_text_2 IS 'User response to question_2';
COMMENT ON COLUMN entries.ai_text_2 IS 'AI reflection on user_text_2';
COMMENT ON COLUMN entries.question_2_generated_at IS 'Timestamp when question_2 was generated';
