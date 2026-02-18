-- ============================================================================
-- WEEGYM DATABASE SCHEMA
-- ============================================================================
-- This script creates all necessary tables and policies for the WeeGym app
-- Run this in your Supabase SQL Editor to set up a new database instance
--
-- Tables:
--   1. workouts - Stores workout sessions
--   2. active_wellbeing_sessions - Stores active wellbeing machine sessions
--   3. user_settings - Stores user preferences and settings
--
-- All tables implement Row Level Security (RLS) to ensure users can only
-- access their own data
-- ============================================================================

-- ============================================================================
-- 1. WORKOUTS TABLE
-- ============================================================================

-- Create the workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  exercises JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;

-- Create RLS policies for workouts
CREATE POLICY "Users can view their own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. ACTIVE WELLBEING SESSIONS TABLE
-- ============================================================================

-- Create the active wellbeing sessions table
CREATE TABLE IF NOT EXISTS active_wellbeing_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  machine TEXT NOT NULL,
  mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON active_wellbeing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON active_wellbeing_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_machine_mode ON active_wellbeing_sessions(machine, mode);

-- Enable Row Level Security
ALTER TABLE active_wellbeing_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON active_wellbeing_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON active_wellbeing_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON active_wellbeing_sessions;

-- Create RLS policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON active_wellbeing_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON active_wellbeing_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON active_wellbeing_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. USER SETTINGS TABLE
-- ============================================================================

-- Create the user settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_rest_time INTEGER DEFAULT 90,
  short_rest_time INTEGER DEFAULT 60,
  long_rest_time INTEGER DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- Create RLS policies for settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the setup

-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('workouts', 'active_wellbeing_sessions', 'user_settings');

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('workouts', 'active_wellbeing_sessions', 'user_settings');

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('workouts', 'active_wellbeing_sessions', 'user_settings');

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Data Types:
--   - workouts.exercises: JSONB storing array of exercise objects
--   - workouts.duration: INTEGER in seconds
--   - *_sessions.date: DATE or TIMESTAMPTZ for timestamp
--   - user_settings.*_time: INTEGER in seconds
--
-- Row Level Security:
--   - All tables use auth.uid() to restrict access to own data
--   - Requires users to be authenticated
--   - Data is automatically filtered by user_id
--
-- Indexes:
--   - user_id indexes for faster filtering
--   - date indexes for chronological queries
--   - Composite indexes for common query patterns
--
-- ============================================================================
