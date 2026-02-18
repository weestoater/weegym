# Quick Start Guide - Multi-User Workout System

## 🚀 Getting Started in 5 Minutes

This guide will help you set up the multi-user workout programme system quickly.

## Prerequisites

- ✅ Supabase project set up
- ✅ WeeGym app installed
- ✅ User authentication working

## Step 1: Run Database Migration (2 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase-config/schema-multi-user.sql`
5. Click **Run**

✅ You should see success messages for table creation.

### Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'workout_programmes', 'programme_exercises');
```

Expected result: 3 rows showing all three tables.

## Step 2: Migrate Your Existing Data (1 minute)

### Option A: Use the Migration Script (Recommended)

Add this code to your app (e.g., in a settings page button):

```javascript
import { migrateCurrentUserProgramme } from "./utils/programMigration";

// In your component
const handleMigrate = async () => {
  const result = await migrateCurrentUserProgramme();
  if (result.success) {
    alert("Migration successful!");
  } else {
    alert("Migration failed: " + result.error);
  }
};
```

This will:

- ✅ Create your user profile
- ✅ Migrate Day 1 exercises
- ✅ Migrate Day 2 exercises

### Option B: Manual Entry

Navigate to `/profile-manager` and:

1. Fill in your profile details
2. Create programme days
3. Add exercises manually

## Step 3: Access the Profile Manager (1 minute)

### Add a Link to Your UI

In your navigation or settings page:

```jsx
import { Link } from "react-router-dom";

<Link to="/profile-manager" className="btn btn-primary">
  <i className="bi bi-person-gear me-2"></i>
  Manage Profile & Programmes
</Link>;
```

Or navigate directly to: `http://localhost:5173/weegym/profile-manager`

## Step 4: Create Your First Programme (1 minute)

1. Go to `/profile-manager`
2. Click the **Programmes** tab
3. Click **Add Programme Day**
4. Fill in:
   - Day Number: `1`
   - Name: `Day 1 - Upper Body`
   - Description: `Push Focus: Chest, Shoulders, Triceps`
   - Target Areas: `Chest • Shoulders • Arms`
5. Click **Create Programme**

## Step 5: Add Exercises

1. Click **Add Exercise** on your new programme
2. Add your first exercise:
   - Name: `Chest Press`
   - Type: `Machine`
   - Sets: `3`
   - Reps: `6-8`
   - Rest: `90` seconds
3. Click **Add**
4. Repeat for all exercises

## 🎉 Done!

You now have:

- ✅ A user profile with your fitness details
- ✅ A customized workout programme
- ✅ Individual exercises with sets, reps, and rest times
- ✅ A foundation to add more users and programmes

## What's Next?

### Add a Second User

1. Have them sign up through your login system
2. They navigate to `/profile-manager`
3. They create their profile and programmes
4. Their data is completely separate from yours (thanks to RLS)

### Update Existing Pages

Update your Programme and WorkoutSession pages to load from the database:

```javascript
import { getAllUserProgrammes } from "../services/userProfileService";

// Instead of hardcoded data:
const programmes = await getAllUserProgrammes();
```

See the full documentation for complete examples.

## Common Tasks

### Add a Programme Day

1. Go to `/profile-manager` → Programmes tab
2. Click **Add Programme Day**
3. Fill in the form
4. Click **Create Programme**

### Edit an Exercise

Currently, you need to delete and re-add the exercise. Exercise editing will be added in a future update.

### Delete an Exercise

Click the trash icon (🗑️) next to the exercise in the programme manager.

### Update Your Profile

1. Go to `/profile-manager` → Profile tab
2. Update any fields
3. Click **Save Profile**

## Troubleshooting

### "Migration script not working"

Make sure you ran the database schema SQL first (Step 1).

### "Can't see my programmes"

1. Check you're logged in
2. Check the browser console for errors
3. Verify the database tables exist in Supabase

### "Permission denied errors"

RLS is working correctly - ensure you're logged in as the user who owns the data.

## Quick Reference

### Key Files Created

```
supabase-config/
  └── schema-multi-user.sql          # Database schema

src/
  ├── pages/
  │   └── UserProfileManager.jsx     # Profile & programme manager UI
  ├── services/
  │   └── userProfileService.js      # Database service functions
  └── utils/
      └── programMigration.js        # Migration utilities

docs/
  └── multi_user_programme_system.md # Full documentation
```

### Key URLs

- Profile Manager: `/profile-manager`
- API Docs: See `docs/multi_user_programme_system.md`

### Key Service Functions

```javascript
// Profiles
getUserProfile();
saveUserProfile(data);
updateUserProfile(updates);

// Programmes
getWorkoutProgrammes();
getFullProgrammeByDay(dayNumber);
createWorkoutProgramme(data);

// Exercises
getProgrammeExercises(programmeId);
createProgrammeExercises(programmeId, exercises);
deleteProgrammeExercise(exerciseId);
```

## Need Help?

1. Check the [Full Documentation](./multi_user_programme_system.md)
2. Review code comments in service files
3. Check Supabase logs for database errors
4. Use browser DevTools console for debugging

---

**Time to Setup**: ~5 minutes  
**Difficulty**: Easy  
**Support**: See full docs for detailed help

🏋️ Happy Training!
