# Garmin Integration - Quick Start Guide

**Status**: Mock Data Ready - Can Start Testing NOW! 🚀  
**Date**: May 24, 2026

## ✨ What's Ready

All foundational code is complete and ready to test with **mock data** (no Garmin API credentials needed yet):

- ✅ Database schema designed
- ✅ Backend service with mock mode
- ✅ Full utility library
- ✅ 3 UI components built
- ✅ ~2,000 lines of code

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Deploy Database Schema

In your **Supabase SQL Editor**, run:

```sql
-- File: supabase-config/add-garmin-step-tracking.sql
-- Copy/paste the entire file contents
```

This creates 3 tables:

- `garmin_connections`
- `daily_steps`
- `weekly_step_summaries`

### Step 2: Add Routes to Your App

In your main router file (probably `src/App.jsx` or similar):

```jsx
import GarminConnect from './pages/GarminConnect';
import GarminCallback from './pages/GarminCallback';
import StepTracker from './pages/StepTracker';

// Add these routes:
<Route
  path="/garmin"
  element={
    <ProtectedRoute>
      <GarminConnect />
    </ProtectedRoute>
  }
/>
<Route
  path="/garmin/callback"
  element={
    <ProtectedRoute>
      <GarminCallback />
    </ProtectedRoute>
  }
/>
<Route
  path="/steps"
  element={
    <ProtectedRoute>
      <StepTracker />
    </ProtectedRoute>
  }
/>
```

### Step 3: Add Navigation Link

In your navigation component:

```jsx
<Nav.Link href="/steps">
  <i className="bi bi-footprints me-1"></i>
  Step Tracker
</Nav.Link>
```

### Step 4: Test It!

1. Run your app: `npm run dev`
2. Navigate to `/garmin`
3. Click "Connect to Garmin"
4. See mock data appear! ✨

**Note**: You'll see a banner saying "Development Mode" - this is normal. The app is using realistic mock data until you get Garmin API credentials.

---

## 📱 Testing Checklist

Once you've added the routes, test these features:

- [ ] Navigate to `/garmin` page
- [ ] See "Connect to Garmin" button
- [ ] Click connect (creates mock connection)
- [ ] View today's step count (mock data)
- [ ] See weekly summaries table
- [ ] Click "Sync New" button
- [ ] Click "Full Resync" button
- [ ] Navigate to `/steps` page
- [ ] See today's large stat cards
- [ ] View streak counter with emoji
- [ ] Check quick stats sidebar
- [ ] Toggle date range (7/30/90 days)
- [ ] View daily breakdown table
- [ ] Test "Disconnect" (removes mock data)
- [ ] Reconnect to regenerate mock data

---

## 🎨 Optional: Add to Dashboard

Want step count on your dashboard? Add this to `Dashboard.jsx`:

```jsx
import { useState, useEffect } from "react";
import { getConnection, getTodaySteps } from "../services/garminService";
import {
  formatNumber,
  getProgressPercentage,
  getProgressColor,
} from "../utils/stepCalculator";

// In your Dashboard component:
const [todaySteps, setTodaySteps] = useState(null);

useEffect(() => {
  async function loadSteps() {
    const conn = await getConnection(user.id);
    if (conn) {
      const steps = await getTodaySteps(user.id);
      setTodaySteps(steps);
    }
  }
  loadSteps();
}, [user]);

// Then in your stats grid, add:
{
  todaySteps && (
    <div className="col-6 col-md-4">
      <div className="card text-center">
        <div className="card-body">
          <i className="bi bi-footprints text-success fs-1"></i>
          <h3 className="h2 mb-0">{formatNumber(todaySteps.total_steps)}</h3>
          <p className="text-muted small mb-0">Steps Today</p>

          {/* Mini progress bar */}
          <div className="progress mt-2" style={{ height: "4px" }}>
            <div
              className={`progress-bar ${getProgressColor(todaySteps.total_steps, todaySteps.goal_steps)}`}
              style={{
                width: `${getProgressPercentage(todaySteps.total_steps, todaySteps.goal_steps)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔑 When You Get Garmin API Credentials

### 1. Install OAuth Library

```bash
npm install oauth-1.0a
```

### 2. Add Environment Variables

Create/update `.env`:

```bash
VITE_GARMIN_CONSUMER_KEY=your_consumer_key_here
VITE_GARMIN_CONSUMER_SECRET=your_consumer_secret_here
VITE_GARMIN_REDIRECT_URI=http://localhost:5173/garmin/callback
```

### 3. Complete OAuth Implementation

In `src/services/garminService.js`, complete the TODOs:

- Implement `getAuthorizationUrl()` with OAuth 1.0a library
- Implement `exchangeTokens()` with real API call
- Implement Garmin API call in `syncDailySteps()`

Garmin endpoints:

```
Request Token:  https://connectapi.garmin.com/oauth-service/oauth/request_token
Authorization:  https://connect.garmin.com/oauthConfirm
Access Token:   https://connectapi.garmin.com/oauth-service/oauth/access_token
Wellness API:   https://apis.garmin.com/wellness-api/rest/dailies
```

### 4. Test Real Connection

Mock mode will automatically disable when environment variables are set. Test the full OAuth flow with your Garmin account!

---

## 🐛 Troubleshooting

### "Garmin Not Connected" message

- Make sure you've run the database migration
- Check that routes are properly configured
- Verify `ProtectedRoute` wraps the components

### Mock data not appearing

- Check browser console for errors
- Ensure Supabase client is configured
- Verify user is logged in

### Components not rendering

- Check all imports are correct
- Ensure Toast component exists (it should from Strava integration)
- Verify all utility functions are imported

---

## 📚 Code Structure

```
src/
├── services/
│   └── garminService.js          # Backend API (mock + real)
├── utils/
│   └── stepCalculator.js         # Calculations & formatting
├── pages/
│   ├── GarminConnect.jsx         # Connection management
│   ├── GarminCallback.jsx        # OAuth handler
│   └── StepTracker.jsx           # Main tracking UI
└── components/
    └── Toast.jsx                 # Used for notifications

supabase-config/
└── add-garmin-step-tracking.sql  # Database schema
```

---

## 🎯 Next Features (Optional)

After you have the basics working, consider adding:

1. **Circular Progress Widget** (like Apple Watch rings)
2. **Monthly Calendar Heatmap** (shows activity patterns)
3. **Chart.js Visualizations** (step trends over time)
4. **Achievement Badges** (unlock as you hit milestones)
5. **Calorie Tracker Integration** (steps → calories)
6. **Settings Page Entry** (change step goal)

All the utility functions for these features already exist in `stepCalculator.js`!

---

## ❓ Questions?

Check the detailed docs:

- `docs/garmin-step-counter.md` - Full implementation plan
- `docs/GARMIN_SETUP_PROGRESS.md` - What was completed today

---

**Happy Testing!** 🎉

Don't forget to take Buster for extra walks to boost those step counts! 🐕🎾
