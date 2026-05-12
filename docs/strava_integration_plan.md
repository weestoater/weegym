# Strava Integration Plan

## Overview

This document outlines the plan for integrating Strava API to track walks, bike rides, and other fitness activities in the WeeGym application.

**Status:** Phase 6 Complete ✅ | Full PR tracking system implemented with enhanced iconography

**Last Updated:** May 12, 2026 (Evening)

**Use Case:** Garmin Watch → Strava → WeeGym

- Track mountain bike rides and dog walks
- Display activity stats (distance, time, heart rate, calories, etc.)
- Enhanced visual design with colorful cards and progress bars
- Interactive route mapping with GPS visualization
- Log activities to Active Wellbeing system
- Comprehensive analytics dashboard with charts
- Track personal records (PRs) across 6 categories
- Activity-specific iconography with color coding
- Expandable details with full metrics
- Weekly progress tracking and insights

**Implementation Summary:**

- ✅ 3 database tables (connections, activities, personal_records)
- ✅ Local activity caching for speed and offline access
- ✅ Incremental + full resync capabilities
- ✅ Personal Records tracking with automatic detection
- ✅ Enhanced UI with activity-specific iconography
- ✅ Complete analytics and route visualization
- **Total Time Invested:** ~20-25 hours (fully featured system)

---

## ✨ Feature Summary (What's Been Built)

### 🔐 Core Functionality (Phases 1-4)

- OAuth 2.0 authentication with Strava
- Automatic token refresh
- Activity syncing (incremental + full resync)
- Calorie estimation when API data missing (heart rate + MET values)
- Activity filtering by date range (30 days, 3 months, year, all time)
- Activity type filtering (Ride, Run, Walk, Hike, etc.)
- Metric/Imperial unit toggle
- Manual sync with real-time feedback
- Connection status management

### 🎨 Enhanced Experience (Phase 5)

- Colored metric cards with progress bars
- Active Wellbeing integration (log outdoor activities)
- GPS route visualization with Leaflet maps
- Start/finish markers on routes
- Analytics dashboard with weekly charts
- Activity type breakdown statistics
- Total distance, time, and calorie summaries
- Insights (Mount Everest elevation comparisons)

### 🏆 Personal Records (Phase 6)

- 6 PR categories tracked:
  - Longest Distance
  - Most Elevation Gain
  - Highest Average Speed
  - Longest Duration
  - Most Calories Burned
  - Maximum Speed
- PRs tracked separately by activity type (Ride ≠ Run)
- Time scope filtering (all-time, this year, this month)
- Automatic PR detection during sync
- Toast notifications when records are broken
- PR badges on activity cards
- Dedicated `/strava/records` page
- Shows previous records and improvements

### 🎨 Enhanced Iconography

- Activity-specific icons (30+ activity types)
- Color-coded icons and badges
- Large, visually distinct icons (fs-1, fs-3, fs-4 sizes)
- Consistent styling across all pages
- Dynamic badge colors based on activity type

### 📄 Pages Implemented

1. `/strava` - Main hub with activity list and controls
2. `/strava/activities` - Alternative activity view (legacy)
3. `/strava/analytics` - Analytics dashboard with charts
4. `/strava/records` - Personal Records showcase
5. `/strava/callback` - OAuth callback handler

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

### Phase 4: Testing & Refinement ✅ COMPLETE (May 11, 2026)

**Testing Checklist:**

- ✅ OAuth flow works correctly
- ✅ Token refresh works before expiration
- ✅ Activities sync properly (30+ activities tested)
- ✅ Calorie estimation implemented (heart rate + MET values)
- ✅ Full resync functionality for reprocessing all activities
- ✅ Filters and sorting work (date range, activity type, units)
- ✅ Disconnect removes tokens securely
- ✅ Error handling for API failures
- ✅ UI debug panel showing calorie data breakdown

**Security Considerations:**

- ✅ Client secret not exposed in frontend
- ✅ RLS policies on Strava tables
- ✅ Token refresh automated before expiry
- ✅ Secure callback URL validation

**Key Learnings:**

- Strava API doesn't expose Garmin calorie data - implemented estimation fallback
- JavaScript falsy checks can cause bugs when 0 is a valid value (use `=== undefined`)
- Full resync capability essential after processing logic changes

---

### Phase 5: Enhancements ✅ COMPLETE (May 12, 2026)

#### Visual Improvements ✅

Enhanced activity card design with:

- **Colored metric cards** for speed, elevation, heart rate, and time
- **Progress bars** for heart rate visualization
- **Better visual hierarchy** with Bootstrap color schemes
- **Icon system** for quick recognition of metrics
- **Rest time calculation** showing pauses during activities
- **Accessibility improvements** (ARIA labels for progress bars)

#### Active Wellbeing Integration ✅

Seamlessly convert Strava activities to Active Wellbeing sessions:

- **"Log to Active Wellbeing" button** on each activity
- **Automatic mapping**:
  - Bike rides → Cross cycle (Cardio)
  - Walks/Hikes → Outdoor Activity (Cardio)
  - Runs → Outdoor Activity (Cardio)
- **Smart scoring** based on calories, distance, or duration
- **Success/error feedback** with Toast notifications
- **Added "Outdoor Activity"** to wellbeing machines list

#### Route Mapping ✅

Interactive GPS route visualization:

- **Leaflet maps** with OpenStreetMap tiles
- **Route polylines** in Strava orange color
- **Start/finish markers** with popup labels
- **Auto-fit bounds** to show full route
- **Loading states** for better UX
- **Handles missing GPS data** gracefully
- **350px height** for optimal viewing

#### Analytics Dashboard ✅

Comprehensive statistics and insights:

- **Time range filters**: Last 7 days, month, year, or all time
- **Activity type filters**: View specific activity types
- **Summary cards**: Total activities, distance, time, calories
- **Weekly progress charts**: Distance and calories over 8 weeks
- **Activity type breakdown table**: Count, distance, time, calories by type
- **Insights section**:
  - Average per activity metrics
  - Total elevation with Mount Everest comparison
- **Navigation**: Easy access from Strava hub and activities page

#### Navigation Improvements ✅

Better user experience with:

- New `/strava/analytics` route
- "Analytics" button on Strava Connect page
- "Back" and "Analytics" buttons on Activities page
- "Back" and "Activities" buttons on Analytics page
- Consistent navigation patterns

---

## Summary of All Features

### Core Features (Phases 1-4)

- ✅ OAuth authentication with Strava
- ✅ Token management and refresh
- ✅ Activity syncing (incremental + full resync)
- ✅ Calorie estimation when API doesn't provide data
- ✅ Activity filtering by date and type
- ✅ Activity statistics and summaries
- ✅ Connection management (connect/disconnect)

### Enhancement Features (Phase 5)

- ✅ Enhanced visual design with colored cards
- ✅ Active Wellbeing integration
- ✅ Interactive route mapping
- ✅ Analytics dashboard with charts
- ✅ Weekly progress tracking
- ✅ Activity type breakdown

### Personal Records Features (Phase 6) ✅ COMPLETE

- ✅ Personal Records (PRs) tracking system
- ✅ 6 PR categories: Longest Distance, Most Elevation, Highest Avg Speed, Longest Duration, Most Calories, Max Speed
- ✅ PRs tracked by activity type (Ride, Run, Walk separately)
- ✅ Time scope filtering (all-time, this year, this month)
- ✅ Automatic PR detection during sync
- ✅ Toast notifications when records are broken
- ✅ PR badges on activity cards
- ✅ Dedicated PR viewing page (/strava/records)
- ✅ Enhanced iconography with activity-specific icons and colors
- ✅ Large, visually distinct icons throughout the UI
- ✅ Color-coded activity types and badges

---

### Phase 7: Future Enhancements (Nice-to-Haves)

#### 🔔 Webhooks (Real-time Updates)

**Priority:** High | **Estimated Time:** 4-6 hours

- Subscribe to Strava webhooks for real-time activity updates
- Automatically sync new activities as soon as they're uploaded to Strava
- No manual sync button needed
- Receive notifications for activity updates/deletions
- Backend endpoint required to receive webhook events
- Verification challenge handling

**Benefits:**

- Instant activity updates without user action
- Reduced API calls (no polling needed)
- Better user experience with real-time data

**Implementation Notes:**

- Requires publicly accessible webhook endpoint
- Need to handle webhook verification
- Store webhook subscription ID
- Process activity creation/update/delete events

#### 📊 Advanced PR Features

**Priority:** Medium | **Estimated Time:** 3-4 hours

- **Segment PRs:** Track best times on specific Strava segments
- **Route-specific PRs:** Best performance on recurring routes
- **PR history timeline:** Visual graph of how records improved over time
- **PR progression:** See all attempts at a specific distance (e.g., all 10k runs)
- **Achievement badges:** Milestones (e.g., "First 50km ride", "100 activities")
- **Social features:** Compare PRs with friends (if multi-user)

#### 🎯 Training & Goals

**Priority:** Medium | **Estimated Time:** 6-8 hours

- Set distance/time/calorie goals (weekly/monthly)
- Training plan integration
- Fitness level estimation based on performance trends
- Recovery recommendations based on activity intensity
- Training load monitoring (CTL/ATL/TSB)
- Goal progress tracking with visual indicators

#### 📈 Enhanced Analytics

**Priority:** Low | **Estimated Time:** 4-5 hours

- Year-over-year comparisons
- Monthly/yearly summary reports with visualizations
- Heatmap calendar (activity frequency)
- Performance trends (getting faster/stronger over time)
- Best day/time of week analysis
- Gear tracking and mileage (bike, shoes)
- Export data for external analysis

#### 🔗 Additional Integrations

**Priority:** Low | **Estimated Time:** Varies

- **Garmin Connect Direct:** Bypass Strava, connect directly to Garmin
- **Auto-log to Slimming World:** Automatically add exercise-earned syns based on calories
- **Weather data:** Show weather conditions during activities
- **Photo integration:** Display activity photos from Strava
- **Apple Health sync:** Sync data to Apple Health
- **Google Fit sync:** Sync data to Google Fit

#### 🏋️ Cross-Platform Activity View

**Priority:** Low | **Estimated Time:** 3-4 hours

- Unified view combining Strava activities + gym workouts + Active Wellbeing
- Weekly overview showing all fitness activities in one place
- Total weekly calories across all activity types
- Fitness streak tracking across all platforms

---

## File Structure

```
src/
├── services/
│   └── stravaService.js          # Strava API integration with PR functions
├── pages/
│   ├── StravaConnect.jsx         # Connection management & activity list
│   ├── StravaActivities.jsx      # Detailed activity view (legacy)
│   ├── StravaAnalytics.jsx       # Analytics dashboard
│   ├── StravaRecords.jsx         # Personal Records page
│   └── StravaCallback.jsx        # OAuth callback handler
├── components/
│   ├── StravaActivityCard.jsx    # Activity display with PR badges
│   ├── RouteMap.jsx              # GPS route visualization
│   └── Toast.jsx                 # Notification system
└── utils/
    ├── prCalculator.js           # PR calculation logic
    └── calorieEstimator.js       # Calorie estimation algorithms

supabase-config/
├── strava_schema.sql             # Main tables (connections, activities)
└── strava_personal_records_schema.sql  # PR tracking table
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
- **Phase 4 (Testing & Refinement)**: ✅ COMPLETE - 2-3 hours
  - ✅ OAuth flow, sync, filters tested
  - ✅ Calorie estimation implemented and validated
  - ✅ Full resync capability added
  - ✅ Unit display fixes (miles/km)
- **Phase 5 (Enhancements)**: ✅ COMPLETE - 6-8 hours
  - ✅ Enhanced visual design with colored cards (2 hours)
  - ✅ Active Wellbeing integration (2 hours)
  - ✅ Route mapping with Leaflet (2-3 hours)
  - ✅ Analytics dashboard with charts (2-3 hours)
- **Phase 6 (Personal Records)**: ✅ COMPLETE - 4-5 hours
  - ✅ Database schema for PR tracking (30 min)
  - ✅ PR calculator utility (1 hour)
  - ✅ Service integration with sync (1 hour)
  - ✅ PR viewing page (1.5 hours)
  - ✅ Activity card enhancements with badges (30 min)
  - ✅ Enhanced iconography system (1 hour)
- **Phase 7 (Future Enhancements)**: OPTIONAL - Varies by feature
  - Webhooks: 4-6 hours
  - Advanced PR features: 3-4 hours
  - Training & Goals: 6-8 hours
  - Enhanced Analytics: 4-5 hours

**Total Implementation Time:** ~20-25 hours (Phases 1-6 complete)
**With Future Enhancements:** +15-25 hours depending on features selected

---

## 🧹 Housekeeping & Best Practices

### 🧪 Testing Strategy

#### Manual Testing Checklist

- ✅ OAuth flow (connect → authorize → callback → redirect)
- ✅ Token refresh when expired
- ✅ Incremental sync (fetch only new activities)
- ✅ Full resync (reprocess all activities)
- ✅ Activity filtering (date ranges, activity types)
- ✅ Unit toggle (metric ↔ imperial)
- ✅ GPS route visualization for activities with GPS data
- ✅ PR detection and toast notifications
- ✅ Active Wellbeing logging integration
- ✅ Analytics calculations and chart rendering
- ✅ Disconnect and reconnect flow

#### Automated Testing (Future)

**Recommended Test Coverage:**

```javascript
// Unit Tests (vitest)
- prCalculator.js functions (checkForPersonalRecords, formatPRValue)
- calorieEstimator.js functions (estimate from heart rate, MET values)
- stravaService.js utility functions (formatDistance, formatDuration, formatSpeed)

// Integration Tests
- OAuth token exchange and refresh
- Activity sync with mock Strava API responses
- PR calculation with sample activity data
- Database queries (getPersonalRecords, getActivityStats)

// E2E Tests (Playwright - optional)
- Complete user flow: connect → sync → view activities → check PRs
```

**To implement tests:**

```bash
npm run test                    # Run unit tests
npm run test:coverage          # Generate coverage report
```

### 🔧 Code Quality & Maintenance

#### ESLint & Formatting

**Current Configuration:**

- ESLint configured in `eslint.config.js`
- Run checks before commits

```bash
npm run lint                   # Check for linting issues
npm run lint:fix              # Auto-fix issues
```

#### Console Log Cleanup

**Before Production Deploy:**

- Remove or comment out debug console.logs
- Keep only essential error logging
- Use environment-based logging:

```javascript
// Good: Environment-aware logging
if (import.meta.env.DEV) {
  console.log("🚀 Debug info:", data);
}

// Bad: Always-on debug logs
console.log("🚀 Debug info:", data);
```

**Quick cleanup script available:**

```bash
npm run security:console       # Find all console.log statements
```

#### Code Organization

**Standards Applied:**

- Service layer pattern (stravaService.js) for all API calls
- Utility functions separated (prCalculator.js, calorieEstimator.js)
- Reusable components (StravaActivityCard, RouteMap, Toast)
- Consistent icon and color functions
- Clear function naming with JSDoc comments

### 🤖 GitHub Automation & CI/CD

#### Security Scanning

**Available npm scripts:**

```bash
npm run security:check         # Full security audit
npm run security:scan          # Scan for exposed secrets
npm run security:audit         # npm audit vulnerabilities
npm run precommit              # Run all pre-commit checks
```

**What to check for:**

- Hardcoded API keys or tokens (should be in .env)
- Exposed Supabase credentials
- Console.log statements with sensitive data
- npm package vulnerabilities

#### GitHub Dependabot

**Recommended Setup:**

- Enable Dependabot for automatic dependency updates
- Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

#### GitHub Actions (Recommended)

**Suggested Workflows:**

1. **Pull Request Checks** (`.github/workflows/pr-checks.yml`):
   - Run ESLint
   - Run unit tests
   - Check for console.logs
   - Scan for secrets

2. **Dependency Security** (`.github/workflows/security.yml`):
   - Weekly npm audit
   - Dependabot auto-merge for patches

3. **Code Coverage** (optional):
   - Generate coverage reports
   - Comment coverage % on PRs

**Example PR check workflow:**

```yaml
name: PR Checks
on: [pull_request]
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run security:console
```

### 🔒 Security Considerations

#### Environment Variables

**Must be in .env (never commit):**

```bash
VITE_STRAVA_CLIENT_ID=your_client_id
VITE_STRAVA_CLIENT_SECRET=your_client_secret
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**Verify .gitignore includes:**

```
.env
.env.local
.env.production
```

#### Supabase Security

**RLS Policies Applied:**

- ✅ `strava_connections`: users can only access their own connections
- ✅ `strava_activities`: users can only access their own activities
- ⚠️ `strava_personal_records`: **Ensure RLS is enabled when schema is applied**

**To verify RLS:**

```sql
-- Run in Supabase SQL Editor
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename LIKE 'strava%';
```

All should show `rowsecurity = true`.

#### API Key Security

**Strava API Rate Limits:**

- 100 requests per 15 minutes
- 1000 requests per day

**Best Practices:**

- Never expose Strava tokens in console.logs
- Refresh tokens before expiry (implemented in stravaService.js)
- Handle rate limit errors gracefully
- Store tokens in Supabase (not localStorage)

### 📊 Performance & Monitoring

#### Database Performance

**Current Optimizations:**

- Indexed columns for fast queries (user_id, activity_date)
- Local activity caching (reduces API calls)
- Incremental sync (only fetch new activities)

**Future Optimizations:**

- Add database indexes if queries slow down
- Consider pagination for users with 1000+ activities
- Archive old activities (older than 2 years)

#### API Rate Limit Monitoring

**Current Implementation:**

- Manual sync to control API usage
- 24-hour auto-sync throttle

**Recommendations:**

- Log rate limit headers from Strava API
- Display remaining requests in UI (dev mode)
- Queue sync requests if approaching limits

#### Error Tracking

**Current:**

- Console errors logged
- User-facing error messages

**Future (Recommended):**

- Integrate Sentry or similar for production error tracking
- Log failed API calls for debugging
- Track sync failures and retry logic

### 🗓️ Regular Maintenance Tasks

#### Weekly

- [ ] Review npm audit warnings
- [ ] Check for failed syncs in logs
- [ ] Monitor Supabase storage usage

#### Monthly

- [ ] Update dependencies (via Dependabot PRs)
- [ ] Review and update documentation
- [ ] Clean up old debug console.logs
- [ ] Check Strava API for changes/deprecations

#### Quarterly

- [ ] Review RLS policies for security
- [ ] Analyze most common user errors
- [ ] Consider performance optimizations
- [ ] Update this document with new learnings

#### Before Major Releases

- [ ] Run full security audit: `npm run security:check`
- [ ] Review all console.log statements
- [ ] Test OAuth flow end-to-end
- [ ] Verify environment variables in production
- [ ] Test with multiple user accounts
- [ ] Ensure all database migrations applied
- [ ] Update user-facing documentation

### 📝 Documentation Maintenance

**Files to Keep Updated:**

- `docs/strava_integration_plan.md` (this file) - Overall roadmap
- `docs/strava_pr_tracking_design.md` - PR feature details
- `README.md` - User setup instructions
- JSDoc comments in code - Function documentation
- SQL schema comments - Database documentation

**When to Update:**

- After completing new features
- When fixing bugs (document the fix)
- When changing environment variables
- When adding new dependencies
- When discovering edge cases or gotchas

---

## Current Status & Next Steps

### ✅ Completed (Phases 1-6)

1. **Phase 1 Complete**: Strava API application set up & credentials validated
2. **Phase 2 Complete**: Backend implemented (database schema + Strava service with PR functions)
3. **Phase 3 Complete**: Frontend implemented (5 pages + components + navigation)
4. **Phase 4 Complete**: Full testing, calorie estimation, unit fixes
5. **Phase 5 Complete**: Enhanced visuals, Active Wellbeing, route mapping, analytics
6. **Phase 6 Complete**: Personal Records tracking with 6 categories + enhanced iconography

### 🚀 Ready to Use

**Database Setup:**

- ✅ `strava_schema.sql` - Already applied
- ⚠️ `strava_personal_records_schema.sql` - **Apply this to enable PR tracking**

**Features Available:**

- OAuth connection to Strava
- Activity syncing (incremental + full resync)
- Calorie estimation for missing data
- Activity filtering by date range and type
- Metric/Imperial unit toggle
- Enhanced activity cards with colored metrics
- GPS route visualization on interactive maps
- Log activities to Active Wellbeing system
- Analytics dashboard with weekly charts
- Personal Records page with 6 PR categories
- Automatic PR detection with toast notifications
- PR badges on activity cards
- Activity-specific icons with color coding

### 📋 To Enable PR Tracking

1. Open Supabase SQL Editor
2. Run `supabase-config/strava_personal_records_schema.sql`
3. Perform a sync (or full resync) of your activities
4. Watch for PR notifications! 🏆
5. Visit `/strava/records` to see your PRs

### 🎯 Optional Future Enhancements (Phase 7)

**High Priority:**

- **Webhooks:** Real-time activity sync without manual button clicks (4-6 hours)
- Automatically receive new activities as soon as uploaded to Strava

**Medium Priority:**

- **Advanced PR Features:** Segment PRs, route-specific records, PR history (3-4 hours)
- **Training & Goals:** Set weekly/monthly goals, track progress (6-8 hours)

**Low Priority:**

- **Enhanced Analytics:** Year-over-year comparisons, heatmaps (4-5 hours)
- **Additional Integrations:** Garmin Connect direct, weather data (varies)

**See Phase 7 section above for detailed descriptions of each enhancement.**

### 📚 Documentation & Resources

- **Main Schema**: `supabase-config/strava_schema.sql`
- **PR Schema**: `supabase-config/strava_personal_records_schema.sql`
- **PR Design Doc**: `docs/strava_pr_tracking_design.md`
- **Strava API Docs**: https://developers.strava.com/
- **Rate Limits**: https://developers.strava.com/docs/rate-limits/
- **Webhook Events**: https://developers.strava.com/docs/webhooks/
