# Supabase Integration Guide for WeeGym

This guide explains how to set up Supabase for WeeGym to enable cloud storage and multi-device sync.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Node.js and yarn installed

## Step 1: Install Supabase Package

Run this command to install the Supabase JavaScript client:

```bash
yarn add @supabase/supabase-js
```

**Note:** If you get an EPERM error about esbuild.exe, close any terminals or dev servers and try again.

## Step 2: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name:** WeeGym (or your preferred name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
5. Click **"Create new project"** (takes ~2 minutes)

## Step 3: Get Your API Keys

1. In your Supabase project, go to **Settings** > **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 4: Create Environment Variables

Create a `.env` file in the root of your project:

```bash
# .env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Add `.env` to your `.gitignore` file so you don't commit your keys!

```bash
# Add to .gitignore
.env
.env.local
```

## Step 5: Create Database Tables

In your Supabase project dashboard, go to **SQL Editor** and run this SQL:

```sql
-- Enable Row Level Security
-- This ensures users can only see their own data

-- 1. Workouts table
CREATE TABLE workouts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  exercises JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date DESC);

-- Row Level Security for workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Active Wellbeing Sessions table
CREATE TABLE active_wellbeing_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  machine TEXT NOT NULL,
  mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON active_wellbeing_sessions(user_id);
CREATE INDEX idx_sessions_date ON active_wellbeing_sessions(date DESC);
CREATE INDEX idx_sessions_machine_mode ON active_wellbeing_sessions(machine, mode);

-- Row Level Security for sessions
ALTER TABLE active_wellbeing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON active_wellbeing_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON active_wellbeing_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON active_wellbeing_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 3. User Settings table
CREATE TABLE user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_rest_time INTEGER DEFAULT 90,
  short_rest_time INTEGER DEFAULT 60,
  long_rest_time INTEGER DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_settings_user_id ON user_settings(user_id);

-- Row Level Security for settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

Click **"Run"** to execute the SQL.

## Step 6: Set Up Authentication (Optional but Recommended)

### Simple Email/Password Authentication

In Supabase dashboard, go to **Authentication** > **Providers** and ensure **Email** is enabled.

You can add authentication UI later or start with a simple implementation in your app.

## Step 7: Test the Connection

Restart your dev server for environment variables to load:

```bash
yarn dev
```

## Database Service Functions

The app now has these database functions available in `src/lib/database.js`:

### Workouts

- `saveWorkout(workoutData)` - Save a new workout
- `getWorkouts()` - Get all workouts for current user
- `getWorkoutsByDateRange(startDate, endDate)` - Get workouts in date range
- `deleteWorkout(id)` - Delete a workout

### Active Wellbeing

- `saveActiveWellbeingSession(sessionData)` - Save a session
- `getActiveWellbeingSessions()` - Get all sessions
- `deleteActiveWellbeingSession(id)` - Delete a session

### Settings

- `getUserSettings()` - Get user settings
- `saveUserSettings(settings)` - Save/update settings

## Next Steps

### Option A: Add Authentication First

Create a login/signup page so users can have accounts.

### Option B: Use Anonymous Users

For now, you can use Supabase without authentication for testing, but you'll need to adjust the Row Level Security policies.

### Option C: Migrate Existing Data

We can create a migration script to move data from localStorage to Supabase.

## Migration from localStorage

To migrate existing localStorage data to Supabase, you can add a one-time migration function. Would you like me to create this?

## Benefits After Setup

✅ **Multi-device sync** - Access your data from any device
✅ **Data persistence** - Never lose your workout history
✅ **Offline support** - Supabase client handles offline mode
✅ **Backup** - Your data is automatically backed up
✅ **Scalability** - Can handle thousands of workouts without issues

## Troubleshooting

### "Invalid API key"

- Check your `.env` file has the correct keys
- Restart your dev server after creating `.env`

### "Row Level Security" errors

- Make sure you ran all the SQL commands
- Ensure you're authenticated (or disable RLS for testing)

### "EPERM" during yarn install

- Close all terminals and VS Code
- Try again after a moment

## Cost

Supabase Free Tier includes:

- 500MB database
- 2GB bandwidth per month
- Unlimited API requests
- 50,000 monthly active users

This is more than enough for personal use!

## Support

If you run into issues:

1. Check the Supabase dashboard for error messages
2. Look at browser console for detailed errors
3. Check the [Supabase documentation](https://supabase.com/docs)
