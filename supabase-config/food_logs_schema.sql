-- ============================================================================
-- FOOD LOGS TABLE - Calorie Tracker Schema
-- ============================================================================
-- This script adds the food_logs table for tracking daily calorie intake
-- Run this in your Supabase SQL Editor after the main schema.sql
-- ============================================================================

-- Create the food_logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  product_name TEXT NOT NULL,
  barcode TEXT,
  brand TEXT,
  serving_size TEXT,
  calories DECIMAL(10, 2),
  protein DECIMAL(10, 2),
  carbohydrates DECIMAL(10, 2),
  fat DECIMAL(10, 2),
  fiber DECIMAL(10, 2),
  sodium DECIMAL(10, 2),
  sugar DECIMAL(10, 2),
  quantity DECIMAL(10, 2) DEFAULT 1,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  notes TEXT,
  product_data JSONB, -- Store full Open Food Facts data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can insert their own food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can update their own food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can delete their own food logs" ON food_logs;

-- Create RLS policies for food_logs
CREATE POLICY "Users can view their own food logs"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food logs"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food logs"
  ON food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food logs"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- DAILY SUMMARY VIEW (Optional)
-- ============================================================================
-- Create a view for daily calorie summaries
CREATE OR REPLACE VIEW daily_food_summary AS
SELECT 
  user_id,
  date,
  COUNT(*) as total_items,
  SUM(calories * quantity) as total_calories,
  SUM(protein * quantity) as total_protein,
  SUM(carbohydrates * quantity) as total_carbs,
  SUM(fat * quantity) as total_fat,
  SUM(fiber * quantity) as total_fiber
FROM food_logs
GROUP BY user_id, date
ORDER BY date DESC;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check that the table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'food_logs';

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'food_logs';
