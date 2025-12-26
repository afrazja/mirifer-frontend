-- Mirifer KPI Queries
-- Run these in Supabase SQL Editor to track key metrics
-- Copy results to Google Sheets for weekly tracking

-- ============================================
-- TIER 1: CORE IMPACT METRICS
-- ============================================

-- 1. JOURNEY COMPLETION RATE
-- % of users who complete all 14 days
SELECT 
  COUNT(DISTINCT trial_user_id) FILTER (WHERE days_completed = 14) as completed_users,
  COUNT(DISTINCT trial_user_id) as total_users,
  ROUND(
    COUNT(DISTINCT trial_user_id) FILTER (WHERE days_completed = 14) * 100.0 / 
    NULLIF(COUNT(DISTINCT trial_user_id), 0), 
    2
  ) as completion_rate_percent
FROM (
  SELECT 
    trial_user_id, 
    COUNT(DISTINCT day) as days_completed
  FROM entries
  WHERE is_completed = true
  GROUP BY trial_user_id
) subquery;

-- 2. DAY-TO-DAY RETENTION (D1 Retention)
-- % of users who complete Day 2 after completing Day 1
SELECT 
  COUNT(DISTINCT d1.trial_user_id) as day1_completers,
  COUNT(DISTINCT d2.trial_user_id) as day2_completers,
  ROUND(
    COUNT(DISTINCT d2.trial_user_id) * 100.0 / 
    NULLIF(COUNT(DISTINCT d1.trial_user_id), 0),
    2
  ) as d1_retention_percent
FROM (
  SELECT trial_user_id FROM entries WHERE day = 1 AND is_completed = true
) d1
LEFT JOIN (
  SELECT trial_user_id FROM entries WHERE day = 2 AND is_completed = true
) d2 ON d1.trial_user_id = d2.trial_user_id;

-- 3. REFLECTION DEPTH SCORE
-- Average word count in user reflections
SELECT 
  ROUND(AVG(LENGTH(user_text) - LENGTH(REPLACE(user_text, ' ', '')) + 1)) as avg_word_count,
  MIN(LENGTH(user_text) - LENGTH(REPLACE(user_text, ' ', '')) + 1) as min_words,
  MAX(LENGTH(user_text) - LENGTH(REPLACE(user_text, ' ', '')) + 1) as max_words
FROM entries
WHERE user_text IS NOT NULL 
  AND user_text != '' 
  AND is_completed = true;

-- 4. SURVEY COMPLETION RATE
-- % of journey completers who submit survey
SELECT 
  COUNT(DISTINCT completers.trial_user_id) as eligible_users,
  COUNT(DISTINCT sr.trial_user_id) as survey_submissions,
  ROUND(
    COUNT(DISTINCT sr.trial_user_id) * 100.0 / 
    NULLIF(COUNT(DISTINCT completers.trial_user_id), 0),
    2
  ) as survey_completion_percent
FROM (
  SELECT trial_user_id 
  FROM entries 
  WHERE is_completed = true 
  GROUP BY trial_user_id 
  HAVING COUNT(DISTINCT day) = 14
) completers
LEFT JOIN survey_responses sr ON completers.trial_user_id = sr.trial_user_id;

-- ============================================
-- TIER 2: DIAGNOSTIC METRICS
-- ============================================

-- 5. DROP-OFF POINTS
-- Which days have highest abandonment
SELECT 
  day,
  COUNT(DISTINCT trial_user_id) as users_who_completed_this_day,
  LAG(COUNT(DISTINCT trial_user_id)) OVER (ORDER BY day) as users_from_previous_day,
  ROUND(
    (LAG(COUNT(DISTINCT trial_user_id)) OVER (ORDER BY day) - COUNT(DISTINCT trial_user_id)) * 100.0 /
    NULLIF(LAG(COUNT(DISTINCT trial_user_id)) OVER (ORDER BY day), 0),
    2
  ) as drop_off_percent
FROM entries
WHERE is_completed = true
GROUP BY day
ORDER BY day;

-- 6. TIME TO COMPLETE JOURNEY
-- Days from Day 1 to Day 14 completion
SELECT 
  ROUND(AVG(days_to_complete)) as avg_days,
  MIN(days_to_complete) as fastest,
  MAX(days_to_complete) as slowest
FROM (
  SELECT 
    trial_user_id,
    EXTRACT(DAY FROM (MAX(updated_at) - MIN(updated_at))) as days_to_complete
  FROM entries
  WHERE is_completed = true
  GROUP BY trial_user_id
  HAVING COUNT(DISTINCT day) = 14
) completion_times;

-- 7. DATA WIPE RATE
-- % of users who wiped their data
SELECT 
  COUNT(DISTINCT trial_user_id) FILTER (WHERE has_wiped_data) as users_who_wiped,
  COUNT(DISTINCT trial_user_id) as total_users,
  ROUND(
    COUNT(DISTINCT trial_user_id) FILTER (WHERE has_wiped_data) * 100.0 /
    NULLIF(COUNT(DISTINCT trial_user_id), 0),
    2
  ) as wipe_rate_percent
FROM (
  SELECT 
    trial_user_id,
    BOOL_OR(is_completed = true AND (user_text = '' OR ai_text = '')) as has_wiped_data
  FROM entries
  GROUP BY trial_user_id
) wipe_check;

-- 8. PDF REPORT ELIGIBILITY
-- How many users are eligible for PDF reports
SELECT 
  COUNT(DISTINCT e.trial_user_id) as users_eligible_for_pdf,
  COUNT(DISTINCT tu.id) as total_users,
  ROUND(
    COUNT(DISTINCT e.trial_user_id) * 100.0 /
    NULLIF(COUNT(DISTINCT tu.id), 0),
    2
  ) as eligibility_percent
FROM trial_users tu
LEFT JOIN (
  SELECT trial_user_id
  FROM entries
  WHERE is_completed = true 
    AND user_text != '' 
    AND ai_text != ''
  GROUP BY trial_user_id
  HAVING COUNT(DISTINCT day) = 14
) e ON tu.id = e.trial_user_id;

-- ============================================
-- TIER 3: SURVEY INSIGHTS (QUALITATIVE)
-- ============================================

-- 9. THOUGHT CHANGE DISTRIBUTION
-- Breakdown of impact levels
SELECT 
  thought_change,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM survey_responses
WHERE thought_change IS NOT NULL
GROUP BY thought_change
ORDER BY count DESC;

-- 10. WOULD MISS IT RATE
-- % who would miss Mirifer
SELECT 
  would_miss,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM survey_responses
GROUP BY would_miss
ORDER BY count DESC;

-- 11. SURVEY DEFINITIONS
-- Most common words in "What is Mirifer to you?"
-- Note: This is a simple version. For deeper analysis, export to text analysis tool
SELECT 
  definition,
  LENGTH(definition) as char_count,
  submitted_at
FROM survey_responses
WHERE definition IS NOT NULL AND definition != ''
ORDER BY submitted_at DESC;

-- ============================================
-- BONUS: WEEKLY SNAPSHOT
-- ============================================

-- ALL KEY METRICS IN ONE VIEW
-- Run this weekly and save to Google Sheets
SELECT 
  'Total Users' as metric,
  COUNT(DISTINCT trial_user_id)::text as value
FROM entries
UNION ALL
SELECT 
  'Journey Completers',
  COUNT(DISTINCT trial_user_id)::text
FROM (
  SELECT trial_user_id FROM entries WHERE is_completed = true GROUP BY trial_user_id HAVING COUNT(DISTINCT day) = 14
) c
UNION ALL
SELECT 
  'Completion Rate %',
  ROUND(
    COUNT(DISTINCT trial_user_id) FILTER (WHERE days_completed = 14) * 100.0 / 
    NULLIF(COUNT(DISTINCT trial_user_id), 0), 2
  )::text
FROM (
  SELECT trial_user_id, COUNT(DISTINCT day) as days_completed FROM entries WHERE is_completed = true GROUP BY trial_user_id
) s
UNION ALL
SELECT 
  'Survey Submissions',
  COUNT(*)::text
FROM survey_responses
UNION ALL
SELECT 
  'Avg Reflection Words',
  ROUND(AVG(LENGTH(user_text) - LENGTH(REPLACE(user_text, ' ', '')) + 1))::text
FROM entries WHERE user_text IS NOT NULL AND user_text != '' AND is_completed = true;
