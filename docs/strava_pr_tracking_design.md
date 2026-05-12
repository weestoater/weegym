# Strava Personal Records (PR) Tracking - Design Document

**Created:** May 12, 2026  
**Status:** Design Phase  
**For:** WeeGym Strava Integration Phase 6

---

## Overview

Personal Records (PRs) tracking allows users to automatically identify and celebrate their best performances across different activity types and metrics. This document outlines the design considerations for implementing PR tracking.

---

## 1. Types of PRs to Track

### Distance-Based PRs

- **Longest single activity** (by type: Ride, Walk, Run, Hike)
- **Specific distance benchmarks**:
  - Running: 1 mile, 5k, 10k, Half Marathon (21.1km), Marathon (42.2km)
  - Cycling: 10km, 25km, 50km, 100km, 100 miles (161km)
  - Walking: 5km, 10km, Half Marathon

### Speed-Based PRs

- **Fastest average speed** for activity type
- **Fastest time for specific distances**:
  - Best 5k time
  - Best 10k time
  - Best mile time
- **Max speed achieved** (single activity)

### Elevation-Based PRs

- **Most elevation gain** in single activity
- **Biggest climb** (longest sustained climb)
- **Total elevation milestones**:
  - Equivalent to Mount Everest (8,849m) - track progress
  - Monthly elevation totals

### Endurance PRs

- **Longest duration** (by activity type)
- **Most moving time** vs elapsed time difference (efficiency)
- **Consecutive days active** (streak tracking)

### Effort PRs

- **Highest average heart rate** sustained
- **Most calories burned** in single activity
- **Best power output** (if available from device)

### Volume PRs

- **Most activities in a week/month**
- **Highest weekly distance**
- **Highest monthly distance**

---

## 2. PR Categorization Strategy

### By Activity Type

PRs should be tracked separately for each activity type:

- **Ride** (Mountain Bike, Road Bike, Gravel, E-Bike)
- **Run** (Trail Run, Road Run)
- **Walk** (Walk, Hike)
- **Swim**
- **Other** (Workout, Yoga, etc.)

**Rationale:** A 20km bike ride is not comparable to a 20km run.

### By Time Period

- **All-Time PR** - Best ever performance
- **This Year** - Best in current calendar year
- **This Month** - Best in current month
- **Last 12 Months** - Rolling year performance

**Rationale:** Allows users to see improvement over time and seasonal variations.

### By Route/Segment (Future Enhancement)

- **Specific route PRs** (same starting point/endpoint)
- **Strava Segment PRs** (if using Strava segments feature)

---

## 3. Database Schema Design

### Option A: Computed PRs (No Storage)

**Pros:**

- Always accurate with current data
- No storage overhead
- Simpler to implement initially

**Cons:**

- Slower to calculate on-demand
- Can't track "when PR was broken"
- Can't show historical progression easily

### Option B: Stored PRs (Recommended)

**Pros:**

- Fast retrieval
- Can track PR history
- Can show when records were set/broken
- Can display notifications when PRs are beaten

**Cons:**

- Requires additional table
- Needs recalculation logic on sync

### Recommended Schema: `strava_personal_records`

```sql
CREATE TABLE strava_personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- PR Identification
  activity_type TEXT NOT NULL,        -- 'Ride', 'Run', 'Walk', 'Hike'
  pr_category TEXT NOT NULL,          -- 'longest_distance', 'fastest_5k', 'most_elevation'

  -- PR Data
  record_value DECIMAL NOT NULL,      -- The actual record (distance in meters, time in seconds, etc.)
  record_unit TEXT NOT NULL,          -- 'meters', 'seconds', 'bpm', 'calories'

  -- Activity Reference
  activity_id UUID NOT NULL REFERENCES strava_activities(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL, -- Original Strava ID
  activity_name TEXT,
  activity_date TIMESTAMPTZ NOT NULL,

  -- Metadata
  set_at TIMESTAMPTZ DEFAULT NOW(),
  previous_record_value DECIMAL,      -- What was beaten (for notifications)
  time_scope TEXT DEFAULT 'all_time', -- 'all_time', 'year', 'month'

  -- Ensure one PR per category per time scope
  UNIQUE(user_id, activity_type, pr_category, time_scope)
);

-- RLS Policy
ALTER TABLE strava_personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PRs"
  ON strava_personal_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast queries
CREATE INDEX idx_strava_prs_user ON strava_personal_records(user_id, activity_type);
CREATE INDEX idx_strava_prs_category ON strava_personal_records(user_id, pr_category);
```

### PR History Table (Optional - Future Enhancement)

Track every time a PR is broken:

```sql
CREATE TABLE strava_pr_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pr_id UUID REFERENCES strava_personal_records(id) ON DELETE CASCADE,

  activity_id UUID NOT NULL REFERENCES strava_activities(id),
  old_value DECIMAL,
  new_value DECIMAL,
  improvement_percent DECIMAL,
  broken_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. PR Calculation Logic

### When to Calculate PRs

**Option 1: On Every Sync** (Recommended for MVP)

- After syncing activities, recalculate all PRs
- Compare new activities against current PRs
- Update if records are broken

**Option 2: On-Demand**

- Calculate when user views analytics/PR page
- Slower but reduces processing overhead

**Option 3: Background Job**

- Calculate PRs asynchronously after sync
- Best for large datasets

### Calculation Functions

#### Core PR Categories to Implement (MVP)

```javascript
// src/utils/prCalculator.js

export const PR_CATEGORIES = {
  // Distance
  LONGEST_DISTANCE: "longest_distance",
  FASTEST_5K: "fastest_5k",
  FASTEST_10K: "fastest_10k",

  // Elevation
  MOST_ELEVATION: "most_elevation",

  // Speed
  HIGHEST_AVG_SPEED: "highest_avg_speed",

  // Endurance
  LONGEST_DURATION: "longest_duration",

  // Effort
  MOST_CALORIES: "most_calories",
};

// Calculate if activity sets a PR
export function checkForPersonalRecords(activity, existingPRs, activityType) {
  const newPRs = [];

  // Check longest distance
  if (activity.distance > (existingPRs.longest_distance || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.LONGEST_DISTANCE,
      value: activity.distance,
      unit: "meters",
      previousValue: existingPRs.longest_distance,
    });
  }

  // Check fastest 5k (if distance >= 5000m)
  if (activity.distance >= 4900 && activity.distance <= 5100) {
    const currentFastest = existingPRs.fastest_5k;
    if (!currentFastest || activity.moving_time < currentFastest) {
      newPRs.push({
        category: PR_CATEGORIES.FASTEST_5K,
        value: activity.moving_time,
        unit: "seconds",
        previousValue: currentFastest,
      });
    }
  }

  // Check most elevation
  if (activity.total_elevation_gain > (existingPRs.most_elevation || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.MOST_ELEVATION,
      value: activity.total_elevation_gain,
      unit: "meters",
      previousValue: existingPRs.most_elevation,
    });
  }

  // Check highest average speed
  if (activity.average_speed > (existingPRs.highest_avg_speed || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.HIGHEST_AVG_SPEED,
      value: activity.average_speed,
      unit: "meters_per_second",
      previousValue: existingPRs.highest_avg_speed,
    });
  }

  // Check longest duration
  if (activity.moving_time > (existingPRs.longest_duration || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.LONGEST_DURATION,
      value: activity.moving_time,
      unit: "seconds",
      previousValue: existingPRs.longest_duration,
    });
  }

  // Check most calories
  if (activity.calories > (existingPRs.most_calories || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.MOST_CALORIES,
      value: activity.calories,
      unit: "calories",
      previousValue: existingPRs.most_calories,
    });
  }

  return newPRs;
}
```

### Integration with Sync Process

```javascript
// In stravaService.js - syncActivities function

// After inserting/updating activities
const newActivities = await syncActivitiesFromAPI(userId, after);

// Calculate PRs for each activity type
const activityTypes = ["Ride", "Run", "Walk", "Hike"];
for (const type of activityTypes) {
  await updatePersonalRecords(
    userId,
    type,
    newActivities.filter((a) => a.type === type),
  );
}
```

---

## 5. UI/UX Considerations

### Where to Display PRs

#### 1. Dedicated PR Page (`/strava/records`)

**Primary view for all PRs:**

- Tabbed interface by activity type (Ride | Run | Walk | All)
- Grid of PR cards showing:
  - PR category name
  - Record value with units
  - Activity name & date
  - "View Activity" link
  - Progress bar showing improvement from previous

**Example Layout:**

```
┌─────────────────────────────────────────┐
│  Personal Records - Mountain Biking     │
├─────────────────────────────────────────┤
│ 🏆 Longest Ride                         │
│ 45.2 km                                 │
│ "Epic Trail Ride" - May 8, 2026        │
│ [View Activity]                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━ (Previous: 38km)│
└─────────────────────────────────────────┘
```

#### 2. Activity Cards Enhancement

Add PR badge/indicator:

```javascript
{
  activity.isPR && (
    <span className="badge bg-warning text-dark">
      <i className="bi bi-trophy-fill"></i> PR
    </span>
  );
}

{
  activity.prCategories?.length > 0 && (
    <div className="mt-2">
      {activity.prCategories.map((pr) => (
        <span key={pr} className="badge bg-warning me-1">
          {formatPRCategory(pr)}
        </span>
      ))}
    </div>
  );
}
```

#### 3. Analytics Dashboard Integration

Add PR section:

- "Recent PRs" - Last 5 records broken
- PR progression chart (show how records have improved over time)
- Next milestone tracker (e.g., "3.2km away from 50km PR")

#### 4. Dashboard Widget (Main WeeGym Dashboard)

Small PR summary card:

```
┌──────────────────────────┐
│ 🏆 Recent PRs            │
├──────────────────────────┤
│ Longest Ride: 45.2km ⬆️  │
│ Most Elevation: 892m ⬆️  │
│ Fastest 10k: 52:13 ⬆️    │
└──────────────────────────┘
```

### Notifications/Feedback

**When PRs are Broken:**

1. **During Sync** - Toast notification:

   ```
   🎉 New Personal Record!
   Longest Ride: 45.2 km (beat previous 38.1 km)
   ```

2. **On Activity Card** - Prominent badge:

   ```html
   <div className="alert alert-warning">
     🏆 This activity set 2 personal records! • Longest Ride (45.2 km) • Most
     Elevation (892 m)
   </div>
   ```

3. **In Activity List** - Visual indicator (gold star or trophy icon)

### User Actions

**Filters:**

- View PRs by activity type
- View PRs by time period (all-time, year, month)
- Toggle between metric/imperial units

**Details:**

- Click PR card to view the activity that set it
- See PR history (when it was set, previous records)
- Compare with other users (future: leaderboards)

**Sharing (Future):**

- Share PR achievements to social media
- Generate PR summary image

---

## 6. Implementation Phases

### Phase 6.1: Core PR Tracking (MVP)

**Estimated Time: 4-6 hours**

**Database:**

- ✅ Create `strava_personal_records` table
- ✅ Add RLS policies

**Backend:**

- ✅ Create `prCalculator.js` utility with 6 core PR categories
- ✅ Integrate PR calculation into sync process
- ✅ Add functions to fetch current PRs by type

**Frontend:**

- ✅ Add PR badges to activity cards
- ✅ Create basic PR page showing all records
- ✅ Show toast notifications when PRs are broken during sync

**PR Categories (MVP):**

1. Longest Distance
2. Most Elevation
3. Highest Average Speed
4. Longest Duration
5. Most Calories
6. Highest Max Speed

### Phase 6.2: Enhanced PR Features

**Estimated Time: 3-4 hours**

- ✅ Add specific distance PRs (5k, 10k times)
- ✅ PR history tracking (see when records were broken)
- ✅ PR progression charts (show improvement over time)
- ✅ Add PR section to analytics dashboard
- ✅ "Next milestone" progress indicators

### Phase 6.3: Advanced Features (Future)

**Estimated Time: 4-6 hours**

- ✅ Strava Segment PRs integration
- ✅ Route-specific PRs (same route, better time)
- ✅ Yearly/monthly PR summaries
- ✅ PR achievement badges system
- ✅ Social sharing of PRs
- ✅ Leaderboards (compare with friends)

---

## 7. Technical Considerations

### Performance

- **Indexing:** Ensure `strava_activities` table has indexes on `distance`, `moving_time`, `total_elevation_gain`, `average_speed`
- **Caching:** Consider caching current PRs in memory or Redis for fast access
- **Lazy Loading:** Calculate PRs in background after sync, don't block UI

### Data Quality

- **Missing Data:** Handle activities with missing heart rate, elevation, or GPS
- **Anomalies:** Filter out obviously incorrect data (e.g., 1000 km/h max speed due to GPS error)
- **Manual Activities:** Decide if manually entered activities count for PRs (recommend: yes, but flag them)

### Edge Cases

1. **Activity updated/deleted on Strava:** PR might need recalculation
2. **Multiple PRs in one activity:** Handle gracefully in UI
3. **Tied records:** Show most recent as current PR
4. **Unit conversions:** Store in metric (meters, seconds), display in user preference
5. **Activity type changes:** If user changes activity type on Strava, recalculate PRs

### User Preferences

Allow users to:

- Enable/disable specific PR categories
- Choose which PRs to display prominently
- Set custom distance benchmarks (e.g., "My local 12km loop")

---

## 8. Success Metrics

How to measure if PR tracking is successful:

1. **Engagement:**
   - % of users who view PR page
   - Time spent on PR page
   - Number of PR achievements per user

2. **Motivation:**
   - Correlation between PR achievements and activity frequency
   - User feedback/surveys

3. **Data Quality:**
   - % of activities that have sufficient data for PR calculation
   - Number of anomalies detected and filtered

---

## 9. User Stories

### Story 1: Mountain Biker

> "As a mountain biker, I want to see my longest ride and most elevation gained so I can challenge myself to beat these records on future rides."

**Acceptance Criteria:**

- PRs are displayed separately for "Ride" activities
- Longest ride shows distance in preferred units (miles)
- Most elevation shows total meters climbed
- Activity that set the record is linked

### Story 2: Regular Walker

> "As someone who walks daily with my dog, I want to see my progress over time and know when I've walked further than ever before."

**Acceptance Criteria:**

- PRs tracked for "Walk" activities
- Notification when new longest walk is achieved
- Can see month-by-month PR progression

### Story 3: Multi-Sport Athlete

> "As someone who bikes and runs, I want to see PRs for each activity type separately so I can track improvement in different disciplines."

**Acceptance Criteria:**

- Separate PR pages/tabs for Ride, Run, Walk
- Can filter analytics by activity type
- PRs don't mix between activity types

---

## 10. Comparison with Strava's PRs

Strava has extensive PR tracking built-in. Our implementation should:

**Complement, not duplicate:**

- Focus on WeeGym-specific integration (Active Wellbeing connection)
- Emphasize overall fitness journey (combine with gym workouts)
- Simpler, more accessible for casual users

**Key Differences:**

- **Strava:** Segment-based PRs, detailed power metrics, competitive leaderboards
- **WeeGym:** Activity-level PRs, integration with calorie/syn tracking, personal focus

**Value Proposition:**

> "See your outdoor activity PRs alongside your gym progress in one place. Track how Strava activities contribute to your overall fitness goals."

---

## 11. Next Steps

### To Implement Phase 6.1 (Core PR Tracking):

1. **Create database table** - Apply SQL schema for `strava_personal_records`
2. **Build PR calculator** - Create `prCalculator.js` with 6 core categories
3. **Integrate with sync** - Call PR calculation after activity sync
4. **Create PR service** - Add functions to fetch/update PRs
5. **Build PR page** - Create `/strava/records` route and component
6. **Add PR badges** - Update `StravaActivityCard` to show PR indicators
7. **Add notifications** - Toast messages when PRs are broken
8. **Test thoroughly** - Verify PRs calculate correctly for different scenarios

### Questions to Answer Before Implementation:

1. **Time Scope Priority:** Start with "all-time" only, or implement year/month from the start?
   - **Recommendation:** Start with all-time, add time-based later

2. **PR Categories:** Which 6 categories for MVP? (Proposed: distance, elevation, speed, duration, calories, max speed)
   - **User preference?** What matters most for mountain biking and walking?

3. **Notifications:** Toast only, or also show in a "Recent Achievements" section?
   - **Recommendation:** Toast during sync + achievements section on dashboard

4. **Anomaly Detection:** Should we filter out suspicious data automatically?
   - **Recommendation:** Yes, set sensible thresholds (e.g., max speed < 100 km/h for bikes)

---

## 12. Resources & References

- **Strava API - Activity Streams:** https://developers.strava.com/docs/reference/#api-Streams
- **Strava API - Segment Efforts:** https://developers.strava.com/docs/reference/#api-SegmentEfforts
- **Exercise Science - Performance Metrics:** Understanding what metrics matter for different activities

---

**Ready to proceed with implementation?** Let's discuss which PR categories are most important for your use case (mountain biking and dog walks) and finalize the MVP scope!
