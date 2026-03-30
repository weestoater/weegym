# Supabase Not Responding - Diagnostic Guide

## Quick Diagnostics Checklist

### ✅ Step 1: Check Browser Console

1. Open http://localhost:5174/weegym/ in your browser
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Look for the Supabase Configuration Check:

```
🔧 Supabase Configuration Check:
URL exists: true
Key exists: true
URL starts with: https://huqmjtxwly...
```

**If you see `false` for either:** Environment variables not loaded → Restart dev server

**If you see errors like:**

- `"Failed to fetch"` → Supabase project might be paused
- `"new row violates row-level security policy"` → Authentication issue
- `"Invalid API key"` → Check your .env.local file

### ✅ Step 2: Check Supabase Project Status

**Most Common Issue: Project Paused**

Free tier Supabase projects pause after 1 week of inactivity.

1. Go to https://supabase.com/dashboard
2. Sign in
3. Click on your **weegym** project
4. **If you see "Project Paused":**
   - Click **Resume Project**
   - Wait 30-60 seconds
   - Refresh your app

### ✅ Step 3: Test Supabase Connection

#### Option A: Run Direct Test Query

From bash terminal:

```bash
curl "https://huqmjtxwlybjtmouwgaz.supabase.co/rest/v1/workouts?limit=1" \
  -H "apikey: YOUR_ANON_KEY_HERE" \
  -H "Authorization: Bearer YOUR_ANON_KEY_HERE"
```

Replace `YOUR_ANON_KEY_HERE` with your actual key from .env.local

**Expected Response:**

- If project is active and RLS disabled: `[]` or workout data
- If RLS enabled and not authenticated: `[]` or error about RLS
- If project paused or bad key: No response or error

#### Option B: Check Network Tab

1. In browser DevTools, click **Network** tab
2. Filter by "supabase"
3. Try using the app (log a workout, view history)
4. Look for requests to `supabase.co`

**Check the status codes:**

- ✅ 200/201 = Success
- ❌ 403 = RLS blocking (need to login)
- ❌ 401 = Bad API key
- ❌ 500/timeout = Project paused or down

### ✅ Step 4: Row Level Security Check

Your app has RLS enabled for security. This requires authentication.

**Are you logged in?**

- Check if you see a Login page
- Check browser console for user status

**Quick Test: Temporarily Disable RLS**

⚠️ **TESTING ONLY** - Do not use in production!

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `scripts/disable-rls-test.sql`
3. Try your app again
4. If it works now, the issue is authentication, not Supabase

**To re-enable RLS after testing:**

```sql
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_wellbeing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
```

### ✅ Step 5: Verify Environment Variables

```bash
# From project root
cat .env.local
```

**Should show:**

```
VITE_SUPABASE_URL=https://huqmjtxwlybjtmouwgaz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...  (very long key)
```

**Common mistakes:**

- ❌ File named `.env` instead of `.env.local`
- ❌ Quotes around values
- ❌ Missing `VITE_` prefix
- ❌ Spaces around `=`

**Fix:** Edit .env.local, save, restart dev server

### ✅ Step 6: Restart Everything

Sometimes it just needs a fresh start:

```bash
# Stop dev server (Ctrl+C)
# Then:
npm run dev
```

## Common Error Messages & Solutions

### "Failed to fetch" / "Network error"

**Causes:**

1. Supabase project paused → Resume in dashboard
2. Internet connection issue → Check network
3. Blocked by firewall → Check security settings

### "new row violates row-level security policy"

**Cause:** RLS is enabled but you're not logged in

**Solutions:**

1. Login to the app first
2. OR temporarily disable RLS for testing (see Step 4)
3. OR check `docs/multi_user_auth_setup.md` for authentication setup

### "Invalid API key"

**Causes:**

1. Wrong key in .env.local → Get fresh key from Supabase dashboard
2. Environment variables not loaded → Restart dev server
3. Key truncated/corrupted → Copy entire key carefully

**Fix:**

1. Go to Supabase Dashboard → Settings → API
2. Copy the **anon public** key
3. Update .env.local
4. Restart server

### "CORS error"

**Cause:** Supabase project URL mismatch

**Fix:** Verify VITE_SUPABASE_URL matches your project exactly

## Advanced Debugging

### Check Supabase Logs

1. Supabase Dashboard → Logs
2. Select **API Logs** or **Database Logs**
3. Look for failed requests matching your timestamp

### Test with Supabase Studio

1. Supabase Dashboard → Table Editor
2. Try manually inserting data into `workouts` table
3. If manual insert works, issue is in your app
4. If manual insert fails, issue is in Supabase setup

### Verify Tables Exist

Supabase Dashboard → Table Editor

Should see:

- ✅ workouts
- ✅ active_wellbeing_sessions
- ✅ user_settings

If missing, run `supabase-config/schema.sql` in SQL Editor

## Still Not Working?

### Collect This Information:

1. **Browser console errors** (screenshot or copy text)
2. **Network tab** showing failed requests
3. **Supabase dashboard status** (Active, Paused, etc.)
4. **Are other Supabase projects working?** (test with a fresh project)

### Create Fresh Test Project

Sometimes the quickest fix is a new Supabase project:

1. Create new Supabase project
2. Run `supabase-config/schema.sql`
3. Update .env.local with new URL/key
4. Restart dev server
5. Test

## Need More Help?

Check these docs:

- [docs/supabase_setup.md](./supabase_setup.md) - Initial setup guide
- [docs/testing_supabase.md](./testing_supabase.md) - Testing checklist
- [docs/env_troubleshooting.md](./env_troubleshooting.md) - Environment variable help
- [docs/multi_user_auth_setup.md](./multi_user_auth_setup.md) - Authentication setup
