# Garmin Step Counter Integration Plan

## Overview

This document outlines the implementation plan for adding daily step counter functionality to WeeGym using the Garmin Connect API. While Strava is excellent for activity tracking, it does not provide daily step count data. Garmin Connect API offers comprehensive wellness data including steps, heart rate, sleep, and more.

---

## 📊 Why Garmin API for Step Data?

| Feature                | Garmin API    | Strava API   |
| ---------------------- | ------------- | ------------ |
| **Daily Steps**        | ✅ Yes        | ❌ No        |
| **Resting Heart Rate** | ✅ Yes        | ❌ No        |
| **Sleep Data**         | ✅ Yes        | ❌ No        |
| **Body Battery**       | ✅ Yes        | ❌ No        |
| **Activities**         | ✅ Yes        | ✅ Yes       |
| **Setup Time**         | ⚠️ Days/weeks | ✅ Immediate |
| **Runs Parallel**      | ✅ Yes        | ✅ Yes       |

**Recommendation**: Implement Garmin for wellness data (steps, sleep, heart rate) while keeping Strava for activity tracking. They complement each other perfectly!

---

## Phase 1: Garmin API Setup

⏱️ **Timeline**: 1-2 weeks (mostly waiting for approval)

### 1.1 Developer Account Registration

1. **Apply for Garmin Developer Account**
   - Visit [developer.garmin.com](https://developer.garmin.com)
   - Create developer account
   - Complete application form

2. **Register WeeGym Application**
   - Application name: "WeeGym"
   - Description: Personal fitness tracking application
   - OAuth callback URL: Your deployed URL + `/garmin/callback`

3. **Request API Access**
   - Request access to **Health API**
   - Includes: Daily steps, heart rate, sleep, stress, body battery
   - Provide use case: Personal wellness tracking integration

4. **Wait for Approval**
   - Can take several days to weeks
   - Garmin will email when approved
   - You'll receive: Client ID, Client Secret

### 1.2 OAuth 1.0a Implementation

⚠️ **Note**: Garmin uses OAuth 1.0a (more complex than Strava's OAuth 2.0)

**Required Environment Variables** (`.env`):

```bash
VITE_GARMIN_CONSUMER_KEY=your_consumer_key
VITE_GARMIN_CONSUMER_SECRET=your_consumer_secret
VITE_GARMIN_REDIRECT_URI=http://localhost:3000/garmin/callback
```

**Create Service File**: `src/services/garminService.js`

Key functions to implement:

- `getAuthorizationUrl()` - Generate OAuth URL
- `exchangeCodeForToken(code)` - Get access token
- `getValidAccessToken(userId)` - Ensure token is valid
- `disconnectGarmin(userId)` - Remove connection
- `syncDailySteps(userId, options)` - Fetch step data
- `getDailySteps(userId, dateRange)` - Query from database
- `getWeeklySummary(userId)` - Aggregated statistics

---

## Phase 2: Database Schema

### 2.1 Garmin Connections Table

```sql
-- Store Garmin OAuth connection details
CREATE TABLE garmin_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  access_token_secret TEXT NOT NULL,
  garmin_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE garmin_connections ENABLE ROW LEVEL SECURITY;

-- User can only access their own connections
CREATE POLICY "Users can manage own Garmin connections"
  ON garmin_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_garmin_connections_user_id ON garmin_connections(user_id);
```

### 2.2 Daily Steps Table

```sql
-- Store daily step count data
CREATE TABLE daily_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_steps INTEGER NOT NULL,
  goal_steps INTEGER DEFAULT 10000,
  distance_meters INTEGER,
  active_minutes INTEGER,
  calories_burned INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can manage own step data"
  ON daily_steps
  FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_daily_steps_user_date ON daily_steps(user_id, date DESC);
CREATE INDEX idx_daily_steps_date ON daily_steps(date DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_steps_updated_at
  BEFORE UPDATE ON daily_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Weekly Step Summaries Table

```sql
-- Pre-aggregated weekly statistics for performance
CREATE TABLE weekly_step_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_steps INTEGER NOT NULL,
  avg_daily_steps INTEGER NOT NULL,
  days_goal_met INTEGER DEFAULT 0,
  best_day_steps INTEGER,
  best_day_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE weekly_step_summaries ENABLE ROW LEVEL SECURITY;

-- User can only access their own summaries
CREATE POLICY "Users can manage own weekly summaries"
  ON weekly_step_summaries
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_weekly_summaries_user_week ON weekly_step_summaries(user_id, week_start DESC);
```

### 2.4 Database Migration File

**Create**: `supabase-config/add-garmin-step-tracking.sql`

Combine all above SQL into a single migration file for easy deployment.

---

## Phase 3: Data Sync Service

### 3.1 Garmin API Integration

**File**: `src/services/garminService.js`

```javascript
import { supabase } from "../lib/supabaseClient";

// Garmin API Configuration
const GARMIN_API_BASE = "https://apis.garmin.com";
const GARMIN_WELLNESS_API = "/wellness-api/rest";

const GARMIN_CONFIG = {
  consumerKey: import.meta.env.VITE_GARMIN_CONSUMER_KEY,
  consumerSecret: import.meta.env.VITE_GARMIN_CONSUMER_SECRET,
  redirectUri: import.meta.env.VITE_GARMIN_REDIRECT_URI,
};

// OAuth 1.0a implementation
// Token exchange
// Sync functions
// Data retrieval functions
```

### 3.2 Sync Strategy

#### Incremental Sync (Default)

- Fetch only data since `last_sync` timestamp
- Updates `last_sync` after successful sync
- Efficient for daily use

#### Full Resync Option

- Ignores `last_sync`, fetches all historical data
- Useful when:
  - Processing logic changes
  - User reports missing data
  - Initial connection setup
- Provide clear UI button with confirmation dialog

#### Auto-Sync Triggers

- On app open (if last sync > 12 hours ago)
- Daily at midnight (via webhook or scheduled function)
- Manual sync button always available
- After connecting Garmin account (full sync)

#### Sync Function Structure

```javascript
async function syncDailySteps(userId, options = {}) {
  const { after, forceFullSync = false } = options;

  // 1. Get valid access token
  // 2. Determine sync start date
  // 3. Call Garmin API for daily summaries
  // 4. Process and store in database
  // 5. Update last_sync timestamp
  // 6. Calculate weekly summaries
  // 7. Return sync statistics
}
```

---

## Phase 4: UI Components & Pages

### 4.1 Dashboard Integration

**Update**: `src/pages/Dashboard.jsx`

Add step counter card to the stats grid (alongside existing workout, wellbeing, and Strava cards):

```jsx
{
  garminConnected && (
    <div className="col-6 col-md-4">
      <div className="card text-center">
        <div className="card-body">
          <i className="bi bi-footprints text-success fs-1"></i>
          <h3 className="h2 mb-0">
            {todaySteps ? todaySteps.toLocaleString() : "--"}
          </h3>
          <p className="text-muted small mb-0">Steps Today</p>

          {/* Mini progress bar */}
          <div className="progress mt-2" style={{ height: "4px" }}>
            <div
              className={`progress-bar ${getStepProgressColor(todaySteps, stepGoal)}`}
              style={{
                width: `${Math.min((todaySteps / stepGoal) * 100, 100)}%`,
              }}
            ></div>
          </div>

          {/* Goal percentage */}
          <small className="text-muted">
            {Math.round((todaySteps / stepGoal) * 100)}% of goal
          </small>
        </div>
      </div>
    </div>
  );
}
```

**Quick access link** in features section:

```jsx
<Link
  to="/steps"
  className="list-group-item list-group-item-action d-flex align-items-center py-2"
>
  <i className="bi bi-footprints text-success me-3 fs-5"></i>
  <div className="flex-grow-1">
    <div className="fw-medium small">
      Step Tracker
      {garminConnected && (
        <i
          className="bi bi-check-circle-fill text-success ms-2"
          style={{ fontSize: "0.75rem" }}
        ></i>
      )}
    </div>
    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
      {garminConnected
        ? `${todaySteps?.toLocaleString()} steps today`
        : "Connect Garmin to track"}
    </div>
  </div>
  <i className="bi bi-chevron-right text-muted"></i>
</Link>
```

### 4.2 Step Tracker Page

**Create**: `src/pages/StepTracker.jsx`

#### Top Section - Today's Progress (Hero)

```jsx
{
  /* Large Circular Progress Display */
}
<div className="card mb-4 bg-gradient-primary text-white">
  <div className="card-body text-center py-5">
    <h2 className="h3 mb-4">
      <i className="bi bi-footprints me-2"></i>
      Steps Today
    </h2>

    {/* Circular Progress Dial */}
    <div className="position-relative d-inline-block mb-3">
      <CircularProgress
        value={todaySteps}
        max={stepGoal}
        size={200}
        strokeWidth={15}
      />
      <div className="position-absolute top-50 start-50 translate-middle text-center">
        <h3 className="h1 mb-0 fw-bold">{todaySteps.toLocaleString()}</h3>
        <small>of {stepGoal.toLocaleString()}</small>
      </div>
    </div>

    {/* Achievement Badge */}
    {todaySteps >= stepGoal && (
      <div className="badge bg-warning text-dark fs-6 mb-3">
        <i className="bi bi-trophy-fill me-1"></i>
        Goal Achieved! 🎉
      </div>
    )}

    {/* Stats Row */}
    <div className="row g-3 mt-3 text-center">
      <div className="col-4">
        <div className="small opacity-75">Distance</div>
        <div className="fw-bold">
          {formatDistance(todayData.distance_meters)}
        </div>
      </div>
      <div className="col-4">
        <div className="small opacity-75">Active Time</div>
        <div className="fw-bold">{todayData.active_minutes} min</div>
      </div>
      <div className="col-4">
        <div className="small opacity-75">Calories</div>
        <div className="fw-bold">{todayData.calories_burned}</div>
      </div>
    </div>
  </div>
</div>;
```

#### Middle Section - 7-Day Trend

```jsx
<div className="card mb-4">
  <div className="card-body">
    <h3 className="h5 mb-3">
      <i className="bi bi-graph-up me-2"></i>
      7-Day Trend
    </h3>

    {weeklyData.map((day) => (
      <div key={day.date} className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div>
            <span className="fw-medium">{formatDay(day.date)}</span>
            {day.total_steps >= day.goal_steps && (
              <i className="bi bi-check-circle-fill text-success ms-2"></i>
            )}
          </div>
          <span
            className={`badge ${getStepBadgeColor(day.total_steps, day.goal_steps)}`}
          >
            {day.total_steps.toLocaleString()}
          </span>
        </div>

        {/* Horizontal bar */}
        <div className="progress" style={{ height: "20px" }}>
          <div
            className={`progress-bar ${getStepProgressColor(day.total_steps, day.goal_steps)}`}
            style={{
              width: `${Math.min((day.total_steps / day.goal_steps) * 100, 100)}%`,
            }}
            role="progressbar"
          >
            {Math.round((day.total_steps / day.goal_steps) * 100)}%
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

#### Bottom Section - Statistics Cards

```jsx
<div className="row g-3 mb-4">
  {/* This Week */}
  <div className="col-md-4">
    <div className="card h-100">
      <div className="card-body text-center">
        <i className="bi bi-calendar-week text-primary fs-1"></i>
        <h4 className="h3 mt-2 mb-0">
          {weeklySummary.total_steps.toLocaleString()}
        </h4>
        <p className="text-muted small mb-0">Total This Week</p>
        <div className="mt-2">
          <small className="text-muted">
            Avg: {weeklySummary.avg_daily_steps.toLocaleString()}/day
          </small>
        </div>
      </div>
    </div>
  </div>

  {/* Best Day */}
  <div className="col-md-4">
    <div className="card h-100">
      <div className="card-body text-center">
        <i className="bi bi-trophy-fill text-warning fs-1"></i>
        <h4 className="h3 mt-2 mb-0">
          {weeklySummary.best_day_steps.toLocaleString()}
        </h4>
        <p className="text-muted small mb-0">Best Day</p>
        <div className="mt-2">
          <small className="text-muted">
            {formatDate(weeklySummary.best_day_date)}
          </small>
        </div>
      </div>
    </div>
  </div>

  {/* Goal Streak */}
  <div className="col-md-4">
    <div className="card h-100">
      <div className="card-body text-center">
        <i className="bi bi-fire text-danger fs-1"></i>
        <h4 className="h3 mt-2 mb-0">{currentStreak}</h4>
        <p className="text-muted small mb-0">Day Streak</p>
        <div className="mt-2">
          <small className="text-muted">
            {weeklySummary.days_goal_met}/7 goals met
          </small>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 4.3 Circular Progress Component

**Create**: `src/components/CircularProgress.jsx`

```jsx
function CircularProgress({ value, max, size = 200, strokeWidth = 15 }) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return "#ffc107"; // Gold
    if (percentage >= 80) return "#28a745"; // Green
    if (percentage >= 50) return "#fd7e14"; // Orange
    return "#dc3545"; // Red
  };

  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e9ecef"
        strokeWidth={strokeWidth}
      />

      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: "stroke-dashoffset 0.5s ease",
        }}
      />
    </svg>
  );
}
```

### 4.4 Garmin Connect Page

**Create**: `src/pages/GarminConnect.jsx`

Similar structure to `StravaConnect.jsx`:

- Connection status display
- Connect/Disconnect buttons
- Sync controls (Sync New / Full Resync)
- Last sync timestamp
- Sync statistics
- Connection troubleshooting tips

### 4.5 Settings Integration

**Update**: `src/pages/Settings.jsx`

Add Garmin section:

```jsx
{
  /* Garmin Settings */
}
<div className="card mb-3">
  <div className="card-body">
    <h3 className="h5 mb-3">
      <i className="bi bi-smartwatch me-2"></i>
      Garmin Connect
    </h3>

    {garminConnected ? (
      <>
        <div className="alert alert-success">
          <i className="bi bi-check-circle-fill me-2"></i>
          Connected to Garmin
        </div>

        {/* Daily Step Goal */}
        <div className="mb-3">
          <label className="form-label">Daily Step Goal</label>
          <input
            type="number"
            className="form-control"
            value={stepGoal}
            onChange={(e) => updateStepGoal(e.target.value)}
            min="1000"
            max="50000"
            step="500"
          />
          <small className="text-muted">
            Typical goals: 7,500 (moderate), 10,000 (active), 15,000 (very
            active)
          </small>
        </div>

        {/* Auto-sync Setting */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="autoSyncSteps"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
          />
          <label className="form-check-label" for="autoSyncSteps">
            Auto-sync daily steps
          </label>
        </div>

        <button className="btn btn-outline-danger" onClick={handleDisconnect}>
          Disconnect Garmin
        </button>
      </>
    ) : (
      <>
        <p className="text-muted mb-3">
          Connect your Garmin account to track daily steps, distance, and
          activity.
        </p>
        <button className="btn btn-primary" onClick={handleConnect}>
          <i className="bi bi-plug me-2"></i>
          Connect Garmin
        </button>
      </>
    )}
  </div>
</div>;
```

### 4.6 Navigation Update

**Update**: `src/App.jsx`

Add to navigation items:

```javascript
const navItems = [
  { path: "/", icon: "bi-house-door", label: "Home" },
  { path: "/workout", icon: "bi-play-circle", label: "Workout" },
  { path: "/wellbeing", icon: "bi-activity", label: "Active Wellbeing" },
  { path: "/calories", icon: "bi-star-fill", label: "Slimming World" },
  { path: "/strava", icon: "bi-bicycle", label: "Strava" },
  { path: "/steps", icon: "bi-footprints", label: "Steps" }, // NEW
  { path: "/programme", icon: "bi-journal-text", label: "Programme" },
  { path: "/settings", icon: "bi-gear", label: "Settings" },
];
```

Add route:

```jsx
<Route
  path="/steps"
  element={
    <ProtectedRoute>
      <StepTracker />
    </ProtectedRoute>
  }
/>
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
```

---

## Phase 5: Advanced Features

### 5.1 Integration with Existing Features

#### Calorie Tracker Integration

- Steps burn approximately 40-50 calories per 1,000 steps
- Add "Steps Calories" to daily calorie tracker
- Option to automatically add step calories to daily totals
- Useful for Slimming World tracking

```jsx
// In CalorieTracker.jsx
const stepCalories = Math.round((todaySteps / 1000) * 45);

<div className="card mb-3">
  <div className="card-body">
    <div className="d-flex justify-content-between">
      <span>Calories from Steps</span>
      <span className="text-success">
        <i className="bi bi-footprints me-1"></i>
        {stepCalories} cal
      </span>
    </div>
    <small className="text-muted">
      {todaySteps.toLocaleString()} steps × ~45 cal/1000
    </small>
  </div>
</div>;
```

#### Active Wellbeing Correlation

- Compare step counts with wellbeing scores
- Show insights: "Higher step days correlate with higher wellbeing scores"
- Suggest optimal step ranges for wellbeing

#### Strava Activity Comparison

- If same-day Strava walk/run activity exists, show step comparison
- Validate data consistency
- Helpful for understanding step-to-distance conversion

### 5.2 Gamification & Achievements

#### Achievement Badges

```javascript
const STEP_ACHIEVEMENTS = {
  FIRST_10K: {
    id: "first_10k",
    title: "First 10K",
    description: "Reached 10,000 steps in a day",
    icon: "🎯",
  },
  WEEKLY_STREAK: {
    id: "weekly_streak",
    title: "Week Warrior",
    description: "Met goal 7 days in a row",
    icon: "🔥",
  },
  MONTHLY_MASTER: {
    id: "monthly_master",
    title: "Monthly Master",
    description: "Met goal 30 days in a row",
    icon: "👑",
  },
  MARATHON_DAY: {
    id: "marathon_day",
    title: "Marathon Day",
    description: "Walked 20,000+ steps in one day",
    icon: "🏃",
  },
  HUNDRED_K_WEEK: {
    id: "hundred_k_week",
    title: "100K Week",
    description: "Walked 100,000+ steps in one week",
    icon: "💯",
  },
};
```

**Display achievements**:

- Modal popup when earned
- Achievements page showing locked/unlocked
- Share achievements (future feature)

#### Personal Records

- Most steps in a day
- Longest goal streak
- Best week
- Best month
- Most active day of week

### 5.3 Data Visualizations

#### Monthly Calendar Heatmap

```jsx
<div className="card mb-4">
  <div className="card-body">
    <h3 className="h5 mb-3">Monthly Overview</h3>

    <div className="calendar-grid">
      {monthDays.map((day) => (
        <div
          key={day.date}
          className={`calendar-day ${getHeatmapColor(day.steps, stepGoal)}`}
          title={`${day.date}: ${day.steps.toLocaleString()} steps`}
        >
          <div className="day-number">{day.dayOfMonth}</div>
          <div className="day-indicator">{day.steps >= stepGoal && "✓"}</div>
        </div>
      ))}
    </div>

    {/* Legend */}
    <div className="mt-3 d-flex justify-content-center gap-2">
      <span className="badge bg-danger">0-50%</span>
      <span className="badge bg-warning">50-80%</span>
      <span className="badge bg-success">80-99%</span>
      <span className="badge bg-primary">100%+</span>
    </div>
  </div>
</div>
```

#### Line Chart (Historical Trend)

Use **Chart.js** or **Recharts** for advanced visualizations:

```bash
npm install chart.js react-chartjs-2
# or
npm install recharts
```

```jsx
import { Line } from "react-chartjs-2";

<div className="card mb-4">
  <div className="card-body">
    <h3 className="h5 mb-3">30-Day Trend</h3>

    <Line
      data={{
        labels: last30Days.map((d) => formatDate(d.date)),
        datasets: [
          {
            label: "Daily Steps",
            data: last30Days.map((d) => d.total_steps),
            borderColor: "#0d6efd",
            backgroundColor: "rgba(13, 110, 253, 0.1)",
            tension: 0.4,
          },
          {
            label: "Goal",
            data: Array(30).fill(stepGoal),
            borderColor: "#28a745",
            borderDash: [5, 5],
            pointRadius: 0,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y.toLocaleString()} steps`,
            },
          },
        },
      }}
    />
  </div>
</div>;
```

### 5.4 Notifications & Reminders

**Future Enhancement** (requires notification permission):

- **Daily Progress Check** (5 PM): "You're at 6,234 steps - 3,766 more to reach your goal!"
- **Goal Achieved** (when reached): "🎉 Congrats! You hit your 10,000 step goal!"
- **Streak Alert** (midnight if goal not met): "Only 800 steps to keep your 5-day streak alive!"
- **Weekly Summary** (Sunday evening): "Great week! You averaged 9,567 steps/day"

### 5.5 Data Export

Allow users to export their step data:

```javascript
function exportStepData(startDate, endDate, format = 'csv') {
  // Fetch data
  const data = await getDailySteps(userId, { startDate, endDate });

  if (format === 'csv') {
    const csv = convertToCSV(data);
    downloadFile(csv, 'weegym-steps.csv', 'text/csv');
  } else if (format === 'json') {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, 'weegym-steps.json', 'application/json');
  }
}
```

---

## Recommended Data Visualization Components

### 1. **Circular Progress Dial** ⭐ (Primary - Today's View)

- **Use Case**: Today's step progress
- **Why**: Most intuitive for daily goals, similar to Fitbit/Apple Watch
- **Visual Impact**: High - clear at-a-glance status
- **Implementation**: Custom SVG component or library like `react-circular-progressbar`

### 2. **Horizontal Bar Chart** (7-Day Trend)

- **Use Case**: Weekly comparison
- **Why**: Easy to compare days, mobile-friendly
- **Visual Impact**: Medium - shows patterns quickly
- **Implementation**: Bootstrap progress bars with custom styling

### 3. **Line Graph** (Historical Trends)

- **Use Case**: 30-day, 90-day, yearly trends
- **Why**: Best for identifying long-term patterns
- **Visual Impact**: High - professional analytics feel
- **Implementation**: Chart.js or Recharts

### 4. **Calendar Heatmap** (Monthly Overview)

- **Use Case**: Month-at-a-glance achievement view
- **Why**: Quickly identify active/inactive periods
- **Visual Impact**: High - visual storytelling
- **Implementation**: Custom CSS grid with color coding

### 5. **Small Progress Bar** (Dashboard Widget)

- **Use Case**: Quick reference on main dashboard
- **Why**: Compact, doesn't overwhelm homepage
- **Visual Impact**: Low - but effective for overview
- **Implementation**: Simple Bootstrap progress bar

### Color Scheme Recommendations

```css
/* Step achievement color scale */
.step-level-critical {
  background-color: #dc3545;
} /* Red: < 5,000 (0-49%) */
.step-level-low {
  background-color: #ffc107;
} /* Yellow: 5,000-8,000 (50-79%) */
.step-level-good {
  background-color: #28a745;
} /* Green: 8,000-10,000 (80-99%) */
.step-level-excellent {
  background-color: #0d6efd;
} /* Blue: 10,000-12,000 (100-119%) */
.step-level-amazing {
  background-color: #6f42c1;
} /* Purple: 12,000+ (120%+) */
```

---

## Implementation Timeline & Priority

### ✅ **Phase 1: Start Now** (Week 1)

1. **Submit Garmin developer application** - Start immediately (approval takes time)
2. **Create database schema** - Can do while waiting for approval
3. **Design UI mockups** - Plan component layouts
4. **Add navigation items** - Placeholder pages

### 🏗️ **Phase 2: Foundation** (Week 2-3)

1. **Build UI components with mock data**
   - StepTracker page with sample data
   - CircularProgress component
   - Dashboard integration (hidden until Garmin connected)
2. **Set up database tables** in Supabase
3. **Create placeholder service** with mock functions

### 🔌 **Phase 3: API Integration** (Week 3-4, after approval)

1. **Implement garminService.js** with OAuth 1.0a
2. **Connect real API** to existing UI components
3. **Test sync functionality**
4. **Handle edge cases** (token refresh, errors, rate limits)

### 🎨 **Phase 4: Polish & Features** (Week 5-6)

1. **Add 7-day trend visualization**
2. **Implement weekly summaries**
3. **Create achievement system**
4. **Add integration with calorie tracker**
5. **Implement data export**

### 🚀 **Phase 5: Advanced** (Week 7+, Optional)

1. **Monthly calendar heatmap**
2. **Advanced charts** (Chart.js/Recharts)
3. **Notifications system**
4. **Personal records tracking**
5. **Social features** (compare with friends - future)

---

## Testing Checklist

### OAuth & Connection

- [ ] Garmin authorization redirects correctly
- [ ] Token exchange completes successfully
- [ ] Tokens stored securely in database
- [ ] Disconnect removes all user data appropriately
- [ ] Token refresh works when expired

### Data Sync

- [ ] Initial full sync imports all historical data
- [ ] Incremental sync only fetches new data
- [ ] Manual sync button works
- [ ] Full resync option reprocesses everything
- [ ] Sync handles API rate limits gracefully
- [ ] Last sync timestamp updates correctly

### UI/UX

- [ ] Dashboard shows step count when connected
- [ ] Step tracker page displays correctly
- [ ] Circular progress updates in real-time
- [ ] Color coding matches achievement levels
- [ ] Weekly trend shows accurate data
- [ ] Statistics cards calculate correctly
- [ ] Mobile responsive on all screen sizes

### Data Integrity

- [ ] No duplicate daily records
- [ ] Weekly summaries calculate correctly
- [ ] Goal achievement detection works
- [ ] Streak calculation accurate
- [ ] Data export produces valid files

### Edge Cases

- [ ] Handles days with zero steps
- [ ] Works when goal changes mid-week
- [ ] Graceful failure when API unavailable
- [ ] Timezone handling correct
- [ ] Missing data days handled appropriately

---

## API Reference

### Garmin Health API Endpoints

#### Get Daily Summaries

```
GET /wellness-api/rest/dailies
Parameters:
  - uploadStartTimeInSeconds: Unix timestamp (start range)
  - uploadEndTimeInSeconds: Unix timestamp (end range)

Response: Array of daily summaries including:
  - calendarDate: "YYYY-MM-DD"
  - totalSteps: Integer
  - totalDistanceMeters: Integer
  - activeTimeInSeconds: Integer
  - bmrKilocalories: Integer
  - consumedCalories: Integer
```

#### Get Heart Rate Data

```
GET /wellness-api/rest/heartRates
Returns: Resting heart rate, min, max, average
```

#### Get Sleep Data

```
GET /wellness-api/rest/sleeps
Returns: Sleep duration, quality, stages
```

### Rate Limits

- Standard: 100 requests per minute
- Daily limit: Varies by approval level
- Use webhooks to reduce API calls

---

## Troubleshooting

### Common Issues

#### "Garmin connection failed"

- Check consumer key/secret are correct
- Verify callback URL matches Garmin app settings
- Ensure HTTPS is configured (Garmin requires HTTPS for production)

#### "No step data available"

- Verify sync has run at least once
- Check last_sync timestamp
- Run full resync to reprocess data
- Confirm Garmin device is syncing to Garmin Connect

#### "Steps not updating"

- Check token hasn't expired
- Verify auto-sync is enabled
- Manually trigger sync
- Check Garmin API status page

#### "Incorrect step count"

- Different devices calculate steps differently
- Garmin Connect may show different values than device
- Time zone differences can affect daily totals
- Compare with Garmin Connect app to verify API data

---

## Security Considerations

1. **Token Storage**: Encrypt access tokens in database
2. **HTTPS Required**: Garmin requires HTTPS for OAuth callbacks
3. **Data Privacy**: Users own their data, provide export/delete options
4. **Rate Limiting**: Respect API limits to avoid account suspension
5. **Error Logging**: Don't log sensitive tokens or user data

---

## Future Enhancements

### Short Term

- [ ] Step goal adjustment recommendations based on trends
- [ ] Weekly challenges (e.g., "Beat last week by 10%")
- [ ] Integration with weather API (correlate activity with weather)
- [ ] Time-of-day step breakdown (morning/afternoon/evening)

### Medium Term

- [ ] Social features (compare with friends/family)
- [ ] Custom goal types (distance, active time, calories)
- [ ] Multi-device support (if user has multiple Garmin devices)
- [ ] Sleep tracking integration
- [ ] Heart rate monitoring

### Long Term

- [ ] AI-powered insights and recommendations
- [ ] Predictive analytics (forecast when you'll hit goals)
- [ ] Integration with more devices (Fitbit, Apple Health)
- [ ] Virtual step challenges (walk to landmarks)
- [ ] Community leaderboards

---

## Resources

### Documentation

- [Garmin Developer Portal](https://developer.garmin.com/)
- [Garmin Health API Docs](https://developer.garmin.com/health-api/overview/)
- [OAuth 1.0a Specification](https://oauth.net/core/1.0a/)

### Libraries

- **OAuth 1.0a**: `oauth-1.0a` npm package
- **Charts**: `chart.js`, `recharts`, `victory`
- **Date Handling**: `date-fns` or `dayjs`
- **Progress Components**: `react-circular-progressbar`

### Design Inspiration

- Apple Watch Activity Rings
- Fitbit Dashboard
- Garmin Connect App
- Strava Activity Feed

---

## Questions?

Before implementing, consider:

1. Do you want to implement Garmin API immediately or wait for approval?
2. Should we build UI with mock data first while waiting?
3. What's your priority: basic step tracking or full wellness data?
4. Do you want Chart.js integration for advanced visualizations?
5. Should step calories integrate with Slimming World tracker?

**Next Steps**:

1. Start Garmin developer application TODAY
2. Create database schema
3. Build UI with mock data
4. Connect API when approved

---

_Last Updated: May 22, 2026_
_Project: WeeGym - Personal Fitness Tracker_
