-- Migration: Add Multi-Account Support for Strava
-- Created: June 30, 2026
-- Purpose: Allow users to connect multiple Strava OAuth apps (e.g., free and paid accounts)

-- ============================================================
-- Step 1: Add app_name column to track which OAuth app
-- ============================================================

-- Add app_name column (defaults to 'primary' for existing connections)
ALTER TABLE strava_connections 
ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'primary';

-- Add is_active column to track which connection is currently active
ALTER TABLE strava_connections 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing connections to be marked as 'primary' and active
UPDATE strava_connections 
SET app_name = 'primary', is_active = true 
WHERE app_name IS NULL;

-- Make app_name NOT NULL after setting defaults
ALTER TABLE strava_connections 
ALTER COLUMN app_name SET NOT NULL;

-- ============================================================
-- Step 2: Update UNIQUE constraint to allow multiple connections per user
-- ============================================================

-- Drop the old UNIQUE constraint on user_id only
ALTER TABLE strava_connections 
DROP CONSTRAINT IF EXISTS strava_connections_user_id_key;

-- Add new UNIQUE constraint on (user_id, app_name)
-- This allows multiple connections per user, but only one per app
ALTER TABLE strava_connections 
ADD CONSTRAINT strava_connections_user_app_unique 
UNIQUE (user_id, app_name);

-- ============================================================
-- Step 3: Add app_name to strava_activities to track source
-- ============================================================

-- Add app_name column to activities table
ALTER TABLE strava_activities 
ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'primary';

-- Update existing activities to be associated with 'primary' app
UPDATE strava_activities 
SET app_name = 'primary' 
WHERE app_name IS NULL;

-- Make app_name NOT NULL
ALTER TABLE strava_activities 
ALTER COLUMN app_name SET NOT NULL;

-- Update UNIQUE constraint on activities to include app_name
ALTER TABLE strava_activities 
DROP CONSTRAINT IF EXISTS strava_activities_user_id_strava_id_key;

ALTER TABLE strava_activities 
ADD CONSTRAINT strava_activities_user_app_strava_unique 
UNIQUE (user_id, app_name, strava_id);

-- ============================================================
-- Step 4: Add indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_strava_connections_user_app 
ON strava_connections(user_id, app_name);

CREATE INDEX IF NOT EXISTS idx_strava_connections_active 
ON strava_connections(user_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_strava_activities_user_app 
ON strava_activities(user_id, app_name, start_date DESC);

-- ============================================================
-- Step 5: Add helper function to get active connection
-- ============================================================

CREATE OR REPLACE FUNCTION get_active_strava_connection(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  athlete_id BIGINT,
  app_name TEXT,
  athlete_data JSONB,
  connected_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.user_id,
    sc.athlete_id,
    sc.app_name,
    sc.athlete_data,
    sc.connected_at,
    sc.last_sync,
    sc.is_active
  FROM strava_connections sc
  WHERE sc.user_id = p_user_id 
    AND sc.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Step 6: Add helper function to switch active connection
-- ============================================================

CREATE OR REPLACE FUNCTION set_active_strava_connection(
  p_user_id UUID,
  p_app_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Deactivate all connections for this user
  UPDATE strava_connections 
  SET is_active = false 
  WHERE user_id = p_user_id;
  
  -- Activate the specified connection
  UPDATE strava_connections 
  SET is_active = true 
  WHERE user_id = p_user_id 
    AND app_name = p_app_name;
  
  -- Return true if a connection was activated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Verification Queries (run these to check migration)
-- ============================================================

-- Check existing connections
-- SELECT user_id, app_name, is_active, athlete_data->>'firstname' as name, connected_at 
-- FROM strava_connections 
-- ORDER BY user_id, app_name;

-- Check activity counts per app
-- SELECT user_id, app_name, COUNT(*) as activity_count 
-- FROM strava_activities 
-- GROUP BY user_id, app_name 
-- ORDER BY user_id, app_name;

-- ============================================================
-- Notes
-- ============================================================
-- 
-- This migration:
-- ✅ Preserves all existing data (marked as 'primary' app)
-- ✅ Allows multiple Strava connections per user
-- ✅ Tracks which connection is currently active
-- ✅ Associates activities with their source app
-- ✅ Maintains all RLS policies
-- ✅ Adds helper functions for easy connection management
--
-- Usage:
-- 1. Apply this migration in Supabase SQL Editor
-- 2. Update .env with new app credentials (see .env.example)
-- 3. Update stravaService.js to use app_name parameter
-- 4. Update UI to allow switching between connections
