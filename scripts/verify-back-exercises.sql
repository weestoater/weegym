-- =====================================================
-- VERIFY Back Exercises Were Added
-- Run this in Supabase SQL Editor to check
-- =====================================================

-- Check if you're logged in and get your user ID
SELECT 
  'Your User ID:' as info,
  auth.uid() as user_id;

-- Check your workout programmes
SELECT 
  'Your Programmes:' as info,
  id,
  day_number,
  name,
  description,
  target_areas,
  created_at
FROM workout_programmes
WHERE user_id = auth.uid()
ORDER BY day_number;

-- Check ALL exercises for Day 1
SELECT 
  'Day 1 - ALL Exercises:' as info,
  pe.id,
  pe.exercise_order,
  pe.name,
  pe.type,
  pe.sets,
  pe.reps,
  pe.rest_seconds,
  pe.notes,
  pe.created_at
FROM programme_exercises pe
JOIN workout_programmes wp ON pe.programme_id = wp.id
WHERE wp.day_number = 1 
  AND wp.user_id = auth.uid()
ORDER BY pe.exercise_order;

-- Check ALL exercises for Day 2
SELECT 
  'Day 2 - ALL Exercises:' as info,
  pe.id,
  pe.exercise_order,
  pe.name,
  pe.type,
  pe.sets,
  pe.reps,
  pe.rest_seconds,
  pe.notes,
  pe.created_at
FROM programme_exercises pe
JOIN workout_programmes wp ON pe.programme_id = wp.id
WHERE wp.day_number = 2
  AND wp.user_id = auth.uid()
ORDER BY pe.exercise_order;

-- Check for the specific back exercises we just added
SELECT 
  'Recently Added Back Exercises:' as info,
  pe.name,
  wp.day_number,
  pe.created_at
FROM programme_exercises pe
JOIN workout_programmes wp ON pe.programme_id = wp.id
WHERE wp.user_id = auth.uid()
  AND pe.name IN ('Cable Row', 'Face Pulls', 'T-Bar Row', 'Single-Arm Dumbbell Row')
ORDER BY pe.created_at DESC;
