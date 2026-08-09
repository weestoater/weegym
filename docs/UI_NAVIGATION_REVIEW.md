# WeeGym UI & Navigation Review

**Date:** August 9, 2026  
**Purpose:** Review current UI structure and navigation patterns, with recommendations for improvements

---

## Current Navigation Structure

### Main Menu (Bottom Popup)

The app uses a **bottom-fixed popup menu** accessed via a "Menu" button. Current menu items:

1. **Home** (Dashboard) - 🏠
2. **Workout** - ▶️ (Strength training sessions)
3. **Active Wellbeing** - 📊 (Gym machines with scores)
4. **Cardio Tracker** - 🏃 (**NEW** - Treadmill, rowing, cross trainer)
5. **Slimming World** - ⭐ (Calorie tracking)
6. **Strava** - 🚴 (Connected outdoor activities)
7. **Steps** - 🚶 (Step tracking)
8. **Import FIT Files** - 📤 (Garmin data import)
9. **Programme** - 📖 (Workout programs)
10. **Settings** - ⚙️

---

## Page Organization by Category

### 🏋️ **Exercise & Fitness**

- **Workout Session** - Strength training with weights/machines
- **Active Wellbeing** - Gym machines (e.g., "Chest & Legs", "Cross cycle") with Cardio/Strength/Stamina modes
- **Cardio Tracker** (**NEW**) - Dedicated cardio equipment (treadmill, rower, cross trainer) with distance, time, calories
- **Programme** - View workout program templates

### 🚴 **Activity Tracking**

- **Strava Connect** - OAuth connection, sync activities
  - Sub-pages: Activities, Analytics, Records
- **Steps** - Step counter tracking
- **Import FIT Files** - Manual Garmin .FIT file upload

### 🍽️ **Nutrition**

- **Slimming World** (Calorie Tracker) - Food diary, calorie tracking

### 🏠 **Core Pages**

- **Dashboard** - Overview stats from all sources
- **Settings** - User preferences, rest times
- **Login** - Authentication

---

## Current Strengths

### ✅ What's Working Well

1. **Bottom Menu Popup**
   - Mobile-friendly, doesn't take permanent screen space
   - Good animation (slide-up)
   - Clear active state indication

2. **Consistent Header**
   - App branding always visible
   - Version number displayed
   - Offline indicator

3. **Multi-Source Integration**
   - Strava for outdoor activities
   - Garmin FIT file support
   - Manual workout logging
   - NEW: Manual cardio tracking

4. **User Authentication**
   - Row Level Security (RLS) with Supabase
   - Multi-user support

---

## Navigation Pain Points & Recommendations

### 🚨 **Issue 1: Menu Item Overload**

**Problem:** 10 items in main menu creates cognitive overload and scrolling

**Impact:** Hard to quickly find what you need

**Recommendations:**

#### Option A: Categorized Sub-Menus

Group related features under parent categories:

```
Main Menu:
├── 🏠 Home
├── 🏋️ Training
│   ├── Workout (Weights)
│   ├── Active Wellbeing
│   ├── Cardio Tracker (NEW)
│   └── Programme
├── 📊 Activity Tracking
│   ├── Strava
│   ├── Steps
│   └── Import FIT Files
├── 🍽️ Nutrition
│   └── Slimming World
└── ⚙️ Settings
```

#### Option B: Dashboard Quick Actions

Make Dashboard the central hub with prominent cards/buttons:

```
Dashboard Layout:
┌─────────────────────────────────┐
│  Last Workout: "Day 1 - Upper"  │
│  [Start Next Workout]            │
└─────────────────────────────────┘
┌────────┬────────┬────────────────┐
│ Cardio │ Active │ Strava Sync    │
│ Tracker│Wellb.  │                │
└────────┴────────┴────────────────┘
┌─────────────────────────────────┐
│  Quick Stats: Steps, Calories   │
└─────────────────────────────────┘
```

Then reduce main menu to 5-6 essential items.

#### Option C: Tab Bar Navigation (Mobile Standard)

Replace popup with **persistent bottom tab bar** (4-5 items max):

```
┌─────┬─────┬─────┬─────┬─────┐
│ Home│Train│Track│Food │More │
└─────┴─────┴─────┴─────┴─────┘
```

"More" opens the popup menu for less-used features.

---

### 🚨 **Issue 2: Activity Tracking Fragmentation**

**Problem:** Cardio activities scattered across multiple pages

**Current State:**

- Outdoor cardio (run/bike) → Strava
- Indoor cardio (treadmill/rower) → NEW Cardio Tracker
- Gym machines with scores → Active Wellbeing
- Strength training → Workout

**Confusion:** Users might not know where to log a gym treadmill session

**Recommendations:**

1. **Clear Naming & Descriptions**
   Update navigation labels with context:
   - "Strava (Outdoor Activities)"
   - "Cardio Tracker (Treadmill, Rower)"
   - "Active Wellbeing (Gym Machines)"

2. **Cross-Linking**
   Add info boxes on each page:

   ```
   ℹ️ Looking for outdoor runs? Check Strava
   ℹ️ Looking for gym machines? Check Active Wellbeing
   ```

3. **Unified Activity View**
   Create a "All Activities" page that combines:
   - Strava activities
   - Cardio sessions
   - Active Wellbeing sessions
   - Workouts

   Filter by source/type.

---

### 🚨 **Issue 3: Strava Sub-Navigation**

**Problem:** Strava has 4 separate pages (Connect, Activities, Analytics, Records) but no clear navigation between them

**Current:** Users must use browser back button or main menu

**Recommendation:**

Add **Strava Tab Navigation** at top of all Strava pages:

```
┌──────────┬──────────┬──────────┬──────────┐
│ Overview │Activities│Analytics │ Records  │
└──────────┴──────────┴──────────┴──────────┘
```

Or a dropdown in the header:

```
Strava ▾
├── Connection Status
├── Activities
├── Analytics
└── Personal Records
```

---

### 🚨 **Issue 4: Dashboard Overload**

**Problem:** Dashboard tries to show everything (workouts, wellbeing, Strava, steps)

**Recommendation:**

1. **User-Customizable Dashboard**
   Let users choose which widgets to show:
   - [ ] Show Workout Stats
   - [ ] Show Strava Summary
   - [ ] Show Cardio Summary
   - [ ] Show Step Count

2. **Focused View Toggle**
   Toggle between "All Stats" and "Today's Summary"

3. **Recent Activity Feed**
   Instead of multiple cards, show a unified feed:
   ```
   Recent Activities:
   - Today 10:30 AM - Treadmill 30min (Cardio Tracker)
   - Yesterday 6:00 PM - Day 1 Upper Body (Workout)
   - Aug 7 - 5.2km Run (Strava)
   ```

---

## Feature Gap Analysis

### What's Missing?

1. **Activity Search & Filter**
   - No global search across all activities
   - No date range filter on Dashboard

2. **Goals & Targets**
   - No weekly cardio goal (e.g., "150 min/week")
   - No progress tracking toward goals

3. **Notifications/Reminders**
   - No workout reminders
   - No "It's been 3 days since your last workout" prompts

4. **Export/Share**
   - No way to export data (CSV, PDF report)
   - No sharing to social media

5. **Activity Comparison**
   - Can't compare this week vs last week
   - No trend graphs

---

## Quick Wins (Low Effort, High Impact)

### Priority 1: Immediate Improvements

1. **Add Breadcrumbs**
   Show current location: `Home > Strava > Activities`

2. **Add "Back to Home" Button**
   On all pages, top-left corner

3. **Group Menu Items Visually**
   Use dividers in popup menu:

   ```
   🏠 Home
   ─────────────
   🏋️ Workout
   📊 Active Wellbeing
   🏃 Cardio Tracker
   ─────────────
   🚴 Strava
   🚶 Steps
   ─────────────
   ⚙️ Settings
   ```

4. **Add Page Descriptions**
   Subtitle under each page title:

   ```
   Cardio Tracker
   Track treadmill, rowing machine, and cross trainer sessions
   ```

5. **Improve Dashboard Cards**
   Add "View All" links on each summary card:
   ```
   ┌───────────────────────────┐
   │ Last Cardio Session       │
   │ Treadmill - 30 min        │
   │ [View All Cardio] ────────┤
   └───────────────────────────┘
   ```

---

## Mobile Optimization

### Current Status

- ✅ Responsive design with Bootstrap
- ✅ Bottom menu prevents thumb strain
- ✅ Cards work well on small screens

### Improvements Needed

1. **Touch Targets**
   - Ensure all buttons are at least 44x44px
   - Add more spacing between menu items

2. **Form Optimization**
   - Use number keyboards for numeric inputs
   - Add input autocomplete attributes
   - Pre-fill date to "today"

3. **Offline Support**
   - Show clearer offline state
   - Queue actions when offline (already partially implemented)

---

## Accessibility Considerations

### Current Gaps

1. **Screen Reader Support**
   - Add ARIA labels to icon buttons
   - Add skip navigation links
   - Ensure form labels are properly associated

2. **Keyboard Navigation**
   - Test tab order
   - Ensure popup menu is keyboard accessible

3. **Color Contrast**
   - Some badges may have low contrast
   - Test with WCAG AA standards

---

## Recommended Phased Implementation

### Phase 1: Navigation Cleanup (1-2 days)

- [ ] Add visual dividers to menu
- [ ] Add page subtitles/descriptions
- [ ] Add breadcrumbs or back buttons
- [ ] Group Strava pages with tab navigation

### Phase 2: Dashboard Enhancement (2-3 days)

- [ ] Consolidate activity summary
- [ ] Add "View All" links
- [ ] Create unified recent activity feed
- [ ] Add quick action buttons

### Phase 3: Menu Restructuring (3-5 days)

- [ ] Implement categorized menu OR
- [ ] Implement tab bar navigation
- [ ] Test with users
- [ ] Adjust based on feedback

### Phase 4: New Features (Ongoing)

- [ ] Activity search/filter
- [ ] Goals & targets
- [ ] Export functionality
- [ ] Trend analysis

---

## Testing Checklist

Before releasing navigation changes:

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test with screen reader (VoiceOver, TalkBack)
- [ ] Test keyboard navigation
- [ ] Test with poor network connection
- [ ] Test with offline mode
- [ ] User testing with 3-5 people

---

## Conclusion

The WeeGym app has excellent **feature coverage** but suffers from **navigation complexity** due to its breadth. The addition of **Cardio Tracker** fills an important gap but also adds to the menu overload.

**Top Priority:** Simplify navigation through categorization or tab structure.

**Secondary Priority:** Enhance Dashboard as central hub to reduce menu reliance.

**Long-term:** Build unified activity view and goal tracking to improve user engagement.
