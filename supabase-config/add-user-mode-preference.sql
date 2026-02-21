-- ============================================================================
-- ADD USER MODE PREFERENCE
-- ============================================================================
-- This migration adds a user_mode field to user_profiles table to allow
-- users to choose between:
--   - 'programme': Full workout programme with machines (default)
--   - 'wellbeing_only': Only track wellbeing activities without a programme
--
-- This enables personalized landing page experiences for each user
-- ============================================================================

-- Step 1: Add user_mode column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_mode TEXT DEFAULT 'programme' CHECK (user_mode IN ('programme', 'wellbeing_only'));

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_mode ON user_profiles(user_mode);

-- Step 3: Set admin user (ian@weestoater.com) to programme mode
-- This ensures existing admin has the full programme experience
UPDATE user_profiles
SET user_mode = 'programme'
WHERE email = 'ian@weestoater.com' OR is_admin = true;

-- Step 4: Add comment explaining the column
COMMENT ON COLUMN user_profiles.user_mode IS 
  'User preference: programme (full workout programme) or wellbeing_only (just wellbeing tracking)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that the column was added successfully
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND column_name = 'user_mode';

-- Verify admin user mode
SELECT 
  display_name,
  email,
  user_mode,
  is_admin
FROM user_profiles
WHERE is_admin = true OR email = 'ian@weestoater.com';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- Run this if you need to remove the user_mode column:
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS user_mode;
-- DROP INDEX IF EXISTS idx_user_profiles_mode;
