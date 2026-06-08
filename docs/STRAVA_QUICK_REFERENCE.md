# Strava Integration - Quick Reference

> **TL;DR:** Enhanced reliability with timeout handling, automatic retry, better logging, and configuration validation.

---

## 🚀 Quick Start

### Check Your Configuration

```bash
npm run strava:check-config
```

**Look for:**

- ✅ All green checkmarks = good to go
- ❌ Red X = missing required config
- ⚠️ Yellow warning = review recommended

### Start Development Server

```bash
npm run dev
```

**Check browser console for:**

```text
✅ Strava config loaded: { clientId: "239101", ... }
```

**❌ If you see:**

```text
❌ STRAVA CONFIGURATION ERROR:
Missing required environment variables:
  - VITE_STRAVA_CLIENT_ID
```

**Fix:** Copy `.env.example` to `.env` and fill in values

---

## 🔍 Console Log Indicators

| Emoji | Meaning   | Action                      |
| ----- | --------- | --------------------------- |
| ✅    | Success   | All good!                   |
| ❌    | Error     | Check full error message    |
| ⚠️    | Warning   | Review but not critical     |
| 🚀    | Starting  | Operation beginning         |
| 🔑    | Token     | Auth operation              |
| 📅    | Date/Time | Timestamp info              |
| 🌐    | Network   | API request                 |
| 📊    | Data      | Data received               |
| 💾    | Database  | DB operation                |
| 🏆    | Records   | PR checking                 |
| 🔄    | Retry     | Automatic retry in progress |
| ⏱️    | Timeout   | Request took too long       |

---

## ❌ Common Errors & Quick Fixes

### "Strava is not configured"

**Fix:** Set environment variables in `.env`:

```env
VITE_STRAVA_CLIENT_ID=your-client-id
VITE_STRAVA_CLIENT_SECRET=your-client-secret
VITE_STRAVA_REDIRECT_URI=http://localhost:5173/strava/callback
```

Then restart dev server.

### "Strava connection not found"

**Fix:** Connect your Strava account in the app.

### "Token refresh failed"

**Fix:** Disconnect and reconnect Strava in app.

### "Request timeout"

**Cause:** Strava API slow or network issues  
**Action:** Wait - automatic retry will attempt 3 times

### "redirect_uri mismatch"

**Fix:**

1. Check `.env`: `VITE_STRAVA_REDIRECT_URI`
2. Go to <https://www.strava.com/settings/api>
3. Set "Authorization Callback Domain" to `localhost` (dev) or your domain (prod)

---

## 🌍 Environment Configuration

### Local Development

```env
VITE_STRAVA_REDIRECT_URI=http://localhost:5173/strava/callback
```

### Production (GitHub Pages)

```env
VITE_STRAVA_REDIRECT_URI=https://weestoater.github.io/weegym/strava/callback
```

### Production (Custom Domain)

```env
VITE_STRAVA_REDIRECT_URI=https://yourdomain.com/strava/callback
```

**Important:** Must match EXACTLY in both `.env` AND Strava API settings!

---

## 🧪 Testing Checklist

- [ ] Configuration check passes: `npm run strava:check-config`
- [ ] Browser console shows: `✅ Strava config loaded`
- [ ] Can connect Strava account (OAuth flow works)
- [ ] Can sync activities (see sync progress in console)
- [ ] Activities appear in app
- [ ] No ❌ errors in console

---

## 📱 What Changed?

### Before

- Silent failures when config missing
- Hung indefinitely on slow API
- Generic error messages
- Race conditions on token refresh
- No retry on network errors

### After

- ✅ Clear error messages at startup
- ✅ 30-second timeout with automatic retry
- ✅ Detailed logging with emoji indicators
- ✅ Single-token-refresh promise (no races)
- ✅ Automatic retry on network errors (3 attempts)

---

## 🔧 Tools Added

### Configuration Checker

```bash
npm run strava:check-config
```

Validates all environment variables and redirect URI format.

### Credential Tester (if available)

```bash
npm run strava:test-creds
```

Tests actual API credentials.

---

## 📚 Full Documentation

- **Troubleshooting Guide:** `docs/STRAVA_TROUBLESHOOTING.md`
- **Complete Summary:** `docs/STRAVA_FIXES_SUMMARY.md`
- **Deployment Guide:** `DEPLOY.md`

---

## 🆘 Still Having Issues?

1. **Check Strava API Status:** <https://status.strava.com>
2. **Review Rate Limits:** 100 requests per 15 minutes
3. **Full Troubleshooting Guide:** `docs/STRAVA_TROUBLESHOOTING.md`
4. **Check Console Logs:** Look for detailed error messages with ❌
5. **Verify Credentials:** <https://www.strava.com/settings/api>

---

## 💡 Pro Tips

1. **Always check console first** - detailed logs show exactly what's happening
2. **Restart dev server** after changing `.env` files
3. **Use emoji indicators** to quickly scan for issues in console
4. **Run config checker** before debugging other issues
5. **Set both local and production URIs** in Strava API settings

---

## ⚡ Quick Commands

```bash
# Check configuration
npm run strava:check-config

# Start development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to production
npm run deploy
```

---

**Last Updated:** June 8, 2026  
**See Also:** `docs/STRAVA_TROUBLESHOOTING.md` for comprehensive troubleshooting
