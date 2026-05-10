# Strava Integration Plan

## Overview

This document outlines the plan for integrating Strava API to track walks, bike rides, and other fitness activities in the WeeGym application.

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

### Phase 2: Backend Implementation (DEVELOPMENT)

**What needs to be built:**

#### 2.1 Database Schema

- Create `strava_connections` table in Supabase:

  ```sql
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - athlete_id (bigint, Strava athlete ID)
  - access_token (text, encrypted)
  - refresh_token (text, encrypted)
  - expires_at (timestamp)
  - athlete_data (jsonb, stores athlete profile)
  - connected_at (timestamp)
  - last_sync (timestamp)
  ```

- Create `strava_activities` table:
  ```sql
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - strava_id (bigint, Strava activity ID)
  - name (text)
  - type (text, e.g., 'Walk', 'Ride', 'Run')
  - distance (decimal, meters)
  - moving_time (integer, seconds)
  - elapsed_time (integer, seconds)
  - total_elevation_gain (decimal, meters)
  - start_date (timestamp)
  - calories (decimal)
  - average_speed (decimal)
  - max_speed (decimal)
  - average_heartrate (decimal)
  - max_heartrate (decimal)
  - activity_data (jsonb, full activity data)
  - synced_at (timestamp)
  ```

#### 2.2 Strava Service (`src/services/stravaService.js`)

- **Authentication functions**:
  - `getAuthorizationUrl()` - Generate OAuth URL
  - `exchangeCodeForToken(code)` - Exchange auth code for tokens
  - `refreshAccessToken(refreshToken)` - Refresh expired tokens
  - `disconnectStrava(userId)` - Remove connection

- **Activity functions**:
  - `getAthleteActivities(accessToken, page, perPage)` - Fetch activities
  - `getActivityById(accessToken, activityId)` - Get detailed activity
  - `syncActivities(userId)` - Sync activities to database
  - `getLocalActivities(userId, filters)` - Get activities from DB

- **Webhook functions** (optional, Phase 3):
  - `createWebhookSubscription()` - Subscribe to activity updates
  - `handleWebhookEvent(event)` - Process incoming webhooks

#### 2.3 Database Service Updates

- Add Strava-specific database operations
- Token encryption/decryption helpers
- Activity sync logic with deduplication

---

### Phase 3: Frontend Implementation (DEVELOPMENT)

#### 3.1 Strava Connection Page (`src/pages/StravaConnect.jsx`)

- Display connection status
- "Connect to Strava" button
- Show connected athlete info
- "Disconnect" option
- Last sync timestamp
- Sync status indicators

#### 3.2 Strava Activities Page (`src/pages/StravaActivities.jsx`)

- List of synced activities
- Filter by type (Walk, Ride, Run, etc.)
- Date range filter
- Activity cards showing:
  - Activity name
  - Type icon
  - Distance
  - Duration
  - Elevation
  - Calories
  - Date
- Link to view on Strava
- Manual sync button
- Summary statistics (total distance, time, activities)

#### 3.3 Strava Callback Handler (`src/pages/StravaCallback.jsx`)

- Handle OAuth redirect
- Exchange code for tokens
- Save to database
- Redirect to Strava connection page
- Error handling

#### 3.4 Navigation Updates

- Add "Strava" menu item in navigation
- Badge for new/unsynced activities (optional)

#### 3.5 Dashboard Integration (Optional)

- Recent Strava activities widget
- Weekly distance summary
- Activity streak counter

---

### Phase 4: Testing & Refinement

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

## Timeline Estimate

- **Phase 1 (User Setup)**: 15 minutes
- **Phase 2 (Backend)**: 3-4 hours
- **Phase 3 (Frontend)**: 4-5 hours
- **Phase 4 (Testing)**: 1-2 hours
- **Phase 5 (Optional)**: Variable

**Total Core Implementation**: ~8-12 hours

---

## Next Steps

1. **You**: Complete Phase 1 (Strava API application setup)
2. **Share**: Provide the Client ID and Client Secret
3. **Development**: We'll implement Phases 2-4 together
4. **Testing**: Test the OAuth flow and activity sync
5. **Deploy**: Update production environment variables
6. **Enjoy**: Track your walks and rides automatically!

---

## Resources

- **Strava API Documentation**: https://developers.strava.com/docs/
- **OAuth Guide**: https://developers.strava.com/docs/authentication/
- **API Playground**: https://developers.strava.com/playground/
- **Rate Limits**: https://developers.strava.com/docs/rate-limits/
- **Webhook Events**: https://developers.strava.com/docs/webhooks/

---

## Questions?

When you're ready to proceed, let me know and we can start with Phase 2 implementation!
