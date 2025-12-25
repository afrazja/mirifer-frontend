-- Mirifer Code-Based Authentication Setup

CREATE TABLE IF NOT EXISTS trial_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code VARCHAR(4) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

ALTER TABLE trial_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON trial_users
  FOR ALL USING (true);

ALTER TABLE entries ADD COLUMN IF NOT EXISTS trial_user_id UUID REFERENCES trial_users(id);

ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_user_id_day_key;

ALTER TABLE entries ADD CONSTRAINT entries_trial_user_id_day_key UNIQUE (trial_user_id, day);

INSERT INTO trial_users (access_code, display_name) VALUES
  ('3847', 'User 1'),
  ('5192', 'User 2'),
  ('7634', 'User 3'),
  ('2918', 'User 4'),
  ('6472', 'User 5'),
  ('1583', 'User 6'),
  ('8249', 'User 7'),
  ('4716', 'User 8'),
  ('9351', 'User 9'),
  ('2087', 'User 10'),
  ('5839', 'User 11'),
  ('7164', 'User 12'),
  ('3492', 'User 13'),
  ('6718', 'User 14'),
  ('1945', 'User 15'),
  ('8623', 'User 16'),
  ('4057', 'User 17'),
  ('9284', 'User 18'),
  ('2736', 'User 19'),
  ('5401', 'User 20'),
  ('7859', 'User 21'),
  ('3128', 'User 22'),
  ('6593', 'User 23'),
  ('1472', 'User 24'),
  ('8916', 'User 25'),
  ('4385', 'User 26'),
  ('9647', 'User 27'),
  ('2519', 'User 28'),
  ('5763', 'User 29'),
  ('7248', 'User 30'),
  ('3671', 'User 31'),
  ('6024', 'User 32'),
  ('1839', 'User 33'),
  ('8572', 'User 34'),
  ('4196', 'User 35'),
  ('9823', 'User 36'),
  ('2354', 'User 37'),
  ('5687', 'User 38'),
  ('7941', 'User 39'),
  ('3265', 'User 40'),
  ('6419', 'User 41'),
  ('1758', 'User 42'),
  ('8346', 'User 43'),
  ('4629', 'User 44'),
  ('9175', 'User 45'),
  ('2843', 'User 46'),
  ('5216', 'User 47'),
  ('7582', 'User 48'),
  ('3974', 'User 49'),
  ('6138', 'User 50')
ON CONFLICT (access_code) DO NOTHING;
