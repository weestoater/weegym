# Strava API Quota Limit - Troubleshooting Guide

## ⚠️ Error Message

```
This app has exceeded the limit of connected athletes.
If you are a developer of this application, please contact
Strava developer support for how to request a quota increase.
```

## 🔍 What This Means

Strava limits the number of athletes who can connect to your app:

- **Development Mode**: ~15-30 athletes maximum
- **Production Mode**: Much higher limits (typically unlimited)

## ✅ Immediate Solutions

### Option 1: Clean Up Old Connections (Fastest)

1. **Go to Strava API Settings:**
   - Visit: https://www.strava.com/settings/api
   - Find your app (Client ID: `239101` or your configured ID)

2. **Revoke Old Test Connections:**
   - Click "View Application" or "Manage Athletes"
   - Review the list of connected athletes
   - Remove any test accounts or old connections you no longer need
   - **Tip**: If you've been testing, you might have the same athlete connected multiple times

3. **Delete from Database:**

   ```sql
   -- Check current connections in Supabase
   SELECT user_id, athlete_id, athlete_name, created_at
   FROM strava_connections
   ORDER BY created_at DESC;

   -- Delete old/test connections (if needed)
   DELETE FROM strava_connections
   WHERE user_id = 'test-user-id';
   ```

### Option 2: Request Quota Increase from Strava

1. **Contact Strava Developer Support:**
   - Email: developers@strava.com
   - Subject: "Request for Athlete Quota Increase - App: [Your App Name]"

2. **Include in Email:**

   ```
   App Name: WeeGym
   Client ID: [Your Client ID from .env]
   Current Usage: [Number of athletes]
   Requested Quota: [e.g., 100 or "unlimited"]
   Use Case: Personal fitness tracking application for [describe your use]
   ```

3. **Expected Response Time:** Usually 3-5 business days

### Option 3: Move App to Production (If Applicable)

**Note**: Only if your app is ready for public use.

1. Go to https://www.strava.com/settings/api
2. Find your application
3. Look for options to:
   - Submit for review
   - Move to production
   - Request production access

**Requirements** (typically):

- Terms of Service page
- Privacy Policy
- Proper app description
- Logo/branding

## 🛠️ Check Your Current Status

### 1. Count Connected Athletes

Run this query in **Supabase SQL Editor**:

```sql
-- Count unique athletes connected
SELECT COUNT(DISTINCT athlete_id) as total_athletes,
       COUNT(*) as total_connections,
       MIN(created_at) as first_connection,
       MAX(created_at) as latest_connection
FROM strava_connections;

-- See all connections
SELECT
  user_id,
  athlete_id,
  athlete_name,
  created_at,
  last_sync_at
FROM strava_connections
ORDER BY created_at DESC;
```

### 2. Check Strava API Dashboard

1. Go to: https://www.strava.com/settings/api
2. Find your app
3. Check:
   - Number of authorized athletes
   - Daily API usage
   - Rate limit status

## 📝 Best Practices to Avoid This

### During Development

1. **Use a Single Test Account:**
   - Don't connect multiple test accounts
   - Reuse the same Strava account for testing

2. **Clean Up After Testing:**
   - Disconnect when done testing
   - Delete test connections from database

3. **Track Your Connections:**
   ```sql
   -- Add this query to your admin dashboard
   SELECT COUNT(*) as athlete_count FROM strava_connections;
   ```

### For Production

1. **Monitor Usage:**
   - Set up alerts when approaching quota
   - Log connection/disconnection events

2. **Implement User Management:**
   - Allow users to disconnect
   - Auto-cleanup of inactive connections (optional)

3. **Request Higher Quota Early:**
   - Don't wait until you hit the limit
   - Request increase when you reach 50% of quota

## 🚀 Quick Fix Checklist

- [ ] Visit https://www.strava.com/settings/api
- [ ] Check number of authorized athletes
- [ ] Remove any test/old connections
- [ ] Check Supabase `strava_connections` table
- [ ] Delete old test records if needed
- [ ] Try connecting again
- [ ] If still blocked, email developers@strava.com

## 📧 Email Template for Strava Support

```
Subject: Request for Athlete Quota Increase - WeeGym App

Hello Strava Developer Support,

I'm developing a personal fitness tracking application called WeeGym
and have reached the athlete connection limit for my application.

Application Details:
- App Name: WeeGym
- Client ID: [Your Client ID]
- Current Status: Development/Testing
- Current Athletes: [Number from query above]
- Requested Quota: 100 athletes (or unlimited if production-ready)

Use Case:
WeeGym is a fitness tracking application that helps users monitor
their workouts, track calories, and sync activity data from Strava.
[Add more details about your use case]

Could you please increase the athlete connection quota for this application?

Thank you,
[Your Name]
```

## 🔗 Helpful Links

- Strava API Settings: https://www.strava.com/settings/api
- Strava API Documentation: https://developers.strava.com/docs/getting-started/
- Strava Developer Support: developers@strava.com
- Rate Limits: https://developers.strava.com/docs/rate-limits/

---

**Last Updated**: 2026-07-23  
**Status**: Active Issue - Quota Limit Reached
