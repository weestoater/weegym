# Multi-User Authentication Setup

## Overview

WeeGym Tracker now supports multiple user accounts! Each user can have their own:

- Workout history
- Active Wellbeing sessions
- Custom settings

## What's Been Implemented

### 1. **Authentication System**

- Email and password based authentication via Supabase Auth
- Login/Signup pages
- Protected routes (requires login to access)
- Session management
- Logout functionality

### 2. **User Isolation**

All data is automatically filtered by user:

- Workouts are stored with `user_id`
- Active Wellbeing sessions are stored with `user_id`
- Settings are stored with `user_id`
- Each user only sees their own data

### 3. **New Pages & Features**

- **Login Page** (`/login`) - Sign in or create a new account
- **Settings Page Updated** - Shows current user info and logout button
- **Protected Routes** - All main pages require authentication

## Supabase Setup Required

### Enable Email Authentication

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Ensure **Email** provider is enabled
5. Configure email settings:
   - Enable "Confirm email" if you want email verification
   - Or disable it for easier testing

### Update Row Level Security (RLS) Policies

You need to update your database tables to ensure proper user isolation:

#### For `workouts` table:

```sql
-- Allow users to read only their own workouts
CREATE POLICY "Users can view own workouts"
ON workouts FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own workouts
CREATE POLICY "Users can insert own workouts"
ON workouts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own workouts
CREATE POLICY "Users can delete own workouts"
ON workouts FOR DELETE
USING (auth.uid() = user_id);
```

#### For `active_wellbeing_sessions` table:

```sql
-- Allow users to read only their own sessions
CREATE POLICY "Users can view own wellbeing sessions"
ON active_wellbeing_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own sessions
CREATE POLICY "Users can insert own wellbeing sessions"
ON active_wellbeing_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own sessions
CREATE POLICY "Users can delete own wellbeing sessions"
ON active_wellbeing_sessions FOR DELETE
USING (auth.uid() = user_id);
```

#### For `user_settings` table:

```sql
-- Allow users to read only their own settings
CREATE POLICY "Users can view own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to upsert their own settings
CREATE POLICY "Users can upsert own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id);
```

### Enable RLS on All Tables

Make sure Row Level Security is enabled on all tables:

```sql
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_wellbeing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

## How to Use

### Creating Accounts for Multiple Users

1. **First User (You)**:
   - Visit the app, you'll be redirected to `/login`
   - Click "Don't have an account? Sign up"
   - Enter your email, password, and name
   - Click "Sign Up"
   - You'll be logged in automatically (or need to verify email if enabled)

2. **Second User (Your Wife)**:
   - Have her visit the app on her device or browser
   - She'll be redirected to `/login`
   - Click "Don't have an account? Sign up"
   - Enter her email, password, and name
   - Click "Sign Up"

### Switching Between Users

1. Go to **Settings** page
2. Click **Sign Out**
3. Sign in with the other account

### Data Separation

- Each user's workouts are completely separate
- Each user's Active Wellbeing sessions are separate
- Each user can customize their own rest timer settings
- No data is shared between accounts

## Features

### Login Page

- Email and password authentication
- Toggle between login and signup
- Form validation
- Loading states
- Error handling

### Settings Page

- Shows current user's name and email
- Sign out button
- Rest timer settings (per user)

### Security

- All routes protected except login
- Session persistence (stays logged in)
- Auto-redirect to login when session expires
- Row-level security ensures data isolation

## Testing

To test multi-user functionality:

1. Create first account with your email
2. Log a few workouts and wellbeing sessions
3. Sign out
4. Create second account with different email
5. Verify the second account has empty history
6. Log different data for second user
7. Sign out and sign back in as first user
8. Verify your original data is still there

## Email Configuration (Optional)

If you want email verification and password reset:

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. Customize the email templates
3. Go to **Authentication** → **URL Configuration**
4. Set your Site URL (e.g., `https://yourdomain.com/weegym`)
5. Add Redirect URLs for email confirmation

## Troubleshooting

### "Not authenticated" errors

- Make sure RLS policies are set up correctly
- Check that user is logged in (check browser console)
- Verify VITE_SUPABASE settings are correct

### Email not being sent

- Check Supabase email settings
- For development, you can disable email confirmation
- Check Supabase logs in dashboard

### Can't see data after login

- Ensure RLS policies are created
- Check that data has correct `user_id`
- Look at browser console for errors

## Next Steps

Consider adding:

- Password reset functionality
- Profile picture upload
- Account settings (change name, email)
- Social login (Google, Apple, etc.)
- Family accounts (shared data for family members)
