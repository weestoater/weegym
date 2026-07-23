# Strava 403 Error Troubleshooting

## Current Status (2026-07-23)

### ✅ What's Working

- Database migration completed
- `strava_app_configs` table created with Client ID: 45863
- App configuration is active in database
- Code updated to use database-driven config

### ❌ What's Not Working

- **No active Strava connection in database**
- Getting 403 error when trying to sync activities
- Likely browser cache/localStorage has stale data

## The Problem

You're trying to sync Strava activities, but there's **no active connection** in the database:

```bash
npm run strava:check-connections
# ✅ No Strava connections found in database
```

The 403 error occurs because:

1. Your code is trying to make API calls to Strava
2. But you haven't connected/authorized the app yet
3. Or an old connection was deleted but browser still thinks it's connected

## The Solution

### Step 1: Clear Browser State

Open your browser's Developer Console (F12) and run:

```javascript
// Clear all Strava-related localStorage
Object.keys(localStorage).forEach((key) => {
  if (key.includes("strava") || key.includes("Strava")) {
    console.log("Removing:", key);
    localStorage.removeItem(key);
  }
});
```

Then refresh the page.

### Step 2: Check Connection Status

After refreshing, you should see a **"Connect to Strava"** button (not sync options).

If you see sync/disconnect buttons, the UI has stale state. Try:

1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Or clear all site data in browser settings

### Step 3: Revoke Old Authorizations (Important!)

Visit: https://www.strava.com/settings/api

**Delete/Revoke any old authorizations** for your app, especially:

- Old "WeeGym" or similar app names
- Client ID: 239101 (old app)
- Any apps you don't recognize

This is critical - Strava's servers might still have old authorizations that conflict.

### Step 4: Connect Fresh

1. Click **"Connect to Strava"** button
2. Authorize the app (Client ID: 45863)
3. You'll be redirected back to your app
4. Connection should be created in database

Verify:

```bash
npm run strava:check-connections
# Should show: ✅ Found 1 connection
```

### Step 5: Sync Activities

Now you can click **"Sync Activities"** or **"Full Resync"**

## Code Fixes Applied

Fixed two bugs where `getAuthorizationUrl()` was called without `await`:

- ✅ [StravaConnect.jsx](../src/pages/StravaConnect.jsx#L186-L193) - Made `handleConnect` async
- ✅ [Settings.jsx](../src/pages/Settings.jsx#L71-L80) - Made `handleStravaConnect` async

## Verification Commands

```bash
# Check app config (should show Client ID: 45863)
npm run strava:check-app-configs

# Check connections (should show 1 after connecting)
npm run strava:check-connections

# Check activities (will be 0 until you sync)
npm run strava:check-activities

# Check environment config (fallback if DB fails)
npm run strava:check-config
```

## Common Issues

### "Table strava_app_configs does not exist"

Run the SQL script:

- Open Supabase Dashboard → SQL Editor
- Execute: `supabase-config/add-strava-app-configs.sql`

### Still getting 403 after connecting

1. Check access token in database is valid
2. Make sure you revoked old Strava authorizations
3. Try disconnecting and reconnecting
4. Check browser console for specific error details

### "No active Strava connection found"

This means you need to connect first before syncing.

- Go to Strava Connect page
- Click "Connect to Strava" button
- Complete OAuth flow

## Next Steps After Fixing

Once connected and syncing works:

1. **Test Full Resync**: Click "Full Resync" to ensure all activities sync properly
2. **Verify Calorie Estimation**: Check that calories are populated (API or estimated)
3. **Monitor Sync**: Check last_sync timestamp updates correctly
4. **Clean Up**: Delete old Strava app (Client ID: 239101) if no longer needed

## Need More Help?

Check these files for detailed documentation:

- [STRAVA_DATABASE_CONFIG.md](./STRAVA_DATABASE_CONFIG.md) - Database setup guide
- [STRAVA_QUOTA_LIMIT.md](./STRAVA_QUOTA_LIMIT.md) - Quota limit troubleshooting
- [STRAVA_TROUBLESHOOTING.md](./STRAVA_TROUBLESHOOTING.md) - General Strava issues
