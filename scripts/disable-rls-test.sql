-- ⚠️ TESTING ONLY - Temporarily Disable Row Level Security
-- This allows testing Supabase connection without authentication
-- DO NOT USE IN PRODUCTION

-- Disable RLS on all tables
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_wellbeing_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable with:
-- ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE active_wellbeing_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
