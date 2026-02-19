# User Mode Preference System - Documentation

## Overview

This feature allows users to choose between two distinct experiences in the WeeGym application:

1. **Programme Mode**: Full workout programme with structured exercises and machines
2. **Wellbeing Only Mode**: Track wellbeing activities without a structured workout programme

Each user can have their own preference, and the landing page (Dashboard) adapts to provide a personalized experience based on their choice.

## Database Changes

### New Column: `user_mode`

Added to the `user_profiles` table with the following properties:

- **Type**: `TEXT`
- **Default**: `'programme'`
- **Constraint**: CHECK constraint ensuring value is either `'programme'` or `'wellbeing_only'`
- **Indexed**: Yes, for faster queries

### Migration Script

**File**: `supabase-config/add-user-mode-preference.sql`

This script:

- Adds the `user_mode` column to `user_profiles`
- Creates an index for performance
- Sets the admin user (ian@weestoater.com) to `'programme'` mode by default
- Includes verification queries and rollback instructions

**To apply the migration:**

1. Open your Supabase SQL Editor
2. Copy and paste the contents of `add-user-mode-preference.sql`
3. Execute the script
4. Run the verification queries at the bottom to confirm success

## Code Changes

### 1. User Profile Service (`src/services/userProfileService.js`)

**Updated Functions:**

- `saveUserProfile()`: Now accepts and saves `userMode` field
- `updateUserProfileById()`: Now updates `userMode` field

**Usage:**

```javascript
import { saveUserProfile } from "../services/userProfileService";

// Save profile with user mode
await saveUserProfile({
  displayName: "John Doe",
  userMode: "wellbeing_only", // or "programme"
  // ... other fields
});
```

### 2. Dashboard (`src/pages/Dashboard.jsx`)

**New Features:**

- Loads user profile to determine user mode
- Displays personalized welcome message with user's name
- Shows different statistics based on mode
- Provides mode-specific quick actions
- Displays relevant last activity summary

**Programme Mode Dashboard:**

- Shows: Workouts count, Last workout date, Wellbeing sessions, Last score
- Quick Actions: Start Day 1/2 Workouts, Log Wellbeing, View Programme
- Last Activity: Last workout summary with exercises

**Wellbeing Only Mode Dashboard:**

- Shows: Total sessions, Last score, Last session date, Last machine used
- Quick Actions: Log Wellbeing Session, View History
- Last Activity: Last wellbeing session summary with score and mode

### 3. User Profile Manager (`src/pages/UserProfileManager.jsx`)

**New Form Field:**

- Added "User Mode" dropdown in the profile form
- Default value: `'programme'`
- Required field with helper text explaining the options

**Options:**

- Programme Mode - Full workout programme with machines
- Wellbeing Only - Just track wellbeing activities

### 4. Edit User (`src/components/EditUser.jsx`)

**New Form Field:**

- Added "User Mode" dropdown for editing existing users
- Admins can change a user's mode preference
- Updates are saved via `updateUserProfileById()`

### 5. Add User (`src/pages/AddUser.jsx`)

**New Form Field:**

- Added "User Mode" dropdown when creating new users
- Default value: `'programme'`
- New users will have their preference set at account creation

## User Experience Examples

### Scenario 1: Admin User (Programme Mode)

Ian is set to Programme Mode (default for admin). When he opens the Dashboard:

- Welcome message: "Welcome back, Ian! Ready to crush your workout?"
- Stats show: Workout count, last workout date, wellbeing sessions, last score
- Quick actions: Start Day 1, Start Day 2, Log Wellbeing, View Programme
- Last workout summary with exercises is displayed
- Tip about maintaining proper tempo for muscle growth

### Scenario 2: New User (Wellbeing Only Mode)

Sarah joins and chooses Wellbeing Only mode. When she opens the Dashboard:

- Welcome message: "Welcome back, Sarah! Ready to log your wellbeing activity?"
- Stats show: Total sessions, last score, last session date, last machine
- Quick actions: Log Wellbeing Session, View History
- Last wellbeing session with machine, score, and mode
- Tip about consistency in tracking progress

## How to Switch User Modes

### For the Current User:

1. Navigate to Profile Manager (`/profile-manager`)
2. Go to the "Profile" tab
3. Find the "User Mode" field
4. Select your preferred mode:
   - Programme Mode - Full workout programme with machines
   - Wellbeing Only - Just track wellbeing activities
5. Click "Save Profile"
6. Return to Dashboard to see your personalized experience

### For Admin (Managing Other Users):

1. Navigate to Profile Manager (`/profile-manager`)
2. Go to the "Manage Users" tab (Admin only)
3. Select the user you want to edit
4. Find the "User Mode" field
5. Change the mode and save

## Data Considerations

### Existing Wellbeing Data

- All existing wellbeing data is automatically linked to the user who created it via `user_id`
- Admin's wellbeing data remains associated with admin
- Each user can only see their own wellbeing data (protected by Row Level Security)

### Workout Data

- Workout data is independent of user mode
- Users in "Wellbeing Only" mode can still view workout history if they have any
- The Dashboard simply doesn't emphasize it or provide quick actions for it

### Future Data

- New wellbeing sessions are automatically linked to the current user
- Each user's data is completely separate (enforced by Supabase RLS)

## Implementation Checklist

- [x] Create SQL migration script
- [x] Update database schema with `user_mode` column
- [x] Update `userProfileService.js` to handle user mode
- [x] Redesign Dashboard with conditional rendering
- [x] Add user mode field to Profile Manager form
- [x] Add user mode field to Edit User form
- [x] Add user mode field to Add User form
- [x] Test programme mode experience
- [x] Test wellbeing only mode experience
- [x] Update documentation

## Testing Instructions

### Test Programme Mode:

1. Run the migration script in Supabase
2. Log in as admin (ian@weestoater.com)
3. Verify Dashboard shows workout-focused interface
4. Check that all workout quick actions work
5. Verify user name appears in welcome message

### Test Wellbeing Only Mode:

1. Create a test user account (or use an existing one)
2. Go to Profile Manager
3. Set User Mode to "Wellbeing Only"
4. Save and return to Dashboard
5. Verify Dashboard shows wellbeing-focused interface
6. Check that wellbeing quick actions work
7. Log a wellbeing session and verify it appears

### Test Mode Switching:

1. Start in Programme Mode
2. Switch to Wellbeing Only Mode
3. Verify Dashboard updates immediately
4. Switch back to Programme Mode
5. Verify Dashboard updates correctly

## Technical Notes

### Database Constraints

The `user_mode` column uses a CHECK constraint to ensure data integrity:

```sql
CHECK (user_mode IN ('programme', 'wellbeing_only'))
```

This prevents invalid values from being stored in the database.

### Default Behavior

- New users without a specified mode default to `'programme'`
- Existing users (before migration) default to `'programme'`
- The system gracefully handles missing user profiles (shows "there" as name)

### Performance

- Added index on `user_mode` for fast filtering if needed in future
- User profile is loaded once on Dashboard mount
- No additional queries or overhead for mode checking

## Future Enhancements

Potential improvements for future versions:

1. **Mixed Mode**: Allow users to do both programme workouts and wellbeing tracking
2. **Programme Templates**: Based on user mode, suggest different programme types
3. **Analytics by Mode**: Show different analytics and insights per mode
4. **Mobile App**: Extend mode-based UI to mobile apps
5. **Goal Setting**: Different goal frameworks for each mode

## Support

If you encounter issues:

1. Check that the migration script ran successfully
2. Verify user profile has a valid `user_mode` value
3. Check browser console for errors
4. Ensure you're running latest version of the code
5. Clear browser cache if Dashboard doesn't update

## Rollback

If you need to rollback this feature:

```sql
-- Remove the user_mode column
ALTER TABLE user_profiles DROP COLUMN IF EXISTS user_mode;
DROP INDEX IF EXISTS idx_user_profiles_mode;
```

Then revert the code changes by checking out previous commits.

---

**Version**: 1.0  
**Date**: February 2026  
**Author**: WeeGym Development Team
