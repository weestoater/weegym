# Quick Start: Unified Activity Storage

## What You Get

✅ **All activities stored in database** - Never lose your data  
✅ **Smart duplicate prevention** - Import from multiple sources safely  
✅ **Standard format** - Consistent display regardless of source  
✅ **Multi-account support** - Merge old accounts, work accounts, etc.  
✅ **Import from anywhere** - CSV exports, JSON, manual entry

## 3-Step Setup

### Step 1: Run Database Migration

Open **Supabase Dashboard** → **SQL Editor** and execute:

```sql
-- File: supabase-config/unified-activities-view.sql
```

This adds:

- Duplicate detection logic
- Import source tracking
- Unified activity views
- Helper functions for merging

### Step 2: Verify Current Setup

```bash
# Check if activities table is ready
npm run strava:check-activities

# Check app configuration
npm run strava:check-app-configs
```

### Step 3: You're Done!

Your current Strava sync already uses the database. Activities are being stored automatically.

## Import from Old Accounts (Optional)

If you want to import activities from previous Strava accounts:

### 1. Request Your Data from Strava

1. Go to: https://www.strava.com/athlete/delete_your_account
2. Click **"Request Your Archive"** (don't worry, you're not deleting!)
3. Wait for email (7 days max)
4. Download and extract `activities.csv`

### 2. Get Your User ID

**Option A: Browser Console**

```javascript
// While logged into WeeGym, open browser console (F12) and run:
JSON.parse(localStorage.getItem("supabase.auth.token")).user.id;
```

**Option B: Supabase Dashboard**

```sql
SELECT id, email FROM auth.users;
```

### 3. Import the CSV

```bash
npm run strava:import csv path/to/activities.csv "YOUR_USER_ID" "old_account"
```

**Example:**

```bash
npm run strava:import csv ~/Downloads/strava_export/activities.csv "123e4567-e89b-12d3-a456-426614174000" "personal_2020"
```

### 4. Check Results

```bash
npm run strava:check-activities
```

You should see activities from both accounts!

## How It Works

### Automatic Sync (Current Account)

- Connect Strava in WeeGym
- Click "Sync Activities"
- Activities saved to database automatically
- Marked as `strava_sync` / `primary`

### Import (Old Accounts)

- Export CSV from Strava
- Run import script
- Duplicate detection runs automatically
- Activities marked as `csv_import` / `old_account`

### Duplicate Prevention

Activities are compared on:

- Start time (±5 minutes)
- Activity type
- Distance (±5%)
- Duration (±1 minute)

**Score > 70% = Duplicate = Skipped**

## View Your Data

### In WeeGym App

Go to **Strava Activities** page - all activities from all sources appear together.

### In Database

```sql
-- All activities (excluding duplicates)
SELECT
  start_date,
  name,
  type,
  ROUND(distance/1000, 2) as km,
  ROUND(calories) as cal,
  import_source,
  app_name
FROM unified_activities
WHERE user_id = 'YOUR_USER_ID'
ORDER BY start_date DESC
LIMIT 50;

-- Stats by source
SELECT * FROM activity_stats_by_source
WHERE user_id = 'YOUR_USER_ID';
```

## Common Scenarios

### "I have activities on an old account I no longer access"

→ Request Strava data archive, import CSV

### "I want to merge my personal and work Strava accounts"

→ Connect one via app, import the other via CSV

### "I tracked activities before using Strava"

→ Create JSON file with manual data, import it

### "I accidentally imported duplicates"

→ They're automatically marked as duplicates and hidden from main view

### "I want to see which activities came from which source"

→ Check the `import_source` and `app_name` columns

## Troubleshooting

| Issue                                               | Solution                                             |
| --------------------------------------------------- | ---------------------------------------------------- |
| "Function find_duplicate_activities does not exist" | Run the SQL migration: `unified-activities-view.sql` |
| "Cannot import CSV"                                 | Check file path, ensure it's from Strava export      |
| No activities showing                               | Verify `npm run strava:check-activities` shows data  |
| Too many duplicates                                 | Normal if importing same account twice               |
| Import is slow                                      | Expected - processes ~10 activities/second           |

## Files Created

- ✅ `supabase-config/unified-activities-view.sql` - Database schema
- ✅ `scripts/import-activities.js` - Import utility
- ✅ `docs/UNIFIED_ACTIVITY_STORAGE.md` - Full documentation
- ✅ `package.json` updated with `strava:import` script

## Next Steps

1. ✅ Run SQL migration (if not already done)
2. ✅ Connect current Strava account and sync
3. ✅ (Optional) Import from old accounts
4. ✅ View all your activities together!

## Need More Help?

See full documentation: [docs/UNIFIED_ACTIVITY_STORAGE.md](../docs/UNIFIED_ACTIVITY_STORAGE.md)

---

**Note:** Your current Strava sync already saves to database! This setup just adds import capabilities for merging multiple accounts.
