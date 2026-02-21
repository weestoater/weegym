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

## Step 3.1: Enable Slimming World Syns (Optional)

If you want to track Slimming World Syns:

1. For **new installations**: The syns field is already included in the schema
2. For **existing installations**: Run the migration:
   - Open `supabase-config/add-slimming-world-syns.sql`
   - Copy and run in Supabase SQL Editor
3. The Syns field will appear in the food entry form
4. When syns are logged, they'll display with a ⭐ star icon
5. Daily totals will show your total syns at the bottom of the summary card

**Note**: Syns tracking is optional - leave the field blank if not using Slimming World.

## Step 4: Grant Camera Permissions (for Barcode Scanner)

### Important: HTTPS Required

Camera access requires a secure connection (HTTPS) or localhost. Most hosting platforms (GitHub Pages, Netlify, Vercel) automatically provide HTTPS.

### On Desktop Browsers

#### Google Chrome / Microsoft Edge

1. Navigate to the Calorie Tracker page
2. Click "Scan Barcode"
3. A popup appears asking for camera permission
4. Click **"Allow"**
5. If blocked accidentally:
   - Click the 🔒 or camera icon in the address bar
   - Find "Camera" and select "Allow"
   - Refresh the page

#### Firefox

1. Click "Scan Barcode"
2. Click **"Allow"** in the permission popup
3. If blocked:
   - Click the camera icon in address bar
   - Select "Allow" for camera
   - Refresh page

#### Safari (macOS)

1. Click "Scan Barcode"
2. Select **"Allow"** when prompted
3. If blocked:
   - Safari → Settings → Websites → Camera
   - Find your site and select "Allow"

### On Mobile Devices

#### iOS (iPhone/iPad) - Safari

1. **First Time**: When you click "Scan Barcode", iOS will ask for permission
   - Tap **"Allow"**
2. **If Permission Denied**:
   - Go to **Settings** app
   - Scroll down and tap **Safari**
   - Tap **"Camera"**
   - Select **"Ask"** or **"Allow"**
3. **Per-Site Settings**:
   - In Safari, go to the calorie tracker
   - Tap **"aA"** in the address bar
   - Tap **"Website Settings"**
   - Tap **"Camera"** and select **"Allow"**

#### iOS - Chrome/Firefox

1. Go to **Settings** app
2. Scroll down to **Chrome** or **Firefox**
3. Toggle **"Camera"** ON
4. Reopen the app and try scanning again

#### Android - Chrome

1. **First Time**: Tap "Scan Barcode", then tap **"Allow"**

2. **If Permission Denied**:
   - Tap the 🔒 icon next to the URL
   - Tap **"Permissions"**
   - Find **"Camera"** and tap it
   - Select **"Allow"**
3. **Via Android Settings**:
   - Open **Settings** app
   - Tap **"Apps"** or **"Applications"**
   - Find and tap **"Chrome"**
   - Tap **"Permissions"**
   - Tap **"Camera"**
   - Select **"Allow"**

#### Android - Firefox

1. Tap menu (three dots)
2. Tap **"Settings"**
3. Tap **"Site permissions"**
4. Tap **"Camera"**
5. Ensure it's set to **"Ask to allow"** or **"Allowed"**

#### Android - Samsung Internet

1. Tap the three-line menu
2. Tap **"Settings"**
3. Tap **"Sites and downloads"**
4. Tap **"Site permissions"**
5. Tap **"Camera"**
6. Select **"Ask first"** or **"Allowed"**

### Common Issues & Solutions

#### Camera Permission Popup Not Appearing

- **Clear browser cache** and reload the page
- **Check browser settings** - camera might be globally blocked
- Ensure using **HTTPS** (not HTTP)
- Try a different browser

#### Camera Works But Can't Scan

- Ensure good lighting
- Hold barcode steady and flat
- Try moving camera closer/further away
- Some barcodes (damaged/unusual) may not scan - use manual entry

#### "Camera Not Available" Error

- Another app might be using the camera - close other apps
- Restart your browser or device
- Check if device has a physical camera cover or privacy switch

### Testing Camera Access

Before using the app, test camera access:

- Visit: https://www.onlinemictest.com/webcam-test/
- Grant permission when asked
- If camera works there but not in the app, check site-specific permissions

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
