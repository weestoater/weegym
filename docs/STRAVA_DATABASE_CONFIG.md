# Strava Database Configuration Migration

## ✅ What Changed

Strava app configuration has been moved from environment variables (`.env` files) to a database table (`strava_app_configs`). This means:

- ✅ **No server restarts needed** to change Strava apps
- ✅ **Dynamic configuration** - switch between apps via UI or database
- ✅ **Simpler deployment** - no need to manage multiple `.env` files
- ✅ **Fallback support** - still works with `.env` if database config not available

## 🚀 Quick Setup

### 1. Create the Database Table

Run this SQL in your Supabase SQL Editor:

```bash
# Navigate to Supabase dashboard > SQL Editor
# Run: supabase-config/add-strava-app-configs.sql
```

Or directly in SQL Editor, paste and run the content from:
`supabase-config/add-strava-app-configs.sql`

This will:

- Create the `strava_app_configs` table
- Insert your current app configuration (Client ID: 45863)
- Set up triggers to ensure only one app is active at a time

### 2. Verify Configuration

Check that your config is in the database:

```sql
SELECT app_name, client_id, redirect_uri, is_active, description
FROM strava_app_configs;
```

You should see:
| app_name | client_id | redirect_uri | is_active | description |
|----------|-----------|--------------|-----------|-------------|
| primary | 45863 | http://localhost:5173/strava/callback | true | Primary Strava app configuration |

### 3. Restart Your Dev Server

The changes to `stravaService.js` require a restart:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 4. Test the Connection

1. Open your browser at http://localhost:5173
2. Check the console - you should see:
   ```
   🔧 Loading Strava configuration from database...
   ✅ Strava config loaded from database: { appName: "primary", clientId: "45863", ... }
   ```
3. Navigate to the Strava Connect page
4. Connect to Strava (should now use Client ID: 45863)
5. Try syncing activities

## 📝 Managing Configurations

### Add a New Strava App

```sql
INSERT INTO strava_app_configs (app_name, client_id, client_secret, redirect_uri, is_active, description)
VALUES (
  'backup-app',
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:5173/strava/callback',
  false,  -- Set to true to make this the active app
  'Backup Strava app'
);
```

### Switch Active App

```sql
UPDATE strava_app_configs
SET is_active = true
WHERE app_name = 'backup-app';
-- The trigger automatically deactivates other apps
```

### View All Configurations

```sql
SELECT * FROM strava_app_configs ORDER BY created_at;
```

### Delete Old Configuration

```sql
DELETE FROM strava_app_configs
WHERE app_name = 'legacy';
```

## 🔄 How It Works

1. **On app load**: `stravaService.js` loads the active configuration from the database
2. **Caching**: Configuration is cached in memory for performance
3. **Fallback**: If database config not available, falls back to `.env` variables
4. **OAuth flow**: Uses the loaded configuration for all Strava API calls
5. **Reload**: Call `reloadStravaConfig()` to refresh the cache without restarting

## 🎯 Benefits

**Before** (Environment Variables):

- Change config → Edit `.env` → Restart server → Wait → Test
- Multiple apps → Multiple `.env` files → Confusion
- Production deployment → Manage secrets in hosting platform

**After** (Database Config):

- Change config → Update database → Instant effect
- Multiple apps → One table, switch via SQL or UI
- Production → Same process, just different database

## 🔍 Troubleshooting

### "No active Strava config in database"

- Check if the table exists: `SELECT * FROM strava_app_configs;`
- Run the setup SQL script
- Check that at least one config has `is_active = true`

### Still using old Client ID

- Hard refresh browser: `Ctrl+Shift+R`
- Check browser console for config load messages
- Verify database has correct `client_id`

### "Strava is not configured properly"

- Ensure database table is created and has data
- Check `.env` has fallback values (if needed)
- Look at server console for detailed error messages

## 📚 Files Changed

- ✅ `supabase-config/add-strava-app-configs.sql` - Database schema
- ✅ `src/services/stravaService.js` - Updated to load from database
- ✅ `docs/STRAVA_DATABASE_CONFIG.md` - This documentation

## 🎉 Next Steps

1. ✅ Run the SQL script to create the table
2. ✅ Restart your dev server
3. ✅ Connect to Strava using the new configuration
4. ✅ Verify syncing works
5. 🎯 Optional: Add UI to manage configurations (future enhancement)

---

**Last Updated**: 2026-07-23  
**Status**: Ready to use - database-driven configuration active
