# Multi-Account Strava Setup Guide

This guide explains how to set up and use multiple Strava accounts in WeeGym.

## 🎯 Overview

You can now connect multiple Strava OAuth applications (e.g., your old paid account and new free account) while preserving all existing data. The system tracks which connection is currently active and allows easy switching between accounts.

## 📋 Setup Steps

### Step 1: Apply Database Migration

Run the migration script in your Supabase SQL Editor:

```sql
-- File: supabase-config/add-multi-strava-accounts.sql
```

This migration:

- ✅ Adds `app_name` column to track which OAuth app (`primary` or `secondary`)
- ✅ Adds `is_active` boolean to track which connection is currently active
- ✅ Updates existing connections to be marked as `primary` and `is_active = true`
- ✅ Updates constraints to allow multiple connections per user
- ✅ Adds helper functions for managing connections

### Step 2: Add Secondary App Credentials to .env

Your `.env` file now supports two sets of Strava credentials:

```bash
# Primary Strava App (your existing paid account)
VITE_STRAVA_CLIENT_ID=239101
VITE_STRAVA_CLIENT_SECRET=437867834e3f11608232aa6984e6b61bd69b4655
VITE_STRAVA_REDIRECT_URI=http://localhost:5173/strava/callback

# Secondary Strava App (your new free account)
VITE_STRAVA_SECONDARY_CLIENT_ID=your-new-client-id-here
VITE_STRAVA_SECONDARY_CLIENT_SECRET=your-new-client-secret-here
VITE_STRAVA_SECONDARY_REDIRECT_URI=http://localhost:5173/strava/callback
```

**To get credentials for a second app:**

1. Go to <https://www.strava.com/settings/api>
2. Click "Create Application" or use an existing secondary app
3. Copy the Client ID and Client Secret
4. Add them to your `.env` file as shown above

### Step 3: Update StravaConnect.jsx UI (Manual Changes Needed)

Add this UI section to show all connections and allow switching between them.

**Add after the connection status card in the render section:**

```jsx
{
  /* Multiple Connections Manager */
}
{
  allConnections && allConnections.length > 0 && (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="card-subtitle mb-3 text-primary">
          <i className="bi bi-link-45deg me-1"></i>
          Connected Accounts
        </h6>

        <div className="list-group">
          {allConnections.map((conn) => (
            <div
              key={conn.id}
              className={`list-group-item ${conn.is_active ? "active" : ""}`}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>
                    {conn.app_name === "primary"
                      ? "🔵 Primary Account"
                      : "🟢 Secondary Account"}
                  </strong>
                  {conn.is_active && (
                    <span className="badge bg-success ms-2">Active</span>
                  )}
                  <div className="small text-muted">
                    {conn.athlete_data?.firstname} {conn.athlete_data?.lastname}
                    {" • "}
                    Connected {new Date(conn.connected_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="btn-group">
                  {!conn.is_active && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleSwitchConnection(conn.app_name)}
                      title="Switch to this account"
                    >
                      Switch
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      if (confirm(`Disconnect ${conn.app_name} account?`)) {
                        disconnectStrava(user.id, conn.app_name).then(() => {
                          loadConnection();
                          setToast({
                            message: `${conn.app_name} account disconnected`,
                            type: "success",
                          });
                        });
                      }
                    }}
                    title="Disconnect this account"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

{
  /* Connect New Account Button */
}
{
  availableApps && availableApps.length > allConnections.length && (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="card-subtitle mb-3">
          <i className="bi bi-plus-circle me-1"></i>
          Add Another Account
        </h6>
        <div className="d-grid gap-2">
          {availableApps
            .filter(
              (app) => !allConnections.find((c) => c.app_name === app.name),
            )
            .map((app) => (
              <button
                key={app.name}
                className="btn btn-outline-primary"
                onClick={() => handleConnect(app.name)}
              >
                <i className="bi bi-box-arrow-up-right me-1"></i>
                Connect {app.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Restart Development Server

```bash
npm run dev
```

## 🔄 How It Works

### Active Connection

- Only ONE connection is "active" at a time
- All activity syncs, displays, and operations use the active connection
- Switch between connections using the "Switch" button in the UI

### Data Isolation

- Activities are tagged with their `app_name` (`primary` or `secondary`)
- When you switch accounts, you only see activities from that account
- **All data is preserved** - switching accounts doesn't delete anything

### Syncing Behavior

- Each connection has its own `last_sync` timestamp
- Syncing operates on the currently active connection
- Full resync only reprocesses the active connection's activities

## 📊 Database Structure

### strava_connections Table

| Column          | Description                                    |
| --------------- | ---------------------------------------------- |
| `user_id`       | Your user ID                                   |
| `app_name`      | `'primary'` or `'secondary'`                   |
| `is_active`     | Boolean - which connection is currently active |
| `athlete_id`    | Strava athlete ID                              |
| `access_token`  | OAuth access token                             |
| `refresh_token` | OAuth refresh token                            |
| `expires_at`    | Token expiration                               |
| `last_sync`     | Last sync timestamp for this connection        |

### strava_activities Table

| Column             | Description                                      |
| ------------------ | ------------------------------------------------ |
| `user_id`          | Your user ID                                     |
| `app_name`         | Source connection (`'primary'` or `'secondary'`) |
| `strava_id`        | Strava activity ID                               |
| ...other fields... | Distance, time, calories, etc.                   |

### Unique Constraints

- `(user_id, app_name)` on connections - one connection per app per user
- `(user_id, app_name, strava_id)` on activities - prevents duplicate activities

## 🔧 API Functions Updated

### Connection Management

```javascript
// Get active connection
const connection = await getConnectionStatus();

// Get specific app connection
const primaryConn = await getConnectionStatus("primary");

// Get all connections for user
const allConns = await getAllConnections();

// Switch active connection
await switchActiveConnection("secondary");

// Disconnect specific app
await disconnectStrava(userId, "primary");

// Disconnect all apps
await disconnectStrava(userId);
```

### Activity Syncing

```javascript
// Sync from active connection
await syncActivities(userId);

// Sync from specific app
await syncActivities(userId, { appName: "secondary" });

// Get activities from active connection
const activities = await getActivities(userId);

// Get activities from specific app
const activities = await getActivities(userId, { appName: "secondary" });

// Get activities from all apps
const activities = await getActivities(userId, { allApps: true });
```

### Authorization

```javascript
// Get auth URL for primary app
const url = getAuthorizationUrl("primary");

// Get auth URL for secondary app
const url = getAuthorizationUrl("secondary");

// Get list of configured apps
const apps = getAvailableApps();
// Returns: [{ name: 'primary', label: 'Primary Account' }, ...]
```

## 🎨 UI Features

### Connection Status Card

Shows:

- Currently active connection
- Athlete name
- Last sync time
- Connect/Disconnect buttons

### Multiple Connections Manager

Shows:

- List of all connected accounts
- Which account is active (highlighted)
- Switch button to change active account
- Individual disconnect buttons

### Add Another Account Section

- Only shows if secondary app is configured in `.env`
- Only shows if not already connected
- Button to connect the additional account

## 🔐 Security Notes

- All connections are isolated per user (RLS policies enforced)
- Tokens are never exposed in console logs
- Each connection maintains its own token refresh cycle
- Disconnecting one account doesn't affect the other

## 🐛 Troubleshooting

### "No secondary app configured"

**Solution:** Add `VITE_STRAVA_SECONDARY_*` variables to your `.env` file

### Migration fails with "constraint already exists"

**Solution:** The migration is idempotent. If you see this error, some changes were already applied. You can safely continue.

### Activities disappear after switching accounts

**Expected behavior:** You're now viewing a different account's activities. Switch back to see the original activities.

### Can't see "Connect Secondary Account" button

**Check:**

1. Is `VITE_STRAVA_SECONDARY_CLIENT_ID` set in `.env`?
2. Have you already connected that account?
3. Did you restart the dev server after updating `.env`?

## 📝 Example Workflow

1. **Start:** You have existing data from paid Strava account (marked as `primary`)
2. **Cancel subscription:** Your paid account credentials remain valid
3. **Create new free account:** Create new OAuth app in Strava
4. **Add credentials:** Update `.env` with `VITE_STRAVA_SECONDARY_*` variables
5. **Apply migration:** Run SQL migration in Supabase
6. **Restart server:** `npm run dev`
7. **Connect secondary:** Click "Connect Secondary Account" in UI
8. **Authorize:** Complete OAuth flow
9. **Switch accounts:** Use "Switch" button to toggle between accounts
10. **Result:** Both accounts available, all data preserved

## 🎉 Benefits

- ✅ Preserve all historical data from paid account
- ✅ Use new free account for ongoing tracking
- ✅ Switch between accounts anytime
- ✅ No data loss or migration needed
- ✅ Each account maintains independent sync state
- ✅ Clean UI for managing multiple accounts

## 🔮 Future Enhancements

Possible additions:

- Merge activities from both accounts in one view
- Auto-switch based on activity type
- Nickname/label for each connection
- Activity comparison between accounts
- Bulk operations across accounts
