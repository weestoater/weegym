# Strava Webhooks Setup Guide

## Overview

Strava webhooks enable **real-time activity updates** without manual syncing. When you upload a new activity to Strava, it will automatically appear in WeeGym within seconds.

**Benefits:**

- ✅ Instant activity updates (no manual sync needed)
- ✅ Automatic updates when you edit activities in Strava
- ✅ Automatic deletions sync
- ✅ Reduces API rate limit usage

---

## Architecture

```text
Strava Activity Upload
    ↓
Strava sends webhook event
    ↓
Supabase Edge Function (strava-webhook)
    ↓
Fetches activity details from Strava API
    ↓
Updates WeeGym database
    ↓
Activity appears in your WeeGym dashboard
```

---

## Prerequisites

1. **Supabase Project** - Already set up ✅
2. **Strava Developer Account** - Already set up ✅
3. **Supabase CLI** - Need to install (instructions below)
4. **Public webhook endpoint** - Will be created by deploying Edge Function

---

## Step 1: Install Supabase CLI

### Windows (using npm)

```bash
npm install -g supabase
```

### Verify installation

```bash
supabase --version
```

---

## Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate with Supabase.

---

## Step 3: Link Your Project

```bash
# Run from project root
cd d:/git/aws/weegym
supabase link --project-ref YOUR_PROJECT_ID
```

**Find your Project ID:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your WeeGym project
3. Settings → General → Reference ID

---

## Step 4: Set Environment Variables

The Edge Function needs these environment secrets:

```bash
# Set Strava credentials
supabase secrets set STRAVA_CLIENT_ID=your_strava_client_id
supabase secrets set STRAVA_CLIENT_SECRET=your_strava_client_secret

# Supabase credentials (get from dashboard)
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Get Service Role Key:**

1. Supabase Dashboard → Settings → API
2. Copy the `service_role` key (NOT the anon public key)
3. ⚠️ **IMPORTANT:** Keep this secret! Never commit it to git.

---

## Step 5: Deploy Edge Function

```bash
# Deploy the webhook function
supabase functions deploy strava-webhook
```

**Result:** You'll get a URL like:

```text
https://your-project-ref.supabase.co/functions/v1/strava-webhook
```

**Save this URL** - you'll need it in the next step!

---

## Step 6: Update Database Schema

Run the SQL migration in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-config/add-strava-webhooks.sql`
3. Run the query

This adds webhook tracking fields to `strava_connections` table.

---

## Step 7: Subscribe to Webhooks (UI Method)

We'll add a UI button for this in the next step. For now, you can test using the browser console:

1. Go to WeeGym → Strava Connect page
2. Open browser console (F12)
3. Run:

```javascript
import { subscribeToWebhooks } from "./services/stravaService.js";

const webhookUrl =
  "https://YOUR-PROJECT.supabase.co/functions/v1/strava-webhook";
subscribeToWebhooks(webhookUrl)
  .then((result) => console.log("✅ Subscribed:", result))
  .catch((error) => console.error("❌ Error:", error));
```

---

## Step 8: Test the Webhook

### Test 1: Upload a new activity to Strava

1. Go to Strava mobile app or website
2. Upload a new activity
3. Wait 5-10 seconds
4. Check WeeGym → Strava Activities
5. Your new activity should appear automatically! 🎉

### Test 2: Edit an activity

1. In Strava, edit an activity name
2. Wait a few seconds
3. Refresh WeeGym - name should be updated

### Test 3: Delete an activity

1. Delete an activity in Strava
2. Wait a few seconds
3. Refresh WeeGym - activity should be removed

---

## Step 9: Add UI Controls (Optional)

Add webhook controls to `src/pages/StravaConnect.jsx`:

```jsx
import {
  subscribeToWebhooks,
  unsubscribeFromWebhooks,
  hasActiveWebhook,
} from "../services/stravaService";

// In component
const [hasWebhook, setHasWebhook] = useState(false);

useEffect(() => {
  hasActiveWebhook().then(setHasWebhook);
}, []);

const handleSubscribeWebhook = async () => {
  const webhookUrl = "YOUR_WEBHOOK_URL";
  await subscribeToWebhooks(webhookUrl);
  setHasWebhook(true);
  alert("✅ Webhooks enabled! Activities will sync automatically.");
};

// In render
{
  hasWebhook ? (
    <div className="alert alert-success">🔔 Real-time sync enabled</div>
  ) : (
    <button onClick={handleSubscribeWebhook}>Enable Real-Time Sync</button>
  );
}
```

---

## Monitoring & Debugging

### View Edge Function Logs

```bash
supabase functions logs strava-webhook
```

### Check Active Subscriptions

In browser console:

```javascript
import { viewWebhookSubscriptions } from "./services/stravaService.js";
viewWebhookSubscriptions().then(console.log);
```

### Unsubscribe (if needed)

```javascript
import { unsubscribeFromWebhooks } from "./services/stravaService.js";
unsubscribeFromWebhooks(SUBSCRIPTION_ID);
```

---

## Troubleshooting

### "Failed to subscribe: 400 Bad Request"

**Cause:** Webhook URL not publicly accessible or already subscribed

**Fix:**

1. Make sure Edge Function is deployed
2. Check if you already have a subscription (only 1 allowed per app)
3. View subscriptions and delete old ones if needed

### Webhook receives events but activities don't appear

**Check:**

1. Edge Function logs: `supabase functions logs strava-webhook`
2. Look for errors in the logs
3. Verify environment variables are set correctly
4. Check database permissions (RLS policies)

### Token expired errors

**Cause:** Access token needs refresh

**Fix:** The Edge Function automatically handles token refresh. If it persists:

1. Check `STRAVA_CLIENT_SECRET` is set correctly
2. Verify token refresh logic in Edge Function

---

## Rate Limits

**Strava API Limits:**

- 100 requests per 15 minutes
- 1,000 requests per day

**Webhooks don't count against these limits!** 🎉

Each webhook event triggers 1 API call (to fetch activity details), but only when you upload/edit/delete activities, not on every page load.

---

## Security Notes

1. ✅ Webhook endpoint is public (required by Strava)
2. ✅ Verification token prevents unauthorized requests
3. ✅ HTTPS required (Supabase Edge Functions use HTTPS by default)
4. ✅ Service role key stored as secret (not in code)
5. ✅ Row Level Security (RLS) on database tables

---

## Cost Considerations

**Supabase Free Tier:**

- 500,000 Edge Function invocations/month
- More than enough for webhook usage

**Typical usage:**

- Upload 1 activity/day = 30 webhook events/month
- Well within free tier limits

---

## Advanced: Multiple Users

The webhook handles multiple users automatically:

1. Webhook receives event with `owner_id` (Strava athlete ID)
2. Looks up user by `athlete_id` in `strava_connections` table
3. Updates activities for that specific user
4. Each user's activities are isolated by `user_id` (RLS policies)

---

## Rollback / Disable

To disable webhooks:

```javascript
// Get subscription ID
const subs = await viewWebhookSubscriptions();
const subId = subs[0]?.id;

// Unsubscribe
await unsubscribeFromWebhooks(subId);
```

To completely remove:

```bash
# Delete Edge Function
supabase functions delete strava-webhook
```

---

## Next Steps

After webhooks are working:

1. ✅ Remove "Sync Activities" button (no longer needed)
2. 📱 Add "Real-time sync enabled" badge to UI
3. 📊 Add webhook status indicator on dashboard
4. 🔔 Consider adding browser notifications for new activities

---

## Support

**Edge Function Code:** `supabase/functions/strava-webhook/index.ts`  
**Service Methods:** `src/services/stravaService.js` (webhook management section)  
**Database Migration:** `supabase-config/add-strava-webhooks.sql`

**Strava Webhooks Docs:** <https://developers.strava.com/docs/webhooks/>

---

**Status:** Ready to Deploy 🚀
