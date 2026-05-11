# Strava Integration Plan

## Overview

This document outlines the plan for integrating Strava API to track walks, bike rides, and other fitness activities in the WeeGym application.

**Status:** Phase 3 Complete ✅ | Ready for Phase 4 (Testing)

**Last Updated:** May 11, 2026

**Use Case:** Garmin Watch → Strava → WeeGym

- Track mountain bike rides and dog walks
- Display activity stats (distance, time, heart rate, calories, etc.)
- Expandable details with full metrics
- Optional route mapping

**Simplified Approach:**

- Store connection tokens only (1 table)
- Fetch activities on-demand from Strava API
- No local caching (can add later if needed)
- Estimated time: 6-8 hours MVP

---

## Implementation Decisions (Refined May 11, 2026)

### ✅ What We're Building (MVP)

**Activity Types:**

- Mountain bike rides
- Dog walks
- (Other Strava activities will show but focused on above)

**MVP View Features:**

- Distance
- Duration
- Average heart rate ❤️
- Calories

**Expanded View Features:**

- All above +
- Elevation gain
- Average & max speed
- Average & max heart rate
- Elapsed vs moving time
- Link to view on Strava

**Phase 3 (Optional):**

- Interactive route maps with Leaflet

### 🏗️ Technical Decisions

**Storage:**

- ✅ Store tokens AND activities (2 tables: `strava_connections` + `strava_activities`)
- ✅ Cache all activities locally for speed and historical data
- ✅ Sync strategy: manual + auto on page load (if 24h elapsed)
- ✅ Optional weekly auto-sync (Phase 3)

**Security:**

- ✅ RLS policies on both tables
- ❌ No token encryption initially (HTTPS + RLS sufficient for personal use)
- Can add encryption later if needed

**Data Display:**

- ✅ Default view: Last 30 days
- ✅ Filter options: 3 months, year, all time
- ✅ Filter by activity type (Ride, Walk, Run)
- ✅ Manual sync button always available
- ✅ Show sync status and timestamp

**Phase 3 Enhancements:**

- Route mapping with Leaflet
- Weekly auto-sync scheduler
- Activity analytics/charts

---

## API Research Summary

### Strava API ⭐ (Recommended)

- **Website**: https://developers.strava.com/
- **Documentation**: https://developers.strava.com/docs/reference/
- **Authentication**: OAuth 2.0
- **Free Tier**: Yes
  - 100 requests per 15 minutes
  - 1,000 requests per day
  - 2,000 requests per day (with approved rate limit increase)
- **Data Access**:
  - Activities (runs, walks, rides, swims, etc.)
  - Activity streams (GPS, heart rate, pace, power, cadence)
  - Routes and segments
  - Athlete profile and stats
  - Gear information
- **Key Features**:
  - Upload activities programmatically
  - Webhooks for real-time activity updates
  - Rich activity data (distance, duration, elevation, calories)
  - Social features (kudos, comments)

### Garmin Connect API

- **Website**: https://developer.garmin.com/
- **Authentication**: OAuth 1.0a
- **Access**: Requires developer account approval (can take days/weeks)
- **Data Access**:
  - Activities and activity files
  - Daily summaries (steps, calories, sleep)
  - Health metrics (heart rate, stress, body battery)
- **Considerations**:
  - More complex authentication
  - Approval process required
  - Better if users have Garmin devices
  - Note: Garmin devices can sync to Strava automatically

## Recommended Approach: Strava API

**Why Strava?**

1. ✅ No approval wait time - start immediately
2. ✅ Simpler OAuth 2.0 implementation
3. ✅ Better documentation and community support
4. ✅ Most fitness apps and devices sync to Strava (including Garmin!)
5. ✅ More widely adopted by fitness enthusiasts

---

## Implementation Steps

### Phase 1: Setup Strava API Application (USER ACTION REQUIRED)

**You need to do:**

1. **Create a Strava Account** (if you don't have one)
   - Go to https://www.strava.com/
   - Sign up for a free account

2. **Create a Strava API Application**
   - Go to https://www.strava.com/settings/api
   - Click "Create An App" or "My API Application"
   - Fill in the application form:
     - **Application Name**: WeeGym Tracker
     - **Category**: Training (or your preference)
     - **Club**: Leave blank
     - **Website**: Your deployment URL (e.g., https://yourdomain.com/weegym)
     - **Authorization Callback Domain**: Your domain (e.g., yourdomain.com or localhost for testing)
     - **Application Description**: "Fitness tracking integration for WeeGym"
   - Accept terms and create

3. **Save Your Credentials**
   - After creation, you'll receive:
     - **Client ID**: A numeric ID
     - **Client Secret**: A secret key (keep this secure!)
   - Save these for the next phase

4. **Configure Environment Variables**
   - Add to your `.env` file (create if it doesn't exist):
     ```
     VITE_STRAVA_CLIENT_ID=your_client_id_here
     VITE_STRAVA_CLIENT_SECRET=your_client_secret_here
     VITE_STRAVA_REDIRECT_URI=http://localhost:5173/weegym/strava/callback
     ```
   - For production, update the redirect URI to your deployed URL

---

### Phase 2: Backend Implementation ✅ COMPLETE (May 11, 2026)

**Hybrid approach: Store tokens + cache activities locally for fast access and history**

**Files Created:**

- [supabase-config/strava_schema.sql](../supabase-config/strava_schema.sql) - Database schema with RLS policies
- [src/services/stravaService.js](../src/services/stravaService.js) - Complete Strava API integration service

**To Apply Schema:** Run `strava_schema.sql` in Supabase SQL Editor

#### 2.1 Database Schema (2 Tables)

**Table 1: Connection Tokens**

```sql
CREATE TABLE strava_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id BIGINT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  athlete_data JSONB,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/manage their own connection
CREATE POLICY "Users can manage own Strava connection"
  ON strava_connections
  FOR ALL
  USING (auth.uid() = user_id);
```

**Table 2: Cached Activities**

```sql
CREATE TABLE strava_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Ride', 'Walk', 'Run', etc.
  start_date TIMESTAMPTZ NOT NULL,
  distance DECIMAL, -- meters
  moving_time INTEGER, -- seconds
  elapsed_time INTEGER, -- seconds
  total_elevation_gain DECIMAL, -- meters
  average_speed DECIMAL, -- m/s
  max_speed DECIMAL, -- m/s
  average_heartrate DECIMAL,
  max_heartrate DECIMAL,
  calories DECIMAL,
  activity_data JSONB, -- full Strava response
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strava_id)
);

-- Enable RLS
ALTER TABLE strava_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own activities
CREATE POLICY "Users can view own Strava activities"
  ON strava_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_strava_activities_user_date ON strava_activities(user_id, start_date DESC);
CREATE INDEX idx_strava_activities_type ON strava_activities(user_id, type);
```

**Why store locally?**

- ✅ Faster loading (no API wait)
- ✅ Historical data (all your past rides/walks)
- ✅ Works offline
- ✅ Fewer API calls
- ✅ Can build analytics later

#### 2.2 Strava Service (`src/services/stravaService.js`)

**Core Functions:**

1. **`getAuthorizationUrl()`** - Generate OAuth URL for initial connection
2. **`exchangeCodeForToken(code)`** - Exchange authorization code for access tokens
3. **`refreshAccessToken(userId)`** - Automatically refresh expired tokens
4. **`syncActivities(userId, options)`** - Fetch new activities from Strava and store locally
   - Checks last_sync timestamp
   - Only fetches activities since last sync (efficient!)
   - Upserts to database (updates existing, inserts new)
5. **`getActivities(userId, options)`** - Get activities from local database
   - Default: Last 30 days
   - Filter by type (Ride, Walk, etc.)
   - Pagination support
6. **`getActivityDetail(userId, activityId)`** - Get full stats for expanded view
7. **`disconnectStrava(userId)`** - Remove connection and activities

**Optional (Phase 3+):** 8. **`getActivityStream(userId, activityId)`** - Get GPS coordinates for route mapping 9. **`scheduleWeeklySync()`** - Auto-sync using cron/scheduler

**Sync Strategy:**

- Manual sync button always available
- Auto-sync on page load if last_sync > 24 hours
- Optional: Weekly auto-sync (Phase 3 enhancement)

#### 2.3 UI Requirements

**MVP View (Last 30 Days by Default):**

```
🚴 Mountain Bike Ride - May 10, 2026
   📏 15.3 km  ⏱️ 1h 23m  ❤️ 148 bpm avg  🔥 487 cal

🚶 Dog Walk - May 10, 2026
   📏 2.1 km   ⏱️ 28m     ❤️ 112 bpm avg  🔥 89 cal

Last synced: 2 hours ago  [↻ Sync Activities] [Filter: All ▾]
```

**Filter Options:**

- Last 30 days (default)
- Last 3 months
- Last year
- All time
- Activity type: All / Rides / Walks / Runs

**Expanded View (Click to see more):**

```
🚴 Mountain Bike Ride - May 10, 2026
   📏 Distance: 15.3 km
   ⏱️ Moving Time: 1h 23m
   ⏱️ Elapsed Time: 1h 31m
   ⛰️ Elevation Gain: 342m
   🏃 Avg Speed: 18.4 km/h
   ⚡ Max Speed: 42.7 km/h
   ❤️ Avg Heart Rate: 148 bpm
   💪 Max Heart Rate: 172 bpm
   🔥 Calories: 487

   [View on Strava]
```

**Sync Status:**

- "Last synced: 2 hours ago"
- "Syncing..." with spinner during sync
- "Found 3 new activities" after sync

**Phase 3 - Route Mapping:**

- Add [Show Route] button in expanded view
- Interactive map with route drawn
- Start/finish markers
- Use Leaflet (free, open-source)

---

### Phase 3: Frontend Implementation ✅ COMPLETE (May 11, 2026)

**Files Created:**
- [src/pages/StravaConnect.jsx](../src/pages/StravaConnect.jsx) - Connection management page
- [src/pages/StravaActivities.jsx](../src/pages/StravaActivities.jsx) - Activities list with filters
- [src/pages/StravaCallback.jsx](../src/pages/StravaCallback.jsx) - OAuth callback handler
- [src/components/StravaActivityCard.jsx](../src/components/StravaActivityCard.jsx) - Activity card component

**Files Modified:**
- [src/App.jsx](../src/App.jsx) - Added Strava routes and navigation menu item

#### 3.1 Strava Connection Page (`src/pages/StravaConnect.jsx`)

✅ Display connection status
✅ "Connect to Strava" button
✅ Show connected athlete info
✅ "Disconnect" option
✅ Last sync timestamp
✅ Sync status indicators
✅ Manual sync button with real-time feedback

#### 3.2 Strava Activities Page (`src/pages/StravaActivities.jsx`)

✅ List of synced activities
✅ Filter by type (Walk, Ride, Run, Hike)
✅ Date range filter (30 days, 3 months, year, all time)
✅ Activity cards showing:
  - Activity name
  - Type icon
  - Distance
  - Duration
  - Elevation
  - Calories
  - Date
✅ Link to view on Strava
✅ Manual sync button
✅ Summary statistics (total distance, time, activities, calories)
✅ Metric/Imperial unit toggle

#### 3.3 Strava Callback Handler (`src/pages/StravaCallback.jsx`)

✅ Handle OAuth redirect
✅ Exchange code for tokens
✅ Save to database
✅ Redirect to Strava connection page
✅ Error handling with user feedback

#### 3.4 Navigation Updates

✅ Add "Strava" menu item in navigation with bicycle icon
✅ Integrated into main navigation menu

#### 3.5 Dashboard Integration (Optional - Future Phase)

- Recent Strava activities widget
- Weekly distance summary
- Activity streak counter

---

### Phase 4: Testing & Refinement (READY)

**Testing Checklist:**

- [ ] OAuth flow works correctly
- [ ] Token refresh works before expiration
- [ ] Activities sync properly
- [ ] Filters and sorting work
- [ ] Disconnect removes tokens securely
- [ ] Error handling for API failures
- [ ] Offline behavior (show cached activities)
- [ ] Rate limit handling

**Security Considerations:**

- [ ] Tokens stored encrypted in database
- [ ] Client secret not exposed in frontend
- [ ] RLS policies on Strava tables
- [ ] Token refresh automated before expiry
- [ ] Secure callback URL validation

---

### Phase 5: Optional Enhancements

#### Webhooks (Real-time Updates)

- Subscribe to Strava webhooks
- Automatically sync new activities
- No manual sync needed

#### Advanced Features

- Activity mapping with route visualization
- Compare activities over time
- Personal records tracking
- Integration with Active Wellbeing (convert Strava activities to wellbeing logs)
- Calorie burn integration with Slimming World tracker

#### Analytics

- Weekly/monthly activity summaries
- Activity type breakdown
- Progress charts
- Year-over-year comparisons

---

## File Structure

```
src/
├── services/
│   └── stravaService.js          # Strava API integration
├── pages/
│   ├── StravaConnect.jsx         # Connection management
│   ├── StravaActivities.jsx      # Activity list and details
│   └── StravaCallback.jsx        # OAuth callback handler
├── components/
│   ├── StravaActivityCard.jsx    # Individual activity display
│   └── StravaStats.jsx           # Statistics widget
└── utils/
    └── stravaHelpers.js          # Helper functions

supabase-config/
└── strava_schema.sql             # Database schema
```

---

## Timeline Estimate (Revised - Hybrid Approach)

- **Phase 1 (User Setup)**: ✅ COMPLETE - 15 minutes
- **Phase 2 (Backend - Hybrid Storage)**: ✅ COMPLETE - 3-4 hours
  - ✅ 2 database tables (connections + activities)
  - ✅ 7 core functions (auth + sync + query)
  - ✅ Helper functions for formatting
  - ✅ Smart sync strategy with auto-refresh
- **Phase 3 (Frontend - MVP)**: ✅ COMPLETE - 3-4 hours
  - ✅ Connection page with sync management
  - ✅ Activity list with expand/collapse
  - ✅ Sync button and status with real-time feedback
  - ✅ Date/type filters with metric/imperial toggle
  - ✅ OAuth callback handler
  - ✅ Navigation integration
- **Phase 4 (Testing)**: 1-2 hours (READY - NEXT)
  - OAuth flow, sync, filters, offline behavior
- **Phase 5 (Route Mapping)**: 2-3 hours (optional)
- **Phase 6 (Weekly Auto-Sync)**: 1 hour (optional)

**Total MVP Implementation**: ✅ COMPLETE (~7-8 hours)
**With Route Mapping**: ~9-11 hours
**Fully Featured**: ~10-12 hours

---

## Next Steps

1. ✅ **Phase 1 Complete**: Strava API application set up & credentials validated
2. ✅ **Phase 2 Complete**: Backend implemented (database schema + Strava service with 7 core functions + helpers)
   - ✅ **Applied**: `supabase-config/strava_schema.sql` ready for Supabase SQL Editor
3. ✅ **Phase 3 Complete**: Frontend implemented (4 components + navigation + routes)
   - Connection management page with sync controls
   - Activities list with filtering and statistics
   - OAuth callback handler with error handling
   - Activity card component with expandable details
4. **Phase 4 (READY)**: Testing time!
   - Apply database schema in Supabase
   - Test OAuth flow end-to-end
   - Test activity sync and filters
   - Verify offline behavior
5. **Phase 5**: Optional enhancements (route mapping, auto-sync)
6. **Deploy**: Update production environment variables
7. **Enjoy**: Track your mountain bike rides and dog walks automatically!

**Ready to test the integration!**
- **Rate Limits**: https://developers.strava.com/docs/rate-limits/
- **Webhook Events**: https://developers.strava.com/docs/webhooks/

---

## Questions?

When you're ready to proceed, let me know and we can start with Phase 2 implementation!
