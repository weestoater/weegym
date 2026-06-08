# Strava Integration Troubleshooting Guide

**Last Updated:** June 8, 2026

This guide helps diagnose and fix issues with the Strava integration, particularly when syncing works intermittently between local development and production.

---

## 🔧 Recent Fixes Applied

### Summary of Improvements

The Strava service has been enhanced with:

1. **Environment Variable Validation** - Checks that all required config is present at startup
2. **Timeout Handling** - 30-second timeout with automatic retry (3 attempts)
3. **Better Error Messages** - Detailed logging showing exactly where failures occur
4. **Token Refresh Race Condition Fix** - Prevents multiple simultaneous token refreshes
5. **Network Retry Logic** - Automatically retries on network errors or timeouts

### What Was Fixed

**Before:**

- No validation of environment variables - silent failures
- No timeout on API calls - could hang indefinitely
- Basic error messages - hard to diagnose
- Token refresh could race when multiple calls happened simultaneously
- Network errors caused immediate failure

**After:**

- Startup validation with clear error messages
- 30-second timeout with exponential backoff retry
- Detailed logging at every step (with emoji indicators for easy scanning)
- Single token refresh promise shared across concurrent calls
- Automatic retry on network/timeout errors (up to 3 attempts)

---

## 🔍 Diagnostic Steps

### Step 1: Check Configuration

**Run the configuration checker:**

```bash
node scripts/check-strava-config.js
```

This verifies:

- ✅ All required environment variables are set
- ✅ Redirect URI format is correct
- ✅ Client ID and secret look valid
- ⚠️ Warns about common misconfigurations

**Common Issues:**

1. **Missing Environment Variables**
   - **Symptom:** Works locally but not in production
   - **Cause:** Environment variables not set in production (Vercel, GitHub Pages, etc.)
   - **Fix:** Set environment variables in your hosting platform's dashboard

2. **Redirect URI Mismatch**
   - **Symptom:** OAuth fails with "redirect_uri mismatch"
   - **Cause:** `VITE_STRAVA_REDIRECT_URI` doesn't match what's configured in Strava API settings
   - **Fix:**
     - Local: `http://localhost:5173/strava/callback`
     - Production: `https://yourdomain.com/strava/callback`
     - Update both `.env` AND Strava API settings

3. **Wrong Redirect Path Format**
   - **Symptom:** OAuth succeeds but callback page doesn't load
   - **Cause:** Using `/strava-callback` instead of `/strava/callback`
   - **Fix:** Update `VITE_STRAVA_REDIRECT_URI` to use `/strava/callback`

### Step 2: Check Browser Console

**Open Developer Tools Console** and look for these indicators:

**✅ Good signs:**

```text
✅ Strava config loaded: { clientId: "239101", redirectUri: "...", clientSecret: "***4655" }
🚀 Starting Strava sync...
🔑 Using cached token (expires in 250 minutes)
📅 Using last sync timestamp: 1749734400
🌐 Fetching from: https://www.strava.com/api/v3/athlete/activities?...
📊 Received 5 activities from Strava
✅ Sync completed successfully
```

**❌ Bad signs:**

```text
❌ STRAVA CONFIGURATION ERROR:
Missing required environment variables:
  - VITE_STRAVA_CLIENT_ID
```

This means environment variables are not loaded. Check:

- Is `.env` file present?
- Are you using `VITE_` prefix for all variables?
- Did you restart the dev server after changing `.env`?

**⏱️ Timeout issues:**

```text
⏱️ Request timeout for https://www.strava.com/api/v3/athlete/activities
🔄 Retrying... (2 attempts left)
```

This indicates network problems or Strava API slowness. The service will automatically retry.

**🌐 Network errors:**

```text
🌐 Network error for ...: Failed to fetch
🔄 Retrying... (2 attempts left)
```

Common causes:

- Internet connection issues
- CORS problems (usually only in development)
- Firewall blocking requests
- Ad blockers interfering

### Step 3: Check Token Status

**Signs of token issues:**

```text
🔑 Token expires in 2 minutes, refreshing...
🔄 Refreshing access token...
✅ Token refreshed successfully
```

If you see refresh failures:

```text
❌ Token refresh failed: 400 Bad Request
```

**Possible causes:**

- Refresh token is invalid/expired (disconnect and reconnect Strava)
- Client secret is incorrect
- Strava API is down

**Fix:** Disconnect and reconnect your Strava account in the app.

### Step 4: Test API Connectivity

**Test Strava API is reachable:**

```bash
# Test from your terminal
curl -I https://www.strava.com/api/v3

# Should return: HTTP/2 200
```

**Test your credentials (from project directory):**

```bash
npm run test:strava-creds
# or
node scripts/test-strava-credentials.js
```

This makes a test API call to verify credentials work.

---

## 🌍 Environment-Specific Issues

### Local Development Works, Production Doesn't

**Checklist:**

1. **Environment Variables in Production**
   - [ ] Set in hosting platform (Vercel, Netlify, etc.)
   - [ ] Include `VITE_` prefix
   - [ ] No quotes around values in platform dashboard

2. **Redirect URI**
   - [ ] Update in Strava API settings for production domain
   - [ ] Matches exactly (including https://, path, no trailing slash)

3. **Rebuild Required**
   - [ ] Redeploy after changing environment variables
   - [ ] Clear cache if using CDN

### Production Works, Local Doesn't

**Checklist:**

1. **Local .env File**
   - [ ] File exists: `.env` or `.env.local`
   - [ ] Not accidentally in `.gitignore` exclusion
   - [ ] Variables have `VITE_` prefix

2. **Dev Server Restart**
   - [ ] Stop dev server (Ctrl+C)
   - [ ] Start again: `npm run dev`
   - [ ] Environment variables only load on startup

3. **Redirect URI in Strava**
   - [ ] Add both localhost AND production URIs to Strava API settings
   - [ ] Use `http://localhost:5173/strava/callback` for local

### Works Sometimes, Not Other Times

**This indicates:**

- Network instability (fixed by retry logic)
- Token expiration at boundary (fixed by refresh logic)
- Rate limiting from Strava API

**Solutions:**

- Wait a few minutes and try again
- Check Strava API status: <https://status.strava.com>
- Verify you're not hitting rate limits (100 requests per 15 minutes)

---

## 🐛 Common Error Messages

### "Strava is not configured"

**Full error:**

```text
Error: Strava is not configured. Please set VITE_STRAVA_CLIENT_ID,
VITE_STRAVA_CLIENT_SECRET, and VITE_STRAVA_REDIRECT_URI environment variables.
```

**Fix:**

1. Create `.env` file if it doesn't exist
2. Copy from `.env.example`
3. Fill in values from Strava API settings
4. Restart dev server

### "Strava connection not found"

**Full error:**

```text
Error: Strava connection not found. Please reconnect your Strava account.
```

**Meaning:** User hasn't connected Strava, or connection was deleted

**Fix:**

1. Go to Strava page in app
2. Click "Connect to Strava"
3. Authorize the application

### "Token refresh failed"

**Full error:**

```text
Error: Token refresh failed (400): Bad Request
```

**Meaning:** Stored refresh token is invalid

**Fix:**

1. Disconnect Strava in app
2. Reconnect to get new tokens
3. If persists, check client secret is correct

### "Request timeout"

**Full error:**

```text
Error: Request timeout - Strava API did not respond in time
```

**Meaning:** API call took > 30 seconds

**Likely causes:**

- Strava API is experiencing issues
- Network connection is slow
- Request was blocked by firewall

**Fix:**

- Check Strava status: <https://status.strava.com>
- Try again (service auto-retries 3 times)
- Check internet connection

### "redirect_uri mismatch"

**From Strava:**

```text
The redirect_uri included is not valid.
```

**Fix:**

1. Check current `VITE_STRAVA_REDIRECT_URI` in `.env`
2. Log into Strava API settings: <https://www.strava.com/settings/api>
3. Ensure "Authorization Callback Domain" matches:
   - Local: `localhost`
   - Production: your domain (no http://, no path)
4. Ensure `.env` has full path:
   - Local: `http://localhost:5173/strava/callback`
   - Production: `https://yourdomain.com/strava/callback`

---

## 📊 Understanding the Logs

The enhanced logging uses emoji indicators for easy scanning:

| Emoji | Meaning             | Example                            |
| ----- | ------------------- | ---------------------------------- |
| ✅    | Success             | `✅ Sync completed successfully`   |
| ❌    | Error               | `❌ Token refresh failed`          |
| ⚠️    | Warning             | `⚠️ Could not fetch detailed data` |
| 🚀    | Starting            | `🚀 Starting Strava sync...`       |
| 🔑    | Token operations    | `🔑 Token expires in 250 minutes`  |
| 📅    | Date/time info      | `📅 Using last sync timestamp`     |
| 🌐    | Network request     | `🌐 Fetching from: https://...`    |
| 📊    | Data received       | `📊 Received 5 activities`         |
| 💾    | Database operations | `💾 Updating last_sync timestamp`  |
| 🏆    | Personal records    | `🏆 Checking for personal records` |
| 🔄    | Retry/refresh       | `🔄 Retrying... (2 attempts left)` |
| ⏱️    | Timeout             | `⏱️ Request timeout`               |
| 🔔    | Webhook operations  | `🔔 Subscribing to webhooks`       |

**Typical successful sync flow:**

```text
✅ Strava config loaded: { ... }
🚀 Starting Strava sync...
🔑 Using cached token (expires in 250 minutes)
📅 Using last sync timestamp: 1749734400 (2026-06-08T12:00:00.000Z)
🌐 Fetching from: https://www.strava.com/api/v3/athlete/activities?page=1&per_page=30&after=1749734400
📊 Received 3 activities from Strava
📝 Processing activity 123456: Morning Ride
✅ New activity saved: Morning Ride
📝 Processing activity 123457: Evening Run
♻️ Activity updated: Evening Run
💾 Updating last_sync timestamp...
🏆 Checking for personal records...
✅ Sync completed successfully: { total: 3, new: 1, updated: 2, newPRs: 0 }
```

---

## 🔐 Security Notes

**Never commit to git:**

- `.env`
- `.env.local`
- `.env.production`
- Any file containing real API keys

**Safe to commit:**

- `.env.example` (with placeholder values)

**In production:**

- Set environment variables in platform dashboard
- Don't expose client secret in client-side code (it's only used in API calls)
- Rotate keys if accidentally exposed

---

## 📞 Getting Help

If you've tried all troubleshooting steps and still have issues:

1. **Check Strava API Status:** <https://status.strava.com>
2. **Review Rate Limits:** 100 requests per 15 minutes, 1000 per day
3. **Check Strava API Settings:** <https://www.strava.com/settings/api>
4. **Enable detailed logging:** Check browser console for full error details
5. **Test credentials:** Run `node scripts/test-strava-credentials.js`

**When reporting an issue, include:**

- Browser console logs (with emojis visible)
- Environment (local dev vs production)
- Steps to reproduce
- Redact any API keys/tokens from logs

---

## ✅ Quick Checklist

Use this for rapid troubleshooting:

**Configuration:**

- [ ] `.env` file exists with all `VITE_*` variables
- [ ] Dev server restarted after `.env` changes
- [ ] Redirect URI matches between `.env` and Strava API settings
- [ ] Production environment variables set in hosting platform

**Connectivity:**

- [ ] Can reach `https://www.strava.com/api/v3`
- [ ] Not hitting rate limits (100/15min)
- [ ] No firewall/ad blocker interference

**Authentication:**

- [ ] Strava account connected in app
- [ ] Token not expired (or refresh working)
- [ ] Credentials valid (run test script)

**Logs:**

- [ ] See ✅ for config loaded
- [ ] No ❌ errors in console
- [ ] Sync shows 🚀 → 📊 → ✅ flow

If all checkboxes pass and it still doesn't work, there may be an issue with Strava's API or your specific account. Check <https://status.strava.com>.
