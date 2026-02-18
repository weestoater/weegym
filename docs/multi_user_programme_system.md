# Multi-User Workout Programme System

## Overview

This document explains the enhanced multi-user workout programme system for WeeGym. The new system allows you to:

- Create individual user profiles with fitness details
- Set up custom workout programmes for each user
- Manage multiple programme days with unique exercises
- Track completed workouts per user
- Easily add new users and customize their programmes

## Database Schema

### New Tables

#### 1. **user_profiles**

Stores extended profile information for each gym member.

**Fields:**

- `id` - Primary key
- `user_id` - References Supabase auth user (unique)
- `display_name` - User's display name (required)
- `instructor_name` - Instructor/coach name
- `programme_start_date` - When the programme started
- `programme_phase` - Current training phase (Intro, Foundation, Strength, etc.)
- `programme_end_date` - When the programme ends
- `fitness_goal` - User's fitness goal
- `experience_level` - Beginner, Intermediate, Advanced
- `notes` - Any special notes or considerations
- `is_active` - Whether the user is currently active
- `created_at`, `updated_at` - Timestamps

#### 2. **workout_programmes**

Stores workout programme templates for each user and day.

**Fields:**

- `id` - Primary key
- `user_id` - References Supabase auth user
- `day_number` - Day number (1, 2, 3, etc.)
- `name` - Programme name (e.g., "Day 1 - Upper Body")
- `description` - Programme description
- `target_areas` - Target muscle groups (e.g., "Chest • Shoulders • Arms")
- `is_active` - Whether the programme is active
- `created_at`, `updated_at` - Timestamps

**Constraints:**

- Unique combination of `user_id` and `day_number`

#### 3. **programme_exercises**

Stores individual exercises for each workout programme.

**Fields:**

- `id` - Primary key
- `programme_id` - References workout_programmes
- `exercise_order` - Order of exercise in the programme
- `name` - Exercise name (e.g., "Chest Press")
- `type` - Exercise type (Machine, Free-weights, Cable, Bodyweight)
- `sets` - Number of sets
- `reps` - Rep range (e.g., "6-8", "10-12")
- `rest_seconds` - Rest time in seconds
- `weight_guidance` - Optional weight selection guidance
- `notes` - Form cues or special instructions
- `created_at`, `updated_at` - Timestamps

**Constraints:**

- Unique combination of `programme_id` and `exercise_order`

### Existing Tables (Unchanged)

- **workouts** - Stores completed workout sessions
- **active_wellbeing_sessions** - Stores active wellbeing machine sessions
- **user_settings** - Stores user preferences (rest times, etc.)

### Row Level Security (RLS)

All tables implement RLS policies to ensure users can only access their own data:

- Users can only view, create, update, and delete their own records
- `programme_exercises` access is controlled through programme ownership

## Setup Instructions

### 1. Run the Database Migration

Execute the enhanced schema in your Supabase SQL Editor:

```sql
-- Run the contents of: supabase-config/schema-multi-user.sql
```

This will create all three new tables with proper indexes, RLS policies, and triggers.

### 2. Verify the Migration

Run the verification queries at the end of the schema file to ensure:

- All tables were created successfully
- RLS is enabled on all tables
- Policies are correctly configured

### 3. Migrate Existing Data (Optional)

If you have existing hardcoded programme data, you can migrate it using the migration script:

```javascript
import { migrateCurrentUserProgramme } from "./utils/programMigration";

// Call this once to migrate your current data
await migrateCurrentUserProgramme();
```

This will:

1. Create a user profile with your details
2. Create Day 1 and Day 2 programmes
3. Add all exercises to each programme

## Usage Guide

### For Users

#### Accessing the Profile Manager

Navigate to `/profile-manager` in your application or add a link in your UI:

```jsx
<Link to="/profile-manager">Manage Profile</Link>
```

#### Managing Your Profile

1. Go to the **Profile** tab
2. Fill in your details:
   - Display Name (required)
   - Instructor Name
   - Programme Start Date
   - Programme Phase (Intro, Foundation, Strength, Hypertrophy, Advanced)
   - Experience Level (Beginner, Intermediate, Advanced)
   - Fitness Goal
   - Notes
3. Click **Save Profile**

#### Creating a Programme Day

1. Go to the **Programmes** tab
2. Click **Add Programme Day**
3. Fill in:
   - Day Number (1, 2, 3, etc.)
   - Programme Name (e.g., "Day 1 - Upper Body")
   - Description (e.g., "Push Focus: Chest, Shoulders, Triceps")
   - Target Areas (e.g., "Chest • Shoulders • Arms")
4. Click **Create Programme**

#### Adding Exercises to a Programme

1. Find the programme day card
2. Click **Add Exercise**
3. Fill in the exercise form:
   - Exercise name
   - Type (Machine, Free-weights, Cable, Bodyweight)
   - Sets
   - Reps (e.g., "10-12")
   - Rest (seconds)
   - Notes (optional)
4. Click **Add**
5. Repeat for all exercises

#### Managing Exercises

- **Delete**: Click the trash icon next to an exercise
- **Reorder**: Exercises are automatically ordered

### For Developers

#### Using the Service Functions

Import the service functions in your components:

```javascript
import {
  getUserProfile,
  saveUserProfile,
  getWorkoutProgrammes,
  getFullProgrammeByDay,
  getAllUserProgrammes,
  createWorkoutProgramme,
  createProgrammeExercises,
  updateUserProfile,
  deleteProgrammeExercise,
} from "../services/userProfileService";
```

#### Example: Get User's Programme for Day 1

```javascript
const programme = await getFullProgrammeByDay(1);

console.log(programme);
// {
//   id: 1,
//   day_number: 1,
//   name: "Day 1 - Upper Body",
//   description: "Push Focus: Chest, Shoulders, Triceps",
//   target_areas: "Chest • Shoulders • Arms",
//   exercises: [
//     {
//       id: 1,
//       name: "Chest Press",
//       type: "Machine",
//       sets: 3,
//       reps: "6-8",
//       rest_seconds: 90,
//       ...
//     },
//     ...
//   ]
// }
```

#### Example: Create a New User Programme

```javascript
// Create the programme
const programme = await createWorkoutProgramme({
  dayNumber: 3,
  name: "Day 3 - Legs",
  description: "Lower body strength and power",
  targetAreas: "Quads • Hamstrings • Glutes",
});

// Add exercises
const exercises = [
  {
    name: "Squat",
    type: "Free-weights",
    sets: 4,
    reps: "6-8",
    restSeconds: 120,
    notes: "Focus on depth and form",
  },
  {
    name: "Leg Press",
    type: "Machine",
    sets: 3,
    reps: "10-12",
    restSeconds: 90,
  },
];

await createProgrammeExercises(programme.id, exercises);
```

#### Example: Update User Profile

```javascript
await updateUserProfile({
  programme_phase: "Strength",
  fitness_goal: "Increase strength on compound lifts",
});
```

### Updating Existing Components

#### Update Programme.jsx

Instead of using hardcoded data, fetch from the database:

```javascript
import { useEffect, useState } from "react";
import { getAllUserProgrammes } from "../services/userProfileService";

function Programme() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgrammes() {
      const data = await getAllUserProgrammes();
      setProgrammes(data);
      setLoading(false);
    }
    loadProgrammes();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Render programmes from database
  return (
    <div>
      {programmes.map((programme) => (
        <div key={programme.id}>
          <h2>{programme.name}</h2>
          {/* Render exercises */}
        </div>
      ))}
    </div>
  );
}
```

#### Update WorkoutSession.jsx

Fetch the programme for the selected day:

```javascript
import { getFullProgrammeByDay } from "../services/userProfileService";

function WorkoutSession() {
  const [searchParams] = useSearchParams();
  const day = searchParams.get("day") || "1";
  const [programme, setProgramme] = useState(null);

  useEffect(() => {
    async function loadProgramme() {
      const data = await getFullProgrammeByDay(parseInt(day));
      setProgramme(data);
    }
    loadProgramme();
  }, [day]);

  // Use programme.exercises instead of hardcoded data
}
```

## Adding a New User

### Step 1: User Signs Up

The user creates an account through Supabase Auth (your existing login system).

### Step 2: Create Profile

After signup, prompt the user to complete their profile or use the migration script:

```javascript
import { createStarterProgramme } from "./utils/programMigration";

// Create a starter programme for the new user
await createStarterProgramme("John Doe", "Coach Sarah");
```

### Step 3: Customize Programme

The user (or an admin) can then:

1. Go to `/profile-manager`
2. Update their profile details
3. Add/modify programme days and exercises

## Advanced Features

### Copying a Programme to Another User

```javascript
// Get source programme
const sourceProgramme = await getFullProgrammeByDay(1);

// Create new programme for current user
const newProgramme = await createWorkoutProgramme({
  dayNumber: 1,
  name: sourceProgramme.name,
  description: sourceProgramme.description,
  targetAreas: sourceProgramme.target_areas,
});

// Copy exercises
const exercises = sourceProgramme.exercises.map((ex) => ({
  name: ex.name,
  type: ex.type,
  sets: ex.sets,
  reps: ex.reps,
  restSeconds: ex.rest_seconds,
  notes: ex.notes,
}));

await createProgrammeExercises(newProgramme.id, exercises);
```

### Archiving Old Programmes

```javascript
await updateWorkoutProgramme(programmeId, { is_active: false });
```

### Tracking Programme Progress

Combine with the existing `workouts` table to track:

- Which programme day was completed
- Date and duration
- Exercises performed
- Weights used

## Benefits of This System

1. **Scalability**: Support unlimited users, each with their own programmes
2. **Flexibility**: Each user can have unique exercises, sets, reps, and rest times
3. **Maintainability**: Easy to update programmes without code changes
4. **Personalization**: Instructors can customize programmes for individual needs
5. **History**: Track programme changes over time
6. **Security**: RLS ensures users only see their own data
7. **Integration**: Works seamlessly with existing workout tracking

## Troubleshooting

### Error: "relation 'user_profiles' does not exist"

Run the schema migration SQL script in your Supabase SQL Editor.

### Error: "new row violates row-level security policy"

Ensure the user is authenticated before making database calls.

### Exercises not showing up

Check that:

1. The programme was created successfully
2. Exercises are linked to the correct `programme_id`
3. The `exercise_order` is set correctly

### Can't see other users' programmes

This is by design - RLS ensures users only see their own data.

## Next Steps

1. **Add Programme Templates**: Create a library of template programmes that new users can start with
2. **Programme Scheduling**: Add calendar integration to schedule which days to do which programme
3. **Progress Photos**: Add ability to upload progress photos linked to profile
4. **Exercise Library**: Create a searchable exercise library with form videos
5. **Sharing**: Allow instructors to share programmes with their clients
6. **Analytics**: Track programme adherence and progress over time

## Support

For questions or issues:

1. Check this documentation
2. Review the code comments in the service files
3. Check the schema SQL file for database structure
4. Use the browser console to debug API calls

---

**Created**: February 2026  
**Version**: 1.0.0  
**Status**: Ready for Production
