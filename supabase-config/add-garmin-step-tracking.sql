-- Garmin Step Counter Integration Schema
-- Phase 2: Database Setup
-- Created: May 24, 2026

-- ============================================================
-- Table 1: Garmin Connection Tokens
-- ============================================================
-- Stores OAuth 1.0a tokens and connection status for each user

CREATE TABLE IF NOT EXISTS garmin_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  access_token_secret TEXT NOT NULL,
  garmin_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE garmin_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/manage their own connection
CREATE POLICY "Users can manage own Garmin connections"
  ON garmin_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_garmin_connections_user_id 
  ON garmin_connections(user_id);

-- ============================================================
-- Table 2: Daily Steps Data
-- ============================================================
-- Stores daily step count and wellness data

CREATE TABLE IF NOT EXISTS daily_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_steps INTEGER NOT NULL,
  goal_steps INTEGER DEFAULT 10000,
  distance_meters INTEGER,
  active_minutes INTEGER,
  calories_burned INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can manage own step data"
  ON daily_steps
  FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_steps_user_date 
  ON daily_steps(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_steps_date 
  ON daily_steps(date DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_steps_updated_at
  BEFORE UPDATE ON daily_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Table 3: Weekly Step Summaries
-- ============================================================
-- Pre-aggregated weekly statistics for performance

CREATE TABLE IF NOT EXISTS weekly_step_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_steps INTEGER NOT NULL,
  avg_daily_steps INTEGER NOT NULL,
  days_goal_met INTEGER DEFAULT 0,
  best_day_steps INTEGER,
  best_day_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Enable Row Level Security
ALTER TABLE weekly_step_summaries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own summaries
CREATE POLICY "Users can manage own weekly summaries"
  ON weekly_step_summaries
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_week 
  ON weekly_step_summaries(user_id, week_start DESC);

-- Trigger for weekly summaries
CREATE TRIGGER update_weekly_summaries_updated_at
  BEFORE UPDATE ON weekly_step_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE garmin_connections IS 'Stores Garmin OAuth 1.0a tokens and connection status for each user';
COMMENT ON TABLE daily_steps IS 'Daily step count and wellness data from Garmin';
COMMENT ON TABLE weekly_step_summaries IS 'Pre-aggregated weekly step statistics for performance';

COMMENT ON COLUMN garmin_connections.access_token IS 'OAuth 1.0a access token';
COMMENT ON COLUMN garmin_connections.access_token_secret IS 'OAuth 1.0a access token secret';
COMMENT ON COLUMN garmin_connections.garmin_user_id IS 'Garmin user identifier';
COMMENT ON COLUMN garmin_connections.last_sync IS 'Timestamp of last successful data sync';

COMMENT ON COLUMN daily_steps.total_steps IS 'Total steps taken on this date';
COMMENT ON COLUMN daily_steps.goal_steps IS 'Daily step goal (default 10000)';
COMMENT ON COLUMN daily_steps.distance_meters IS 'Distance covered in meters';
COMMENT ON COLUMN daily_steps.active_minutes IS 'Active time in minutes';
COMMENT ON COLUMN daily_steps.calories_burned IS 'Calories burned from steps/activity';

COMMENT ON COLUMN weekly_step_summaries.week_start IS 'Monday of the week (ISO week)';
COMMENT ON COLUMN weekly_step_summaries.week_end IS 'Sunday of the week';
COMMENT ON COLUMN weekly_step_summaries.total_steps IS 'Sum of all steps for the week';
COMMENT ON COLUMN weekly_step_summaries.avg_daily_steps IS 'Average daily steps for the week';
COMMENT ON COLUMN weekly_step_summaries.days_goal_met IS 'Number of days goal was achieved';
COMMENT ON COLUMN weekly_step_summaries.best_day_steps IS 'Highest step count in the week';
COMMENT ON COLUMN weekly_step_summaries.best_day_date IS 'Date of best day';
