-- =====================================================
-- Add Back Exercises to Day 1 and Day 2
-- Run this in Supabase SQL Editor
-- =====================================================

-- HOW TO USE:
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" (or press Ctrl+Enter)
-- 4. Check the results - you should see "4 rows created"
-- 5. Go back to your app and refresh the profile manager page

-- =====================================================
-- STEP 1: Add exercises to Day 1 (Upper Body)
-- =====================================================

-- First, let's add exercises to Day 1
-- These will be added after your existing exercises
INSERT INTO programme_exercises (programme_id, exercise_order, name, type, sets, reps, rest_seconds, notes)
SELECT 
  wp.id as programme_id,
  (SELECT COALESCE(MAX(exercise_order), 0) + 1 FROM programme_exercises WHERE programme_id = wp.id) as exercise_order,
  'Cable Row' as name,
  'Machine' as type,
  3 as sets,
  '8-10' as reps,
  90 as rest_seconds,
  'Mid back, lats, rhomboids' as notes
FROM workout_programmes wp
WHERE wp.day_number = 1
  AND wp.user_id = auth.uid();

INSERT INTO programme_exercises (programme_id, exercise_order, name, type, sets, reps, rest_seconds, notes)
SELECT 
  wp.id as programme_id,
  (SELECT COALESCE(MAX(exercise_order), 0) + 1 FROM programme_exercises WHERE programme_id = wp.id) as exercise_order,
  'Face Pulls' as name,
  'Machine' as type,
  3 as sets,
  '12-15' as reps,
  60 as rest_seconds,
  'Upper back, rear delts, rotator cuff' as notes
FROM workout_programmes wp
WHERE wp.day_number = 1
  AND wp.user_id = auth.uid();

-- =====================================================
-- STEP 2: Add exercises to Day 2 (Mixed Areas)
-- =====================================================

INSERT INTO programme_exercises (programme_id, exercise_order, name, type, sets, reps, rest_seconds, notes)
SELECT 
  wp.id as programme_id,
  (SELECT COALESCE(MAX(exercise_order), 0) + 1 FROM programme_exercises WHERE programme_id = wp.id) as exercise_order,
  'T-Bar Row' as name,
  'Machine' as type,
  3 as sets,
  '8-10' as reps,
  90 as rest_seconds,
  'Mid/upper back, lats, traps' as notes
FROM workout_programmes wp
WHERE wp.day_number = 2
  AND wp.user_id = auth.uid();

INSERT INTO programme_exercises (programme_id, exercise_order, name, type, sets, reps, rest_seconds, notes)
SELECT 
  wp.id as programme_id,
  (SELECT COALESCE(MAX(exercise_order), 0) + 1 FROM programme_exercises WHERE programme_id = wp.id) as exercise_order,
  'Single-Arm Dumbbell Row' as name,
  'Free-weights' as type,
  3 as sets,
  '10-12' as reps,
  60 as rest_seconds,
  'Unilateral back work' as notes
FROM workout_programmes wp
WHERE wp.day_number = 2
  AND wp.user_id = auth.uid();

-- =====================================================
-- Verify the exercises were added
-- =====================================================

-- Check Day 1 exercises
SELECT 'Day 1 Exercises:' as info;
SELECT pe.exercise_order, pe.name, pe.type, pe.sets, pe.reps, pe.rest_seconds, pe.notes
FROM programme_exercises pe
JOIN workout_programmes wp ON pe.programme_id = wp.id
WHERE wp.day_number = 1 
  AND wp.user_id = auth.uid()
ORDER BY pe.exercise_order;

-- Check Day 2 exercises
SELECT 'Day 2 Exercises:' as info;
SELECT pe.exercise_order, pe.name, pe.type, pe.sets, pe.reps, pe.rest_seconds, pe.notes
FROM programme_exercises pe
JOIN workout_programmes wp ON pe.programme_id = wp.id
WHERE wp.day_number = 2
  AND wp.user_id = auth.uid()
ORDER BY pe.exercise_order;

-- Done! Go refresh your app to see the new exercises.
