-- ============================================================================
-- CARDIO SESSIONS TABLE MIGRATION
-- ============================================================================
-- Add this table to enable cardio equipment tracking
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Create the cardio sessions table for tracking treadmill, rowing machine, cross trainer, etc.
CREATE TABLE IF NOT EXISTS cardio_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL CHECK (equipment_type IN ('Treadmill', 'Rowing Machine', 'Cross Trainer', 'Stationary Bike', 'Elliptical', 'Stair Climber')),
  duration_minutes INTEGER NOT NULL,
  distance_km DECIMAL(6,2),
  calories INTEGER,
  avg_heart_rate INTEGER,
  notes TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cardio_user_id ON cardio_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cardio_date ON cardio_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_cardio_equipment ON cardio_sessions(equipment_type);

-- Enable Row Level Security
ALTER TABLE cardio_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own cardio sessions" ON cardio_sessions;
DROP POLICY IF EXISTS "Users can insert their own cardio sessions" ON cardio_sessions;
DROP POLICY IF EXISTS "Users can update their own cardio sessions" ON cardio_sessions;
DROP POLICY IF EXISTS "Users can delete their own cardio sessions" ON cardio_sessions;

-- Create RLS policies for cardio sessions
CREATE POLICY "Users can view their own cardio sessions"
  ON cardio_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cardio sessions"
  ON cardio_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cardio sessions"
  ON cardio_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cardio sessions"
  ON cardio_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'cardio_sessions';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'cardio_sessions';

-- Verify policies
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'cardio_sessions';

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- If all queries above return results, the migration was successful
-- You can now use the Cardio Tracker feature in the app
-- ============================================================================
