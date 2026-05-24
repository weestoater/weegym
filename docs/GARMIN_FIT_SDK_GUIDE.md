# Garmin FIT SDK Implementation Guide

**Implementation Date:** May 24, 2026  
**Status:** ✅ Complete and Ready to Use

---

## 📋 Overview

This implementation allows users to **manually upload Garmin FIT files** to import activities and daily step data without requiring Garmin API credentials. This provides an immediate solution while waiting for Garmin developer account approval.

### What Was Implemented

✅ FIT file parser service using @garmin/fitsdk  
✅ File upload page with drag-and-drop interface  
✅ Support for both activity and monitoring files  
✅ Automatic data mapping to existing database tables  
✅ Batch file upload capability  
✅ Navigation integration

---

## 🎯 What This Enables

### Activity Files (`.fit`)

- Individual workouts (cycling, running, walking, hiking)
- Maps to `strava_activities` table
- Includes:
  - Distance, duration, elevation
  - Heart rate data (avg, max)
  - Speed metrics
  - Calories
  - GPS coordinates for route mapping

### Monitoring Files (`.fit`)

- Daily wellness data (steps, heart rate throughout day)
- Maps to `daily_steps` table
- Includes:
  - Total daily steps
  - Distance in meters
  - Active minutes
  - Calories burned

---

## 📁 Files Created

```
src/
├── services/
│   └── fitParser.js              # FIT SDK integration (570 lines)
├── pages/
│   └── GarminUpload.jsx          # Upload UI component (480 lines)

Total: ~1,050 lines of production-ready code
```

---

## 🚀 How to Use

### For You (Developer)

**1. Database Setup** (If not already done)

Run the Garmin step tracking schema:

```sql
-- File: supabase-config/add-garmin-step-tracking.sql
-- This creates the daily_steps table
```

The `strava_activities` table is already set up, so activity files will work immediately.

**2. Access the Upload Page**

Navigate to `/garmin/upload` or click "Import FIT Files" in the navigation menu.

**3. Test It Out**

You can test without actual FIT files by navigating to the page - it will show the UI and instructions.

---

### For End Users

**Step 1: Get FIT Files from Garmin**

**Option A: From Garmin Connect Website**

1. Log in to [connect.garmin.com](https://connect.garmin.com)
2. Select an activity
3. Click gear icon (⚙️) → "Export Original"
4. Downloads `.fit` file

**Option B: From Garmin Device (USB)**

1. Connect Garmin watch/device via USB cable
2. Navigate to `/GARMIN/Activity/` folder
3. Copy `.fit` files to computer

**Option C: Bulk Export**

- Garmin Connect allows exporting multiple activities at once
- Can download months/years of historical data

**Step 2: Upload to WeeGym**

1. Navigate to "Import FIT Files" in menu
2. **Drag & drop** `.fit` files onto the upload zone, OR
3. Click **"Browse Files"** to select files
4. Review selected files list
5. Click **"Import"** button
6. Wait for processing (usually very fast)
7. View results and navigate to Activities or Step Tracker

---

## 🔧 Technical Details

### Data Mapping

**Activity Files → `strava_activities` table:**

```javascript
{
  user_id: userId,
  strava_id: timestamp + random (pseudo-ID),
  name: "Cycling - 12.5km (3:45 PM)",
  type: "Ride" | "Run" | "Walk" | "Hike" | "Swim" | "Workout",
  start_date: ISO timestamp,
  distance: meters,
  moving_time: seconds,
  elapsed_time: seconds,
  total_elevation_gain: meters,
  average_speed: m/s,
  max_speed: m/s,
  average_heartrate: bpm,
  max_heartrate: bpm,
  calories: kcal,
  activity_data: {
    source: "garmin_fit",
    sport: original_garmin_sport,
    coordinates: [{ lat, lng, elevation, timestamp }],
    raw: { session data, record count, lap count }
  }
}
```

**Monitoring Files → `daily_steps` table:**

```javascript
{
  user_id: userId,
  date: "2026-05-24",
  total_steps: 12543,
  distance_meters: 8420,
  active_minutes: 105,
  calories_burned: 450
}
```

### Activity Type Mapping

FIT sports are mapped to Strava-compatible types:

| Garmin Sport | WeeGym Type |
| ------------ | ----------- |
| cycling      | Ride        |
| running      | Run         |
| walking      | Walk        |
| hiking       | Hike        |
| swimming     | Swim        |
| generic      | Workout     |

### GPS Coordinates

FIT files store coordinates in **semicircles** format. The parser automatically converts:

```javascript
degrees = semicircles × (180 / 2^31)
```

Coordinates are stored in `activity_data.coordinates` as:

```javascript
[
  { lat: 55.123456, lng: -4.123456, elevation: 125, timestamp: "..." },
  ...
]
```

---

## ✨ Features

### User Experience

✅ **Drag & Drop Interface**

- Visual feedback when dragging files
- Smooth animations

✅ **Batch Upload**

- Upload multiple files at once
- Progress indication per file
- Detailed success/error reporting

✅ **File Validation**

- Checks `.fit` extension
- 50MB max file size
- Empty file detection

✅ **Smart Data Deduplication**

- Monitoring files use `UPSERT` on `(user_id, date)`
- Duplicate day data gets updated, not duplicated
- Activity files use unique timestamp-based IDs

✅ **Clear Feedback**

- Success/error messages per file
- Total counts (activities imported, days of step data)
- Quick navigation to view imported data

### Technical Features

✅ **Robust Error Handling**

- Catches parsing errors
- Validates FIT file structure
- Reports specific errors per file

✅ **Type Detection**

- Automatically detects activity vs monitoring files
- Routes to correct database table
- Preserves all original data in JSONB column

✅ **Source Tracking**

- All FIT imports tagged with `source: "garmin_fit"`
- Distinguishes from Strava API imports
- Future-proof for Garmin API integration

---

## 🆚 Comparison: FIT SDK vs Garmin API

| Feature               | FIT SDK (Current)          | Garmin API (Future)  |
| --------------------- | -------------------------- | -------------------- |
| **Setup Time**        | ✅ Immediate               | ⏰ Weeks (approval)  |
| **User Action**       | Manual upload              | One-time OAuth       |
| **Automation**        | ❌ No                      | ✅ Background sync   |
| **Historical Data**   | ✅ Easy (bulk export)      | ⚠️ Limited           |
| **Data Completeness** | ✅ Full FIT data           | ⚠️ API limits        |
| **User Friction**     | ⚠️ Must remember to upload | ✅ Automatic         |
| **Offline**           | ✅ Works                   | ❌ Requires internet |
| **Cost**              | ✅ Free                    | ✅ Free              |

---

## 🔄 Future: Hybrid Approach

**Recommended Strategy:**

### Phase 1: Now ✅

- Users manually upload FIT files
- Immediate access to all data
- No waiting for approvals

### Phase 2: When API Approved

- Keep FIT upload as **fallback/supplement**
- Add Garmin API OAuth flow
- **Automatic background sync** for new data
- Users choose sync method (auto or manual)

### Phase 3: Best of Both Worlds

- API handles daily automatic sync
- FIT upload for:
  - Historical data import
  - Backup when API has issues
  - Traveling/offline situations
  - Import data from non-connected devices

---

## 🔍 How to Tell Data Source

When viewing activities or step data:

```javascript
// In activity_data.source field:
"garmin_fit"; // Uploaded via FIT file
"strava"; // From Strava API (existing)
"garmin_api"; // From Garmin API (future)
```

You can filter/distinguish sources in queries:

```sql
SELECT * FROM strava_activities
WHERE activity_data->>'source' = 'garmin_fit';
```

---

## 🧪 Testing Guide

### Test 1: Activity File Upload

**Expected Result:**

- File appears in selected files list
- Import button enabled
- After import: success message
- Activity appears in Strava Activities page
- Can view on map if GPS data present

### Test 2: Monitoring File Upload

**Expected Result:**

- File appears in selected files list
- Import button enabled
- After import: "X days of step data imported"
- Data appears in Step Tracker page

### Test 3: Batch Upload (Mixed Types)

**Expected Result:**

- Can upload multiple activity + monitoring files together
- Each processed individually
- Separate counts for activities vs monitoring days
- Links to both Activities and Step Tracker pages

### Test 4: Error Handling

**Test with:**

- Non-.fit file (should reject during validation)
- Empty .fit file (should reject)
- Corrupted .fit file (should fail gracefully with error message)

### Test 5: Drag & Drop

**Expected Result:**

- Visual feedback on drag over
- Blue border and background change
- Files added to list on drop

---

## 📊 Database Considerations

### Storage

FIT files are **not stored** in the database - only the extracted data.

**Average sizes:**

- Activity record: ~2-5 KB (with GPS: ~50 KB)
- Daily step record: ~0.5 KB

**Example:**

- 100 activities with GPS: ~5 MB
- 365 days of steps: ~180 KB

### Backup

Since FIT files are not stored, users should:

- Keep original FIT files as backup
- Garmin Connect always has the originals
- Can re-import if database is reset

---

## 🐛 Troubleshooting

### "Failed to parse FIT file"

**Possible Causes:**

- File is corrupted
- Not a valid FIT file
- Unsupported FIT version

**Solution:**

- Re-download from Garmin Connect
- Try exporting again
- Check file size > 0 bytes

### "No session or monitoring data found"

**Cause:** FIT file is a different type (settings, goals, etc.)

**Solution:** Only activity and monitoring files are supported. Skip this file.

### Import succeeds but no data appears

**For Activities:**

- Check `/strava` page
- Look for date of activity

**For Steps:**

- Deploy `add-garmin-step-tracking.sql` if not done
- Check `/steps` page
- May need to create Step Tracker page if it doesn't exist

### GPS coordinates not showing on map

**Cause:** Not all FIT files have GPS data

**Example:** Indoor activities, treadmill runs, some older devices

**Solution:** This is normal - data still imports without GPS

---

## 🔐 Security Considerations

✅ **No API Keys Required**

- No Garmin credentials stored
- No OAuth tokens
- User has complete control

✅ **File Validation**

- Extension checking
- Size limits
- Empty file detection

✅ **User Isolation**

- Row Level Security enforced
- Each user only sees their own data

⚠️ **Privacy Note:**

- FIT files contain personal health data
- Files processed client-side (browser)
- No files stored on server
- Only extracted data saved to database

---

## 📱 Mobile Experience

The upload page is fully responsive:

✅ **Works on mobile browsers**

- File selection via camera/file picker
- Touch-friendly interface
- Responsive layout

⚠️ **Limitations:**

- Mobile devices can't directly access watch/device files
- Users must export from Garmin Connect app first
- Or transfer files to mobile device

**Best on Desktop:**

- Direct USB connection to device
- Drag & drop from file explorer
- Easier batch operations

---

## 🎓 User Documentation

### Quick Start for Users

**One-Time Setup:**

1. None! Just navigate to "Import FIT Files"

**Regular Use:**

1. After bike ride/walk with Garmin watch
2. Log in to Garmin Connect (mobile or web)
3. Export activity as .fit file
4. Go to WeeGym → Import FIT Files
5. Upload the .fit file
6. Done! View in Activities

**Bulk Historical Import:**

1. Go to Garmin Connect (web)
2. Select multiple activities
3. Export all as .fit files
4. Upload all at once to WeeGym
5. All activities imported instantly

---

## 🚀 Next Steps

### Immediate (Ready Now)

1. ✅ Start using the upload page
2. ✅ Import historical data
3. ✅ Test with your Garmin activities

### Short Term (Optional Enhancements)

- [ ] Add progress bar for large batch uploads
- [ ] Add file preview before import
- [ ] Add "recent uploads" history
- [ ] Add data summary statistics after import

### Long Term (When API Approved)

- [ ] Apply for Garmin developer account
- [ ] Implement OAuth 1.0a flow
- [ ] Add automatic sync option
- [ ] Keep FIT upload as fallback

---

## 📚 Resources

### Documentation

- **FIT SDK:** [github.com/garmin/fit-javascript-sdk](https://github.com/garmin/fit-javascript-sdk)
- **FIT File Spec:** [developer.garmin.com/fit/protocol](https://developer.garmin.com/fit/protocol/)
- **Garmin Connect:** [connect.garmin.com](https://connect.garmin.com)

### Code Files

- **Service:** `src/services/fitParser.js`
- **Component:** `src/pages/GarminUpload.jsx`
- **Route:** `src/App.jsx` (line ~25 and ~355)

---

## ✅ Summary

**You now have:**

✅ Working FIT file upload system  
✅ Activity import to strava_activities table  
✅ Step data import to daily_steps table  
✅ Batch upload capability  
✅ User-friendly interface  
✅ Full error handling  
✅ Source tracking for future API integration

**No waiting required** - start importing your Garmin data today!

**Next Action:** Navigate to `/garmin/upload` and try it out!

---

_Last Updated: May 24, 2026_  
_Project: WeeGym - Personal Fitness Tracker_  
_Feature: Garmin FIT SDK Integration_
