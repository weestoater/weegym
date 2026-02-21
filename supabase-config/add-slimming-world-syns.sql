-- ============================================================================
-- Add Slimming World Syns to Food Logs Table
-- ============================================================================
-- This migration adds support for tracking Slimming World Syns values
-- Run this in your Supabase SQL Editor if you already have the food_logs table
-- ============================================================================

-- Add the slimming_world_syns column to the food_logs table
ALTER TABLE food_logs 
ADD COLUMN IF NOT EXISTS slimming_world_syns DECIMAL(10, 2);

-- Update the daily_food_summary view to include syns
CREATE OR REPLACE VIEW daily_food_summary AS
SELECT 
  user_id,
  date,
  COUNT(*) as total_items,
  SUM(calories * quantity) as total_calories,
  SUM(protein * quantity) as total_protein,
  SUM(carbohydrates * quantity) as total_carbs,
  SUM(fat * quantity) as total_fat,
  SUM(fiber * quantity) as total_fiber,
  SUM(slimming_world_syns * quantity) as total_syns
FROM food_logs
GROUP BY user_id, date
ORDER BY date DESC;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check that the column was added successfully
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'food_logs'
  AND column_name = 'slimming_world_syns';

-- Test the updated view
SELECT * FROM daily_food_summary LIMIT 5;

-- ============================================================================
-- NOTES
-- ============================================================================
-- Slimming World Syns are a flexible system used by Slimming World members
-- to track foods that are not "free" on their plan. Typical daily syn
-- allowances range from 5-15 syns depending on the plan.
--
-- This field is optional and will only be displayed when a value is entered.
-- ============================================================================
