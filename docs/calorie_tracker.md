# Calorie Tracker Feature

## Overview

The Calorie Tracker is a comprehensive feature that allows users to log their daily food intake and track nutritional information. It integrates with the **Open Food Facts API** to provide access to a vast database of food products with detailed nutritional data.

## Features

### 1. **Barcode Scanning**

- Scan product barcodes using your device camera
- Automatically fetch nutritional information from Open Food Facts database
- Supports all major barcode formats (UPC, EAN, etc.)

### 2. **Food Search**

- Search the Open Food Facts database by product name
- Browse search results with images and nutritional summaries
- Select products to add to your log

### 3. **Manual Entry**

- Add custom foods not found in the database
- Enter all nutritional values manually
- Useful for home-cooked meals or local products

### 4. **Daily Tracking**

- View daily nutritional summaries (calories, protein, carbs, fat)
- Track meals by type (breakfast, lunch, dinner, snack)
- View history of logged foods
- Delete entries as needed

### 5. **Multi-User Support**

- Each user has their own food log
- Data is securely stored and isolated per user
- Works with the existing WeeGym multi-user authentication

## Installation & Setup

### 1. Database Setup

Run the SQL migration script in your Supabase SQL Editor:

```bash
# Location: supabase-config/food_logs_schema.sql
```

This will create:

- `food_logs` table with all nutritional fields
- Row Level Security (RLS) policies for user data isolation
- Indexes for optimized queries
- A `daily_food_summary` view for aggregated data

### 2. Dependencies

The following package has been installed:

- `html5-qrcode` - For barcode scanning functionality

### 3. Navigation

The Calorie Tracker has been added to the main navigation bar with a chart icon (📈).

## Usage

### Scanning a Barcode

1. Navigate to the Calorie Tracker page
2. Tap "Scan Barcode"
3. Allow camera permissions when prompted
4. Position the barcode within the frame
5. The product information will load automatically
6. Review and adjust quantity/meal type
7. Tap "Add to Log"

### Searching for Food

1. Tap "Search Food Database"
2. Enter the product name or keywords
3. Browse results and tap on a product
4. Review nutritional information
5. Adjust quantity and meal type
6. Tap "Add to Log"

### Manual Entry

1. Tap "Manual Entry"
2. Fill in product name and nutritional values
3. Set quantity and meal type
4. Add any notes (optional)
5. Tap "Add to Log"

### Viewing Daily Summary

The daily summary card shows:

- Total calories for the day
- Total protein, carbs, and fat (in grams)
- Number of items logged

Use the date picker to view past days.

## Data Structure

### Food Log Entry

Each logged food item contains:

- `product_name` - Name of the product
- `barcode` - Product barcode (if scanned)
- `brand` - Brand name
- `serving_size` - Serving size (e.g., "100g", "1 cup")
- `calories` - Calories per serving
- `protein` - Protein in grams
- `carbohydrates` - Carbohydrates in grams
- `fat` - Fat in grams
- `fiber` - Fiber in grams (optional)
- `sodium` - Sodium in mg (optional)
- `sugar` - Sugar in grams (optional)
- `quantity` - Number of servings
- `meal_type` - breakfast, lunch, dinner, or snack
- `notes` - User notes
- `product_data` - Full JSON data from Open Food Facts

## Open Food Facts API

### About

Open Food Facts is a free, open, collaborative database of food products from around the world. It contains:

- 2.8+ million products
- Nutritional information
- Ingredients lists
- Allergen information
- Product photos
- Nutrition scores (Nutri-Score, NOVA)

### API Details

- **Base URL**: `https://world.openfoodfacts.org/api/v0`
- **Rate Limits**: No strict limits, but be respectful
- **Authentication**: Not required
- **Documentation**: https://wiki.openfoodfacts.org/API

### Example Requests

**Get product by barcode:**

```
GET https://world.openfoodfacts.org/api/v0/product/[barcode].json
```

**Search products:**

```
GET https://world.openfoodfacts.org/api/v0/cgi/search.pl?search_terms=[query]&json=true
```

## Technical Details

### Files Created

1. **Database**
   - `supabase-config/food_logs_schema.sql` - Database schema

2. **Services**
   - `src/services/nutritionService.js` - Open Food Facts API integration

3. **Components**
   - `src/components/BarcodeScanner.jsx` - Barcode scanning component

4. **Pages**
   - `src/pages/CalorieTracker.jsx` - Main calorie tracker page

5. **Documentation**
   - `docs/calorie_tracker.md` - This file

### Security

- All food logs use Row Level Security (RLS)
- Users can only access their own data
- User ID is automatically set from authentication context
- No API keys required for Open Food Facts

### Performance

- Indexes on `user_id` and `date` for fast queries
- Efficient date-based filtering
- Lazy loading of food images
- Debounced search to reduce API calls

## Troubleshooting

### Barcode Scanner Not Working

1. **Check browser permissions**: Ensure camera access is granted
2. **HTTPS required**: Camera access requires secure context (https://)
3. **Good lighting**: Ensure adequate lighting for barcode scanning
4. **Fallback**: Use "Enter Manually Instead" button if scanning fails

### Product Not Found

- Try searching by name instead of barcode
- Use manual entry for unlisted products
- Consider contributing to Open Food Facts by adding missing products

### Camera Permission Denied

1. Check browser settings for camera permissions
2. On mobile, check app permissions in system settings
3. Use manual entry or search as alternative

## Future Enhancements

Possible additions:

- Daily calorie goals and progress tracking
- Meal planning features
- Recipe builder with nutritional calculation
- Export data to CSV
- Weekly/monthly reports
- Integration with workout data for net calories
- Photo-based food recognition (using image AI)
- Favorites and recent foods for quick logging
- Barcode history for frequently scanned items

## Contributing to Open Food Facts

Help improve the database:

1. Visit https://world.openfoodfacts.org
2. Create a free account
3. Add missing products
4. Complete nutritional information
5. Upload product photos
6. Verify existing data

## Support

For issues or questions:

- Check the [Supabase documentation](https://supabase.com/docs)
- Review [Open Food Facts API docs](https://wiki.openfoodfacts.org/API)
- Check browser console for error messages
- Ensure database migration has been run

## License

This feature uses:

- Open Food Facts API (ODbL license)
- html5-qrcode (Apache 2.0 license)
