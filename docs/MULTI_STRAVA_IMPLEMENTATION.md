# Implementation Summary: Multi-Account Strava Support

## ✅ Changes Completed

### 1. Database Migration (✅ Created)

- **File:** `supabase-config/add-multi-strava-accounts.sql`
- **Changes:**
  - Added `app_name` column to `strava_connections` (default: 'primary')
  - Added `is_active` boolean to track active connection
  - Added `app_name` column to `strava_activities`
  - Updated UNIQUE constraints to support multiple connections per user
  - Created helper functions: `get_active_strava_connection()`, `set_active_strava_connection()`
- **Action Required:** Run this SQL file in Supabase SQL Editor

### 2. Environment Variables (✅ Updated)

- **Files:** `.env`, `.env.example`
- **Changes:**
  - Added support for secondary Strava app credentials:
    - `VITE_STRAVA_SECONDARY_CLIENT_ID`
    - `VITE_STRAVA_SECONDARY_CLIENT_SECRET`
    - `VITE_STRAVA_SECONDARY_REDIRECT_URI`
- **Action Required:** Add your new Strava OAuth app credentials to `.env`

### 3. Service Layer (✅ Updated)

- **File:** `src/services/stravaService.js`
- **Changes:**
  - Created `STRAVA_APPS` object with primary and secondary configs
  - Updated `getAuthorizationUrl(appName)` to support app selection
  - Updated `exchangeCodeForToken(code, appName)` to store app_name
  - Updated `refreshAccessToken(userId, appName)` for app-specific tokens
  - Updated `getValidAccessToken(userId, appName)` to use active or specific app
  - Updated `syncActivities()` to include app_name when storing activities
  - Updated `getActivities()` to filter by app_name (defaults to active)
  - Updated `disconnectStrava()` to support app-specific or full disconnect
  - **New functions added:**
    - `getAvailableApps()` - Lists configured apps
    - `getAllConnections()` - Gets all user connections
    - `switchActiveConnection(appName)` - Changes active connection
    - `getConnectionStatus(appName)` - Gets specific or active connection

### 4. OAuth Callback Handler (✅ Updated)

- **File:** `src/pages/StravaCallback.jsx`
- **Changes:**
  - Updated to read `state` parameter from OAuth callback
  - Passes `appName` to `exchangeCodeForToken()`
  - Logs which app is being connected

### 5. UI Component (⚠️ Partially Updated)

- **File:** `src/pages/StravaConnect.jsx`
- **Changes Made:**
  - Added imports for new functions
  - Added state variables: `allConnections`, `availableApps`
  - Updated `loadConnection()` to fetch all connections
  - Added `loadAvailableApps()` function
  - Updated `handleConnect(appName)` to support app selection
  - Added `handleSwitchConnection(appName)` function
  - Updated `handleDisconnect()` to support app-specific disconnect
- **Changes Still Needed:** Add UI components to display and manage multiple connections (see setup guide)

## 📋 Setup Checklist

- [ ] **Step 1:** Run `supabase-config/add-multi-strava-accounts.sql` in Supabase SQL Editor
- [ ] **Step 2:** Get credentials for your second Strava OAuth app
- [ ] **Step 3:** Update `.env` with secondary app credentials
- [ ] **Step 4:** Add multi-account UI to `StravaConnect.jsx` (see guide)
- [ ] **Step 5:** Restart dev server: `npm run dev`
- [ ] **Step 6:** Test connecting secondary account
- [ ] **Step 7:** Test switching between accounts
- [ ] **Step 8:** Verify data isolation (each account shows its own activities)

## 🎯 How It Works

### Data Structure

```text
User
├── strava_connections
│   ├── primary (is_active: true)
│   │   ├── athlete_id: 123456
│   │   ├── access_token: xxx
│   │   └── last_sync: 2026-06-30
│   └── secondary (is_active: false)
│       ├── athlete_id: 789012
│       ├── access_token: yyy
│       └── last_sync: 2026-06-30
└── strava_activities
    ├── Activity 1 (app_name: 'primary')
    ├── Activity 2 (app_name: 'primary')
    ├── Activity 3 (app_name: 'secondary')
    └── Activity 4 (app_name: 'secondary')
```

### Active Connection Logic

1. Only ONE connection is active at a time (`is_active = true`)
2. All UI operations use the active connection
3. Switching accounts updates `is_active` flags
4. Each connection maintains independent sync state

### API Behavior

```javascript
// Default: uses active connection
await syncActivities(userId);
await getActivities(userId);

// Specific app
await syncActivities(userId, { appName: "secondary" });
await getActivities(userId, { appName: "primary" });

// All apps
await getActivities(userId, { allApps: true });
```

## 🔄 Migration Path for Existing Data

Your existing data is automatically preserved:

1. **Before migration:** Data stored without `app_name`
2. **After migration:** Existing data tagged as `app_name = 'primary'`
3. **After connecting secondary:** New data tagged as `app_name = 'secondary'`
4. **Result:** All historical data preserved and viewable

## 🎨 UI Wireframe

```text
┌─────────────────────────────────────────┐
│ Connected Accounts                      │
├─────────────────────────────────────────┤
│ 🔵 Primary Account [Active]             │
│    John Doe • Connected Jun 1, 2026     │
│    [Sync] [Disconnect]                  │
├─────────────────────────────────────────┤
│ 🟢 Secondary Account                    │
│    Jane Smith • Connected Jun 30, 2026  │
│    [Switch] [Disconnect]                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Add Another Account                     │
├─────────────────────────────────────────┤
│ No additional accounts available        │
│ (or)                                    │
│ [Connect Secondary Account]             │
└─────────────────────────────────────────┘
```

## 🚨 Important Notes

1. **Preserve existing data:** Migration marks all existing data as `primary` - nothing is deleted
2. **OAuth apps are separate:** Each Strava OAuth app needs its own credentials
3. **One active connection:** UI shows data from the active connection only
4. **Easy switching:** Toggle between accounts without data loss
5. **Independent sync:** Each connection tracks its own last sync time

## 📚 Related Files

- **Setup Guide:** `docs/MULTI_STRAVA_ACCOUNTS_SETUP.md` - Comprehensive user guide
- **Migration:** `supabase-config/add-multi-strava-accounts.sql` - Database changes
- **Service:** `src/services/stravaService.js` - API integration
- **UI:** `src/pages/StravaConnect.jsx` - Connection management page
- **Callback:** `src/pages/StravaCallback.jsx` - OAuth handler

## ✨ Testing Checklist

- [ ] Can connect primary account
- [ ] Can connect secondary account
- [ ] Can see both connections in UI
- [ ] Can switch between accounts
- [ ] Activities show only for active account
- [ ] Can sync each account independently
- [ ] Can disconnect one account (other remains)
- [ ] Can reconnect after disconnect
- [ ] Data persists after switching accounts
- [ ] Full resync works for each account
