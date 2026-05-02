-- ============================================================================
-- UPDATE SLIMMING WORLD DEFAULT SYN ALLOWANCE
-- ============================================================================
-- This migration updates the default Slimming World daily syns allowance
-- from 15 to 30 to match user requirements
-- ============================================================================

-- Update the default value for the column
ALTER TABLE user_profiles 
ALTER COLUMN slimming_world_daily_syns SET DEFAULT 30;

-- Update the comment to reflect the new range
COMMENT ON COLUMN user_profiles.slimming_world_daily_syns IS 
  'Daily Syns allowance for Slimming World users (typically 15-30 Syns per day)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check the updated column default
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND column_name = 'slimming_world_daily_syns';

-- Check current user values
SELECT 
  user_id,
  display_name,
  on_slimming_world,
  slimming_world_daily_syns
FROM user_profiles
ORDER BY display_name
LIMIT 10;

-- ============================================================================
-- NOTES
-- ============================================================================
-- This migration:
-- 1. Changes the default from 15 to 30 syns
-- 2. Does NOT update existing user records (preserves their current settings)
-- 3. Only affects NEW user profiles created after this migration
-- 
-- To update existing users to 30 syns, run:
-- UPDATE user_profiles SET slimming_world_daily_syns = 30 WHERE user_id = 'your-user-id';
-- ============================================================================
