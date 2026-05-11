-- Strava Integration Schema
-- Phase 2: Backend Implementation
-- Created: May 11, 2026

-- ============================================================
-- Table 1: Strava Connection Tokens
-- ============================================================
-- Stores OAuth tokens and connection status for each user

CREATE TABLE IF NOT EXISTS strava_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id BIGINT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  athlete_data JSONB,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/manage their own connection
CREATE POLICY "Users can manage own Strava connection"
  ON strava_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Table 2: Cached Strava Activities
-- ============================================================
-- Stores activities locally for fast access and history

CREATE TABLE IF NOT EXISTS strava_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Ride', 'Walk', 'Run', etc.
  start_date TIMESTAMPTZ NOT NULL,
  distance DECIMAL, -- meters
  moving_time INTEGER, -- seconds
  elapsed_time INTEGER, -- seconds
  total_elevation_gain DECIMAL, -- meters
  average_speed DECIMAL, -- m/s
  max_speed DECIMAL, -- m/s
  average_heartrate DECIMAL,
  max_heartrate DECIMAL,
  calories DECIMAL,
  activity_data JSONB, -- full Strava response for future expansion
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strava_id)
);

-- Enable Row Level Security
ALTER TABLE strava_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own activities
CREATE POLICY "Users can view own Strava activities"
  ON strava_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service can insert/update user activities
CREATE POLICY "Users can manage own Strava activities"
  ON strava_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Strava activities"
  ON strava_activities
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Indexes for Performance
-- ============================================================

-- Index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_strava_activities_user_date 
  ON strava_activities(user_id, start_date DESC);

-- Index for activity type filtering
CREATE INDEX IF NOT EXISTS idx_strava_activities_type 
  ON strava_activities(user_id, type);

-- Index for strava_id lookups (deduplication)
CREATE INDEX IF NOT EXISTS idx_strava_activities_strava_id 
  ON strava_activities(strava_id);

-- Index for sync timestamp queries
CREATE INDEX IF NOT EXISTS idx_strava_connections_last_sync 
  ON strava_connections(user_id, last_sync);

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE strava_connections IS 'Stores Strava OAuth tokens and connection status for each user';
COMMENT ON TABLE strava_activities IS 'Caches Strava activities locally for fast access and offline availability';

COMMENT ON COLUMN strava_connections.athlete_id IS 'Strava athlete ID';
COMMENT ON COLUMN strava_connections.expires_at IS 'Token expiration timestamp (typically 6 hours from issue)';
COMMENT ON COLUMN strava_connections.athlete_data IS 'Full athlete profile data from Strava API';
COMMENT ON COLUMN strava_connections.last_sync IS 'Timestamp of last successful activity sync';

COMMENT ON COLUMN strava_activities.strava_id IS 'Original activity ID from Strava';
COMMENT ON COLUMN strava_activities.type IS 'Activity type: Ride, Walk, Run, Swim, etc.';
COMMENT ON COLUMN strava_activities.distance IS 'Distance in meters';
COMMENT ON COLUMN strava_activities.moving_time IS 'Moving time in seconds (excludes pauses)';
COMMENT ON COLUMN strava_activities.elapsed_time IS 'Total elapsed time in seconds (includes pauses)';
COMMENT ON COLUMN strava_activities.calories IS 'Calories burned: from Strava API if available (direct or kilojoules*0.239), otherwise estimated from heart rate and activity type';
COMMENT ON COLUMN strava_activities.activity_data IS 'Full Strava API response for future feature expansion';
