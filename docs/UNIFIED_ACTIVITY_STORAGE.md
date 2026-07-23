# Unified Activity Storage & Multi-Account Management

**Created:** July 23, 2026  
**Purpose:** Store all Strava activities in a standard database format, prevent duplicates, and support importing from multiple accounts.

## Overview

This system allows you to:

- ✅ **Store all activities** in a standardized database format
- ✅ **Prevent duplicates** using smart detection (not just IDs)
- ✅ **Import from multiple sources** (current account, old accounts, CSV exports)
- ✅ **Merge accounts** - combine activities from different Strava accounts
- ✅ **Never lose data** - activities persist even if Strava connection is lost
- ✅ **Unified display** - see all activities together regardless of source

## Database Schema

### Core Tables

**`strava_activities`** - Stores all activities in standardized format:

```sql
- id (UUID): Internal unique ID
- user_id (UUID): Your WeeGym user ID
- strava_id (BIGINT): Original Strava activity ID (may be same for different accounts)
- app_name (TEXT): Which Strava app/account ('primary', 'secondary', 'imported', etc.)
- name (TEXT): Activity name
- type (TEXT): Activity type (Ride, Run, Walk, etc.)
- start_date (TIMESTAMPTZ): When activity started
- distance (DECIMAL): Distance in meters
- moving_time (INTEGER): Moving time in seconds
- calories (DECIMAL): Calories (from API or estimated)
- import_source (TEXT): How it was added ('strava_sync', 'csv_import', 'manual_import')
- is_duplicate (BOOLEAN): Marked as duplicate of another activity
- activity_data (JSONB): Full original data for reference
```

### Duplicate Prevention

**UNIQUE constraint:** `(user_id, app_name, strava_id)`

- Same activity from different accounts = different strava_id = no conflict ✅
- Smart duplicate detection checks: start time, type, distance, duration

## Setup Instructions

### 1. Run Database Migrations

Execute these SQL scripts in Supabase Dashboard → SQL Editor:

```bash
# First, ensure multi-account support is enabled
supabase-config/add-multi-strava-accounts.sql

# Then, add unified activity management
supabase-config/unified-activities-view.sql
```

Verify migration:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'strava_activities'
  AND column_name IN ('app_name', 'import_source', 'is_duplicate');
```

### 2. Add NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "strava:import": "node scripts/import-activities.js"
  }
}
```

## Usage Scenarios

### Scenario 1: Current Strava Account (Auto-Sync)

**This is already working!** When you connect Strava and sync:

- Activities are automatically saved to database
- Each sync checks for new activities only (incremental)
- Full resync available to reprocess all activities
- Data persists even if you disconnect

**To verify:**

```bash
npm run strava:check-activities
```

### Scenario 2: Import from Old Strava Account

**Problem:** You had an old Strava account that you no longer use, but want the historical activities.

**Solution: Export from Strava**

1. **Request Your Data Archive:**
   - Go to: https://www.strava.com/athlete/delete_your_account
   - Click "Request Your Archive" (you don't have to delete!)
   - Wait for email (usually within 7 days)
   - Download and extract the archive

2. **Import the CSV:**

   ```bash
   npm run strava:import csv path/to/activities.csv YOUR_USER_ID "old_account"
   ```

3. **Verify Import:**
   ```bash
   npm run strava:check-activities
   ```

**What happens:**

- Script reads the CSV from Strava
- Checks each activity for duplicates (smart detection)
- Imports only unique activities
- Marks source as `csv_import` and app as `old_account`

### Scenario 3: Import from Multiple Accounts

**Problem:** You have multiple Strava accounts (personal, work, old account) and want them all in one place.

**Solution:**

1. **Connect First Account:**
   - Connect via WeeGym UI (Strava Connect page)
   - Sync activities
   - These get marked as `primary` / `strava_sync`

2. **Import Second Account:**

   ```bash
   # Get second account's export
   npm run strava:import csv old-account.csv YOUR_USER_ID "personal_old"
   ```

3. **Import Third Account:**

   ```bash
   npm run strava:import csv work-account.csv YOUR_USER_ID "work_account"
   ```

4. **View All Together:**
   - All activities appear in WeeGym Activities page
   - Filtered and sorted as one unified list
   - Source tracking shows where each came from

### Scenario 4: Manual Data Entry

**Problem:** You have activities from before you used Strava, or from devices that don't sync.

**Solution: JSON Import**

1. **Create JSON File** (`manual-activities.json`):

   ```json
   [
     {
       "name": "Morning Run",
       "type": "Run",
       "start_date": "2024-01-15T08:00:00Z",
       "distance": 5000,
       "moving_time": 1800,
       "calories": 350
     },
     {
       "name": "Bike to Work",
       "type": "Ride",
       "start_date": "2024-01-15T17:00:00Z",
       "distance": 8000,
       "moving_time": 1200,
       "calories": 200
     }
   ]
   ```

2. **Import:**
   ```bash
   npm run strava:import json manual-activities.json YOUR_USER_ID "manual"
   ```

## Smart Duplicate Detection

The system detects duplicates based on similarity, not just IDs:

**Similarity Factors:**

- ⏰ **Start Time** (±5 minutes): 40 points
- 🏃 **Activity Type** (exact match): 30 points
- 📏 **Distance** (±5% tolerance): 20 points
- ⏱️ **Duration** (±1 minute): 10 points

**Score > 70% = Duplicate**

**Example:**

```
Activity A: 2024-07-01 10:00, Ride, 15.2km, 45min
Activity B: 2024-07-01 10:02, Ride, 15.0km, 44min
Similarity: 40 + 30 + 20 + 10 = 100% ✅ DUPLICATE
```

This means even if you import the same activity from different accounts (different strava_ids), it will be detected as a duplicate!

## Viewing Your Data

### In WeeGym App

Activities page shows all activities from all sources:

- Synced from current Strava account
- Imported from old accounts
- Manually added

Each activity can show source badge:

- 🔗 Synced from Strava
- 📥 Manually Imported
- 📊 CSV Import

### SQL Queries

**View all activities:**

```sql
SELECT * FROM unified_activities
WHERE user_id = 'YOUR_USER_ID'
ORDER BY start_date DESC
LIMIT 50;
```

**Check for duplicates:**

```sql
SELECT * FROM strava_activities
WHERE user_id = 'YOUR_USER_ID'
  AND is_duplicate = true;
```

**Stats by source:**

```sql
SELECT * FROM activity_stats_by_source
WHERE user_id = 'YOUR_USER_ID';
```

**Find potential duplicates:**

```sql
SELECT * FROM find_duplicate_activities(
  'YOUR_USER_ID'::UUID,
  '2024-07-01 10:00:00'::TIMESTAMPTZ,
  'Ride',
  15000.0,
  2700
);
```

## Managing Duplicates

### Automatic Handling

Import script automatically skips duplicates:

```
⏭️  Skipping duplicate [15/100]: Morning Ride (95% match)
```

### Manual Management

If you want to manually merge duplicates:

```sql
-- Mark as duplicate
SELECT mark_as_duplicate(
  'duplicate-activity-uuid'::UUID,
  'original-activity-uuid'::UUID
);

-- Merge data from both (keeps best data)
SELECT merge_activity_data(
  'keep-this-uuid'::UUID,
  'merge-from-this-uuid'::UUID
);
```

### Finding Your User ID

```bash
# In browser console (F12) while logged in
console.log(JSON.parse(localStorage.getItem('supabase.auth.token')).user.id);
```

Or in SQL:

```sql
SELECT id, email FROM auth.users;
```

## Data Formats Supported

### ✅ Strava CSV Export

- Official Strava data archive
- Complete activity history
- Includes all activity types

### ✅ JSON Array

- Custom format for manual entry
- Flexible field mapping
- Good for one-off imports

### 🔜 GPX Files (Coming Soon)

- GPS track files
- Common format from many devices
- Auto-extract metadata

### 🔜 TCX Files (Coming Soon)

- Training Center XML
- Detailed metrics
- Heart rate zones

## Troubleshooting

### "Function find_duplicate_activities does not exist"

Run the SQL migration:

```bash
supabase-config/unified-activities-view.sql
```

### "Cannot read CSV file"

Check file path and format:

```bash
# Should have headers: Activity ID, Activity Name, Activity Type, etc.
head -n 2 activities.csv
```

### "Too many duplicates detected"

Adjust tolerance in function call:

```javascript
p_tolerance_seconds: 600; // 10 minutes instead of 5
```

### "Import is slow"

Normal! The script:

- Fetches each activity
- Checks for duplicates
- Validates data
- Inserts to database
- ~10 activities per second

## Best Practices

### 1. **Start with Current Account**

Connect and sync your current Strava account first. This gives you a baseline.

### 2. **Import Oldest Data First**

Import historical data before recent data. This ensures proper duplicate detection.

### 3. **Use Descriptive App Names**

- `primary` - Current main account
- `old_2020` - Old account from 2020
- `work_account` - Work-related activities
- `manual` - Manually entered

### 4. **Regular Backups**

Export your activities periodically:

```sql
COPY (
  SELECT * FROM unified_activities
  WHERE user_id = 'YOUR_USER_ID'
) TO '/path/to/backup.csv' WITH CSV HEADER;
```

### 5. **Check Import Results**

After each import, verify:

```bash
npm run strava:check-activities
```

## Next Steps

After setting up unified storage:

1. ✅ Run SQL migrations
2. ✅ Verify current Strava sync is working
3. ✅ Request data archive from old accounts
4. ✅ Import historical activities
5. ✅ Check for and resolve any duplicates
6. ✅ Enjoy your complete activity history!

## Related Documentation

- [STRAVA_DATABASE_CONFIG.md](./STRAVA_DATABASE_CONFIG.md) - Database setup
- [MULTI_STRAVA_IMPLEMENTATION.md](./MULTI_STRAVA_IMPLEMENTATION.md) - Multi-account support
- [STRAVA_QUICK_REFERENCE.md](./STRAVA_QUICK_REFERENCE.md) - API reference

## Support

For issues or questions:

1. Check the troubleshooting section
2. Verify SQL migrations are applied
3. Check browser console for errors
4. Review import logs
