# Quick Setup Guide - Syns Tracker

## What Changed?

Your app has been updated to prioritize **Slimming World syns tracking** over calories. The navigation menu now says "Syns Tracker" and the daily summary prominently displays your syn usage.

## Step 1: Apply Database Migration (1 minute)

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of: `supabase-config/update-slimming-world-default.sql`
5. Click **Run**

## Step 2: Update Your Profile (30 seconds)

1. Open your app and navigate to **Profile Manager** (`/profile-manager`)
2. In the Profile tab, scroll down to:
   - ✅ Check "On Slimming World"
   - Set "Daily Syns Allowance" to **30** (or your personal allowance)
3. Click **Save Profile**

## Step 3: Start Tracking!

Navigate to **Syns Tracker** in the menu and start logging your food. The app will now:

- Show syns prominently in the daily summary
- Display remaining syns with color-coded badges
- Track your syn intake vs. your daily allowance
- Still provide calorie and nutrition information as secondary data

## Features Available

✅ **Barcode Scanning** - Scan product barcodes to instantly log food  
✅ **Food Search** - Search the Open Food Facts database  
✅ **Manual Entry** - Enter food details manually  
✅ **Auto-calculation** - Syns automatically calculated from nutrition data  
✅ **Daily Allowances** - Configurable per user (min: 15, your default: 30)

## What's Next?

Review the other prompts in the `prompts/` folder to implement:

- **Meal Recommendation System** - Smart suggestions based on remaining syns
- **Accessibility Features** - Screen reader support, keyboard navigation
- **Smart Guidance** - Free food suggestions when approaching limit
- **Testing & Validation** - Comprehensive accessibility testing

Each prompt file contains detailed requirements for that feature.

---

**Need Help?**

- Check `prompts/IMPLEMENTATION_SUMMARY.md` for technical details
- Review `prompts/README.md` for overall plan
- See `docs/QUICK_START_CALORIE_TRACKER.md` for database setup (same table used)
