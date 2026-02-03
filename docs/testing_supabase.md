# Testing Your Supabase Integration

## ✅ What's Done

Your app is now fully integrated with Supabase! Here's what changed:

### Updated Components

1. **WorkoutSession.jsx** - Saves workouts to Supabase (with localStorage fallback)
2. **History.jsx** - Loads workouts from Supabase with loading spinner
3. **ActiveWellbeing.jsx** - Saves/loads sessions from Supabase

### Features Added

- 🔄 **Auto-sync** across all your devices
- 💾 **Cloud backup** - never lose your data
- ⚡ **Offline fallback** - uses localStorage if Supabase is unavailable
- 🔄 **Loading states** - spinner while data loads

## 🧪 How to Test

### 1. Check Your Setup

Make sure you have:

- ✅ Created Supabase project
- ✅ Run the SQL scripts to create tables
- ✅ Created `.env.local` file with your keys
- ✅ Restarted dev server (`yarn dev`)

### 2. Test Workout Logging

1. Start a workout (Day 1 or Day 2)
2. Choose an exercise
3. Log some sets with weight/reps
4. Complete the exercise
5. Finish all exercises and save

**Expected:** Workout should save to Supabase and appear in History

### 3. Test Active Wellbeing

1. Go to Active Wellbeing
2. Log a session with machine, mode, and score
3. Check it appears in the history view

**Expected:** Session should save and load from Supabase

### 4. Test Multi-Device Sync

1. Log a workout on Device A
2. Open the app on Device B
3. Go to History

**Expected:** Workout from Device A should appear on Device B

### 5. Test History Deletion

1. Go to History
2. Open a workout
3. Click Delete

**Expected:** Workout should be deleted from Supabase

## 🔍 Debugging

### Check Browser Console

Open browser DevTools (F12) and look for:

- ✅ No red errors
- ℹ️ Green success messages from database operations

### Common Issues

**"Failed to load workouts"**

- Check your `.env.local` file has correct credentials
- Verify tables were created (check Supabase dashboard)
- Check browser console for detailed error

**"Row Level Security" error**

- You need to be authenticated (or temporarily disable RLS for testing)
- See Authentication section below

**Data not syncing**

- Check network tab - should see requests to `supabase.co`
- Verify your Supabase project is active (not paused)

## 🔐 Authentication (Optional)

Currently, the app tries to save data without authentication. You have two options:

### Option A: Temporarily Disable Row Level Security (Testing Only)

In Supabase SQL Editor, run:

```sql
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_wellbeing_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** This allows anyone with your URL to access data. Only for testing!

### Option B: Add Simple Authentication (Recommended)

Would you like me to create a simple login/signup page? This will:

- Keep your data secure
- Allow multiple users
- Enable proper Row Level Security

## 📊 Verify Data in Supabase

1. Go to your Supabase dashboard
2. Click **Table Editor**
3. Check these tables:
   - `workouts` - should have your logged workouts
   - `active_wellbeing_sessions` - should have your sessions
   - `user_settings` - will have settings when you save them

## 🎯 Next Steps

1. **Test the basic functionality** - log workouts, check history
2. **Decide on authentication** - do you want login/signup?
3. **Migrate old data** (optional) - move localStorage data to Supabase
4. **Deploy** - when ready, deploy to production

## 💡 Tips

- **Dev server must be running** - The `.env.local` file is only read at startup
- **Clear cache** - If you see old data, clear browser cache
- **Check Network** - In DevTools Network tab, filter by "supabase" to see API calls
- **Supabase Dashboard** - Great for debugging - shows all your data in real-time

## 🆘 Need Help?

If something isn't working:

1. Check browser console for errors
2. Check Supabase dashboard for data
3. Verify your `.env.local` file
4. Check if tables were created correctly

Let me know if you hit any issues!
