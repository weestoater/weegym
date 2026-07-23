-- Unified Activities Management
-- Created: July 23, 2026
-- Purpose: Support importing activities from multiple sources and prevent duplicates

-- ============================================================
-- Enhanced Activity Storage with Source Tracking
-- ============================================================

-- Add columns to track import source and prevent duplicates
ALTER TABLE strava_activities 
ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'strava_sync',
ADD COLUMN IF NOT EXISTS original_source_id TEXT,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES strava_activities(id),
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ DEFAULT NOW();

-- Update import_source for existing records
UPDATE strava_activities 
SET import_source = 'strava_sync'
WHERE import_source IS NULL;

COMMENT ON COLUMN strava_activities.import_source IS 'Source of the activity: strava_sync, manual_import, csv_import, gpx_import';
COMMENT ON COLUMN strava_activities.original_source_id IS 'Original ID from source system (e.g., Strava ID from old account)';
COMMENT ON COLUMN strava_activities.is_duplicate IS 'Flag indicating if this is a duplicate of another activity';
COMMENT ON COLUMN strava_activities.duplicate_of IS 'Reference to the original activity if this is a duplicate';

-- ============================================================
-- Smart Duplicate Detection Function
-- ============================================================
-- Finds potential duplicates based on start time, type, distance, and duration
-- (not just strava_id, since same activity from different accounts has different IDs)

CREATE OR REPLACE FUNCTION find_duplicate_activities(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_type TEXT,
  p_distance DECIMAL,
  p_moving_time INTEGER,
  p_tolerance_seconds INTEGER DEFAULT 300  -- 5 minutes tolerance
)
RETURNS TABLE (
  id UUID,
  strava_id BIGINT,
  app_name TEXT,
  name TEXT,
  start_date TIMESTAMPTZ,
  distance DECIMAL,
  moving_time INTEGER,
  similarity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.id,
    sa.strava_id,
    sa.app_name,
    sa.name,
    sa.start_date,
    sa.distance,
    sa.moving_time,
    -- Calculate similarity score (0-100)
    (
      CASE 
        WHEN ABS(EXTRACT(EPOCH FROM (sa.start_date - p_start_date))) <= p_tolerance_seconds 
        THEN 40 
        ELSE 0 
      END
      +
      CASE 
        WHEN sa.type = p_type 
        THEN 30 
        ELSE 0 
      END
      +
      CASE 
        WHEN p_distance IS NOT NULL AND sa.distance IS NOT NULL 
          AND ABS(sa.distance - p_distance) / GREATEST(sa.distance, p_distance) < 0.05  -- 5% tolerance
        THEN 20 
        ELSE 0 
      END
      +
      CASE 
        WHEN p_moving_time IS NOT NULL AND sa.moving_time IS NOT NULL 
          AND ABS(sa.moving_time - p_moving_time) < 60  -- 1 minute tolerance
        THEN 10 
        ELSE 0 
      END
    )::DECIMAL as similarity_score
  FROM strava_activities sa
  WHERE sa.user_id = p_user_id
    AND sa.is_duplicate = false  -- Only check against non-duplicates
    AND sa.start_date BETWEEN (p_start_date - INTERVAL '1 hour') AND (p_start_date + INTERVAL '1 hour')
    AND sa.type = p_type
  HAVING 
    -- Only return activities with >70% similarity
    (
      CASE WHEN ABS(EXTRACT(EPOCH FROM (sa.start_date - p_start_date))) <= p_tolerance_seconds THEN 40 ELSE 0 END
      + CASE WHEN sa.type = p_type THEN 30 ELSE 0 END
      + CASE WHEN p_distance IS NOT NULL AND sa.distance IS NOT NULL 
          AND ABS(sa.distance - p_distance) / GREATEST(sa.distance, p_distance) < 0.05 THEN 20 ELSE 0 END
      + CASE WHEN p_moving_time IS NOT NULL AND sa.moving_time IS NOT NULL 
          AND ABS(sa.moving_time - p_moving_time) < 60 THEN 10 ELSE 0 END
    ) > 70
  ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Unified Activities View
-- ============================================================
-- Shows all activities across all sources, excluding duplicates

CREATE OR REPLACE VIEW unified_activities AS
SELECT 
  sa.id,
  sa.user_id,
  sa.strava_id,
  sa.app_name,
  sa.import_source,
  sa.name,
  sa.type,
  sa.start_date,
  sa.distance,
  sa.moving_time,
  sa.elapsed_time,
  sa.total_elevation_gain,
  sa.average_speed,
  sa.max_speed,
  sa.average_heartrate,
  sa.max_heartrate,
  sa.calories,
  sa.synced_at,
  sa.imported_at,
  sa.is_duplicate,
  sa.duplicate_of,
  -- Add computed fields
  CASE 
    WHEN sa.distance IS NOT NULL AND sa.moving_time IS NOT NULL AND sa.moving_time > 0
    THEN sa.distance / sa.moving_time
    ELSE NULL
  END as pace,
  CASE 
    WHEN sa.import_source = 'strava_sync' THEN '🔗 Synced from Strava'
    WHEN sa.import_source = 'manual_import' THEN '📥 Manually Imported'
    WHEN sa.import_source = 'csv_import' THEN '📊 CSV Import'
    WHEN sa.import_source = 'gpx_import' THEN '📍 GPX Import'
    ELSE '❓ Unknown Source'
  END as source_label
FROM strava_activities sa
WHERE sa.is_duplicate = false  -- Exclude duplicates from main view
ORDER BY sa.start_date DESC;

COMMENT ON VIEW unified_activities IS 'Unified view of all activities from all sources, excluding duplicates';

-- ============================================================
-- Activity Statistics by Source
-- ============================================================

CREATE OR REPLACE VIEW activity_stats_by_source AS
SELECT 
  user_id,
  import_source,
  COUNT(*) as total_activities,
  COUNT(DISTINCT type) as activity_types,
  SUM(distance) as total_distance_meters,
  SUM(moving_time) as total_moving_time_seconds,
  SUM(calories) as total_calories,
  MIN(start_date) as earliest_activity,
  MAX(start_date) as latest_activity
FROM strava_activities
WHERE is_duplicate = false
GROUP BY user_id, import_source;

-- ============================================================
-- Indexes for Performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_activities_import_source 
ON strava_activities(user_id, import_source);

CREATE INDEX IF NOT EXISTS idx_activities_duplicate 
ON strava_activities(user_id, is_duplicate) 
WHERE is_duplicate = false;

CREATE INDEX IF NOT EXISTS idx_activities_start_type 
ON strava_activities(user_id, start_date, type);

-- For duplicate detection
CREATE INDEX IF NOT EXISTS idx_activities_dedup_lookup
ON strava_activities(user_id, type, start_date)
WHERE is_duplicate = false;

-- ============================================================
-- Helper Function: Mark Duplicate
-- ============================================================

CREATE OR REPLACE FUNCTION mark_as_duplicate(
  p_duplicate_id UUID,
  p_original_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE strava_activities
  SET 
    is_duplicate = true,
    duplicate_of = p_original_id
  WHERE id = p_duplicate_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Helper Function: Merge Activity Data
-- ============================================================
-- When you have the same activity from multiple sources,
-- this merges data preferring more complete records

CREATE OR REPLACE FUNCTION merge_activity_data(
  p_keep_id UUID,
  p_duplicate_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_keep RECORD;
  v_dup RECORD;
BEGIN
  -- Get both activities
  SELECT * INTO v_keep FROM strava_activities WHERE id = p_keep_id;
  SELECT * INTO v_dup FROM strava_activities WHERE id = p_duplicate_id;
  
  -- Merge data, preferring non-null values from either record
  UPDATE strava_activities
  SET
    calories = COALESCE(v_keep.calories, v_dup.calories),
    average_heartrate = COALESCE(v_keep.average_heartrate, v_dup.average_heartrate),
    max_heartrate = COALESCE(v_keep.max_heartrate, v_dup.max_heartrate),
    total_elevation_gain = COALESCE(v_keep.total_elevation_gain, v_dup.total_elevation_gain),
    -- Merge activity_data JSONBs
    activity_data = v_keep.activity_data || v_dup.activity_data
  WHERE id = p_keep_id;
  
  -- Mark duplicate
  UPDATE strava_activities
  SET 
    is_duplicate = true,
    duplicate_of = p_keep_id
  WHERE id = p_duplicate_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check for potential duplicates
-- SELECT * FROM find_duplicate_activities(
--   'your-user-id'::UUID,
--   '2024-07-01 10:00:00'::TIMESTAMPTZ,
--   'Ride',
--   15000.0,
--   3600
-- );

-- View all activities with sources
-- SELECT 
--   start_date,
--   name,
--   type,
--   import_source,
--   app_name,
--   ROUND(distance/1000, 2) as km,
--   ROUND(calories) as cal
-- FROM unified_activities
-- LIMIT 20;

-- Check stats by source
-- SELECT * FROM activity_stats_by_source;
