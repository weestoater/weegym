# Quick Start: Calorie Tracker Setup

## Step 1: Run Database Migration

1. Log in to your Supabase Dashboard
2. Navigate to the **SQL Editor**
3. Open the file: `supabase-config/food_logs_schema.sql`
4. Copy the entire content
5. Paste it into the SQL Editor
6. Click **Run** to execute the script

This will create the `food_logs` table with all necessary security policies.

## Step 2: Verify Installation

The following has already been completed:

- ✅ `html5-qrcode` package installed
- ✅ CalorieTracker page created
- ✅ BarcodeScanner component added
- ✅ Nutrition API service integrated
- ✅ Navigation updated with Calories tab

## Step 3: Test the Feature

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Log in to the app

3. Navigate to the **Calories** tab (chart icon 📈)

4. Try the different methods:
   - **Scan Barcode**: Requires camera permissions
   - **Search Food**: Try searching "coca cola" or "banana"
   - **Manual Entry**: Add a custom food item

## Step 4: Grant Camera Permissions (for Barcode Scanner)

### On Desktop

- Browser will prompt for camera access
- Click "Allow" when prompted
- Make sure you're using HTTPS or localhost

### On Mobile

- Browser will request camera permission
- Go to Settings → Browser → Permissions if needed
- Ensure camera access is enabled

## Troubleshooting

### "Product not found" when scanning

- Try a different barcode or search by name
- Not all products are in the Open Food Facts database
- Use manual entry as a fallback

### Camera not working

- Ensure you're using HTTPS (or localhost for development)
- Check browser permissions
- Try using "Enter Manually Instead" button

### Database errors

- Verify the SQL migration ran successfully
- Check Supabase logs for RLS policy issues
- Ensure user is authenticated

## Next Steps

1. **Set Daily Goals**: Consider adding a settings page for calorie goals
2. **Track Progress**: View your daily summaries and trends
3. **Contribute**: Help improve Open Food Facts by adding missing products

## File Structure

```
weegym/
├── src/
│   ├── pages/
│   │   └── CalorieTracker.jsx          # Main page
│   ├── components/
│   │   └── BarcodeScanner.jsx          # Barcode scanner
│   ├── services/
│   │   └── nutritionService.js         # API integration
│   └── App.jsx                         # Updated with routes
├── supabase-config/
│   └── food_logs_schema.sql            # Database migration
└── docs/
    ├── calorie_tracker.md              # Full documentation
    └── QUICK_START_CALORIE_TRACKER.md  # This file
```

## Support

For detailed documentation, see: `docs/calorie_tracker.md`

For Open Food Facts API: https://wiki.openfoodfacts.org/API

---

**You're all set!** 🎉 Start tracking your calories and nutrition today!
