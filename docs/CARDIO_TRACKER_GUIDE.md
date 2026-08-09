# Cardio Tracker - Setup & Usage Guide

## What's New? 🏃

The **Cardio Tracker** feature allows you to track dedicated cardio equipment workouts including:

- 🏃 **Treadmill**
- 🚣 **Rowing Machine**
- 🔄 **Cross Trainer** (Elliptical)
- 🚴 **Stationary Bike**
- ⬆️ **Stair Climber**

This is separate from:

- **Strava** - for outdoor/connected device activities (runs, bike rides)
- **Active Wellbeing** - for gym machines with score-based tracking
- **Workout** - for strength training with weights

---

## Setup Instructions

### Step 1: Database Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Run the migration script at:
   ```
   supabase-config/migration_cardio_sessions.sql
   ```
4. Verify success - all verification queries should return results

### Step 2: Deploy Code

The feature is already integrated:

- ✅ Database functions added to `src/lib/database.js`
- ✅ New page created: `src/pages/CardioTracker.jsx`
- ✅ Navigation updated in `src/App.jsx`
- ✅ Activity icons updated in `src/services/stravaService.js`

Simply redeploy your app or refresh in development mode.

---

## Using Cardio Tracker

### Accessing the Feature

1. Open the **Menu** (bottom button)
2. Select **"Cardio Tracker"** (🏃 icon)

### Logging a Session

1. Click **"Log Session"** tab
2. Select **Equipment Type** (required)
3. Enter **Duration** in minutes (required)
4. Optionally add:
   - Distance (km)
   - Calories burned
   - Average heart rate (bpm)
   - Notes
5. Select **Date** (defaults to today)
6. Click **"Log Session"**

### Viewing History

1. Click **"History"** tab
2. See all your cardio sessions
3. Filter by equipment type
4. View stats summary at the top:
   - Total sessions
   - Total time
   - Total distance
   - Total calories

### Editing/Deleting

- Click the **pencil icon** to edit a session
- Click the **trash icon** to delete

---

## When to Use Cardio Tracker vs Other Features

### Use **Cardio Tracker** for:

- ✅ Indoor treadmill runs
- ✅ Rowing machine workouts
- ✅ Cross trainer/elliptical sessions
- ✅ Stationary bike at the gym
- ✅ Stair climber workouts
- ✅ Any cardio equipment WITHOUT a connected fitness tracker

### Use **Strava** for:

- ✅ Outdoor runs tracked with phone/watch
- ✅ Outdoor cycling
- ✅ Activities synced from Garmin/Apple Watch/etc.

### Use **Active Wellbeing** for:

- ✅ Gym circuit machines with score modes
- ✅ Combined cardio/strength machines
- ✅ Machines that give you a "score" rating

### Use **Workout** for:

- ✅ Strength training with free weights
- ✅ Weight machines (chest press, lat pulldown, etc.)
- ✅ Following a structured programme

---

## Features

### Summary Statistics

At the top of the History view, you'll see:

- **Total Sessions** - How many cardio workouts logged
- **Total Time** - Hours and minutes of cardio
- **Total Distance** - Kilometers covered
- **Total Calories** - Estimated calories burned

### Equipment Filtering

Filter your history by equipment type to see:

- All treadmill sessions
- All rowing sessions
- etc.

### Session Details

Each session card shows:

- Equipment type with icon
- Date
- Duration
- Distance (if logged)
- Calories (if logged)
- Heart rate (if logged)
- Notes (if added)

---

## Tips & Best Practices

### 📝 Logging Tips

1. **Be Consistent**
   - Log sessions immediately after finishing
   - Use the same units (km, not miles)

2. **Use Notes**
   - Record how you felt
   - Note any achievements ("Felt strong!")
   - Track equipment settings ("Incline 5%")

3. **Track Heart Rate**
   - Many machines display average HR
   - Helps gauge workout intensity

### 📊 Tracking Progress

1. **Weekly Review**
   - Check total minutes each week
   - Aim for 150+ minutes/week (WHO recommendation)

2. **Distance Goals**
   - Set monthly distance targets
   - Compare month-to-month progress

3. **Variety**
   - Mix equipment types
   - Prevents overuse injuries
   - Works different muscle groups

---

## Data Privacy & Security

- ✅ **Row Level Security (RLS)** - You can only see your own sessions
- ✅ **User Isolation** - Each user's data is completely separate
- ✅ **Secure Authentication** - Supabase handles auth
- ✅ **Local Storage Fallback** - Data cached locally for offline use

---

## Troubleshooting

### "Failed to load sessions"

- Check internet connection
- Verify Supabase database is accessible
- Check browser console for errors

### "Failed to save session"

- Ensure all required fields are filled
- Check date format is valid
- Verify you're logged in

### Sessions not appearing

- Check equipment filter (set to "All Equipment")
- Verify session was saved (check for success message)
- Try refreshing the page

### Migration errors

- Ensure you're running the SQL in the correct Supabase project
- Check for typos in the SQL script
- Verify your Supabase plan supports custom tables

---

## Future Enhancements (Planned)

- 📈 **Progress Charts** - Visual trends over time
- 🎯 **Weekly Goals** - Set and track cardio targets
- 🏆 **Achievements** - Badges for milestones
- 📤 **Export Data** - Download CSV reports
- 🔔 **Reminders** - Workout reminder notifications
- 📊 **Comparison** - Week-over-week comparison

---

## Database Schema Reference

```sql
cardio_sessions
├── id (BIGSERIAL PRIMARY KEY)
├── user_id (UUID) - Links to authenticated user
├── equipment_type (TEXT) - Treadmill, Rowing Machine, etc.
├── duration_minutes (INTEGER) - Required
├── distance_km (DECIMAL) - Optional
├── calories (INTEGER) - Optional
├── avg_heart_rate (INTEGER) - Optional
├── notes (TEXT) - Optional
├── date (TIMESTAMPTZ) - When the session happened
└── created_at (TIMESTAMPTZ) - When the record was created
```

---

## Support

If you encounter issues:

1. Check this guide first
2. Review error messages in browser console (F12)
3. Check Supabase logs in dashboard
4. Verify database migration was successful

---

## Related Documentation

- [UI Navigation Review](./UI_NAVIGATION_REVIEW.md) - Full UI/UX analysis
- [Supabase Setup](./supabase_setup.md) - Initial database setup
- [Multi-User Setup](./MULTI_USER_README.md) - User management guide

---

**Enjoy tracking your cardio workouts! 🎉**
