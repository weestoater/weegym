# Multi-User Workout Programme Implementation

## 📋 Overview

This package provides a complete multi-user workout programme system for WeeGym, enabling you to:

- ✅ Create individual user profiles with fitness information
- ✅ Design custom workout programmes for each user
- ✅ Manage multiple programme days with unique exercises
- ✅ Track workout history per user
- ✅ Securely store data with Row Level Security (RLS)

## 🗂️ Files Created

### Database Schema

- **`supabase-config/schema-multi-user.sql`**
  - Complete database schema for multi-user support
  - Creates 3 new tables: `user_profiles`, `workout_programmes`, `programme_exercises`
  - Includes RLS policies, indexes, and triggers
  - Maintains backward compatibility with existing tables

### Application Code

#### Services

- **`src/services/userProfileService.js`**
  - Complete API for user profiles
  - Complete API for workout programmes
  - Complete API for programme exercises
  - All CRUD operations with proper error handling

#### Pages

- **`src/pages/UserProfileManager.jsx`**
  - Beautiful UI for managing profiles and programmes
  - Two-tab interface: Profile and Programmes
  - Add/edit/delete exercises
  - Responsive design with Bootstrap

#### Utilities

- **`src/utils/programMigration.js`**
  - Migrate hardcoded data to database
  - Create starter programmes for new users
  - Custom migration functions
  - Easy one-click migration

### Documentation

- **`docs/multi_user_programme_system.md`**
  - Complete system documentation
  - Database schema explanation
  - Service function reference
  - Usage examples and best practices

- **`docs/QUICK_START_MULTI_USER.md`**
  - 5-minute setup guide
  - Step-by-step instructions
  - Quick reference for common tasks

### Examples

- **`docs/examples/Programme_Database_Example.jsx`**
  - Updated Programme.jsx using database
  - Shows loading states and error handling
  - Complete working example

- **`docs/examples/WorkoutSession_Database_Example.jsx`**
  - Updated WorkoutSession.jsx using database
  - Maintains all existing functionality
  - Dynamic programme loading

## 🚀 Quick Start

### 1. Set Up Database (2 minutes)

```sql
-- In Supabase SQL Editor, run:
-- supabase-config/schema-multi-user.sql
```

### 2. Migrate Your Data (1 minute)

```javascript
import { migrateCurrentUserProgramme } from "./utils/programMigration";

await migrateCurrentUserProgramme();
```

### 3. Access Profile Manager

Navigate to `/profile-manager` in your app.

## 📊 Database Schema Summary

```
user_profiles (stores user info)
  ├── display_name
  ├── instructor_name
  ├── programme_start_date
  ├── programme_phase
  ├── fitness_goal
  └── experience_level

workout_programmes (stores programme days)
  ├── day_number
  ├── name
  ├── description
  └── target_areas
      └── programme_exercises (stores exercises)
          ├── exercise_order
          ├── name
          ├── type
          ├── sets
          ├── reps
          └── rest_seconds
```

## 🔧 Key Features

### User Profiles

- Display name, instructor, and fitness details
- Programme phase tracking (Intro, Foundation, Strength, etc.)
- Experience level (Beginner, Intermediate, Advanced)
- Fitness goals and notes

### Workout Programmes

- Multiple programme days per user (Day 1, Day 2, Day 3, etc.)
- Customizable name, description, and target areas
- Active/inactive status for programme management

### Exercises

- Ordered exercises within each programme
- Exercise type (Machine, Free-weights, Cable, Bodyweight)
- Sets, reps, and rest times
- Optional notes for form cues

### Security

- Row Level Security (RLS) on all tables
- Users can only access their own data
- Secure through Supabase authentication

## 📖 Documentation

### For Quick Setup

➡️ Start here: [`docs/QUICK_START_MULTI_USER.md`](./QUICK_START_MULTI_USER.md)

### For Complete Reference

➡️ Full docs: [`docs/multi_user_programme_system.md`](./multi_user_programme_system.md)

### For Implementation Examples

➡️ See: `docs/examples/`

## 🎯 Common Use Cases

### Adding a New User

1. User signs up via Supabase Auth
2. Navigate to `/profile-manager`
3. Fill in profile details
4. Create programme days
5. Add exercises

### Customizing a Programme

```javascript
// Get programme
const programme = await getFullProgrammeByDay(1);

// Add exercise
await createProgrammeExercises(programme.id, [
  {
    name: "Chest Press",
    type: "Machine",
    sets: 3,
    reps: "6-8",
    restSeconds: 90,
  },
]);
```

### Loading User's Programme

```javascript
// In your component
const programmes = await getAllUserProgrammes();

// Or specific day
const day1 = await getFullProgrammeByDay(1);
```

## 🔄 Integration with Existing Code

### Update Programme.jsx

Replace hardcoded data with:

```javascript
import { getAllUserProgrammes } from "../services/userProfileService";

const programmes = await getAllUserProgrammes();
```

See: `docs/examples/Programme_Database_Example.jsx`

### Update WorkoutSession.jsx

Load programme dynamically:

```javascript
import { getFullProgrammeByDay } from "../services/userProfileService";

const programme = await getFullProgrammeByDay(parseInt(day));
```

See: `docs/examples/WorkoutSession_Database_Example.jsx`

## 🛠️ Service Functions Reference

### User Profiles

```javascript
getUserProfile();
saveUserProfile(data);
updateUserProfile(updates);
```

### Workout Programmes

```javascript
getWorkoutProgrammes();
getWorkoutProgrammeByDay(dayNumber);
getFullProgrammeByDay(dayNumber);
getAllUserProgrammes();
createWorkoutProgramme(data);
updateWorkoutProgramme(id, updates);
deleteWorkoutProgramme(id);
```

### Programme Exercises

```javascript
getProgrammeExercises(programmeId);
createProgrammeExercise(programmeId, data);
createProgrammeExercises(programmeId, exercises);
updateProgrammeExercise(id, updates);
deleteProgrammeExercise(id);
reorderProgrammeExercises(programmeId, orderUpdates);
```

## 📱 User Interface

The Profile Manager (`/profile-manager`) provides:

### Profile Tab

- Edit user information
- Set programme dates and phase
- Update fitness goals
- Add special notes

### Programmes Tab

- View all programme days
- Create new programme days
- Add/edit/delete exercises
- Organize exercises by order

## ✅ Testing Checklist

- [ ] Database schema installed successfully
- [ ] User profile can be created and updated
- [ ] Programme days can be created
- [ ] Exercises can be added to programmes
- [ ] Data loads correctly in Programme.jsx
- [ ] WorkoutSession.jsx uses database data
- [ ] Different users see only their own data
- [ ] Migration script runs without errors

## 🚧 Future Enhancements

Potential additions:

- Programme templates library
- Exercise video/image library
- Programme scheduling/calendar
- Progress photos
- Programme sharing between users
- Analytics and progress tracking
- Rest day scheduling
- Deload week planning

## 💡 Tips

1. **Start Simple**: Migrate your current programme first
2. **Test Thoroughly**: Verify RLS policies work correctly
3. **Back Up Data**: Always backup before major changes
4. **Use Examples**: Reference example files for implementation
5. **Check Console**: Use browser DevTools to debug issues

## 🐛 Troubleshooting

### Can't see data?

- Verify user is logged in
- Check Supabase logs for errors
- Confirm RLS policies are active

### Migration fails?

- Ensure schema is installed first
- Check user authentication
- Review error messages in console

### Data not loading?

- Check network tab in DevTools
- Verify table names are correct
- Ensure Supabase connection is active

## 📞 Support

For issues or questions:

1. Check the documentation files
2. Review code comments
3. Check browser console for errors
4. Review Supabase logs
5. Verify schema installation

## 📄 License

Part of WeeGym Tracker project

---

**Version**: 1.0.0  
**Created**: February 2026  
**Status**: Production Ready

**Quick Links**:

- [Quick Start Guide](./QUICK_START_MULTI_USER.md)
- [Full Documentation](./multi_user_programme_system.md)
- [Database Schema](../supabase-config/schema-multi-user.sql)
- [Service Functions](../src/services/userProfileService.js)
- [Profile Manager UI](../src/pages/UserProfileManager.jsx)
