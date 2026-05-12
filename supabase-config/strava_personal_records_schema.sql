-- Personal Records (PRs) tracking for Strava activities
-- Created: May 12, 2026
-- Purpose: Track best performances across activity types and time periods

-- Drop existing table if needed (for clean reinstall)
-- DROP TABLE IF EXISTS strava_personal_records CASCADE;

CREATE TABLE IF NOT EXISTS strava_personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- PR Identification
  activity_type TEXT NOT NULL,        -- 'Ride', 'Run', 'Walk', 'Hike'
  pr_category TEXT NOT NULL,          -- 'longest_distance', 'most_elevation', etc.
  
  -- PR Data
  record_value DECIMAL NOT NULL,      -- The actual record (distance in meters, time in seconds, etc.)
  record_unit TEXT NOT NULL,          -- 'meters', 'seconds', 'meters_per_second', 'calories'
  
  -- Activity Reference
  activity_id UUID NOT NULL REFERENCES strava_activities(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL, -- Original Strava ID for linking
  activity_name TEXT,
  activity_date TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  set_at TIMESTAMPTZ DEFAULT NOW(),
  previous_record_value DECIMAL,      -- What was beaten (for showing improvement)
  time_scope TEXT DEFAULT 'all_time', -- 'all_time', 'year', 'month'
  
  -- Ensure one PR per category per time scope per activity type
  UNIQUE(user_id, activity_type, pr_category, time_scope)
);

-- Enable Row Level Security
ALTER TABLE strava_personal_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own PRs
CREATE POLICY "Users can view own PRs"
  ON strava_personal_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own PRs (via service)
CREATE POLICY "Users can insert own PRs"
  ON strava_personal_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own PRs
CREATE POLICY "Users can update own PRs"
  ON strava_personal_records
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own PRs
CREATE POLICY "Users can delete own PRs"
  ON strava_personal_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for fast queries
CREATE INDEX idx_strava_prs_user ON strava_personal_records(user_id, activity_type);
CREATE INDEX idx_strava_prs_category ON strava_personal_records(user_id, pr_category);
CREATE INDEX idx_strava_prs_time_scope ON strava_personal_records(user_id, time_scope);
CREATE INDEX idx_strava_prs_date ON strava_personal_records(user_id, activity_date DESC);

-- Comments for documentation
COMMENT ON TABLE strava_personal_records IS 'Personal records (PRs) for Strava activities, tracked by activity type and time period';
COMMENT ON COLUMN strava_personal_records.activity_type IS 'Type of activity: Ride, Run, Walk, Hike, etc.';
COMMENT ON COLUMN strava_personal_records.pr_category IS 'Category: longest_distance, most_elevation, highest_avg_speed, longest_duration, most_calories, max_speed';
COMMENT ON COLUMN strava_personal_records.record_value IS 'Numeric value of the record in base units';
COMMENT ON COLUMN strava_personal_records.record_unit IS 'Unit of measurement: meters, seconds, meters_per_second, calories';
COMMENT ON COLUMN strava_personal_records.time_scope IS 'Time period: all_time, year, month';

-- Grant access (already handled by RLS policies)
