-- ============================================================================
-- ADD SLIMMING WORLD SETTINGS TO USER PROFILES
-- ============================================================================
-- This migration adds Slimming World tracking fields to the user_profiles table
--
-- Fields:
--   - on_slimming_world: Boolean indicating if user follows Slimming World plan
--   - slimming_world_daily_syns: Daily Syns allowance for the user
-- ============================================================================

-- Add the new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS on_slimming_world BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slimming_world_daily_syns INTEGER DEFAULT 15;

-- Add index for querying Slimming World users
CREATE INDEX IF NOT EXISTS idx_user_profiles_slimming_world ON user_profiles(on_slimming_world);

-- Update existing users to have default values (false and 15 Syns)
UPDATE user_profiles
SET on_slimming_world = false,
    slimming_world_daily_syns = 15
WHERE on_slimming_world IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.on_slimming_world IS 
  'Indicates if the user is following the Slimming World diet plan';

COMMENT ON COLUMN user_profiles.slimming_world_daily_syns IS 
  'Daily Syns allowance for Slimming World users (typically 5-15 Syns per day)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that the columns exist
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND column_name IN ('on_slimming_world', 'slimming_world_daily_syns')
ORDER BY ordinal_position;

-- Check a sample of user profiles
SELECT 
  user_id,
  display_name,
  on_slimming_world,
  slimming_world_daily_syns
FROM user_profiles
LIMIT 5;

-- ============================================================================
-- ROLLBACK (uncomment if you need to undo this migration)
-- ============================================================================
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS on_slimming_world;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS slimming_world_daily_syns;
-- DROP INDEX IF EXISTS idx_user_profiles_slimming_world;
