# Quick Start: Data Migration Guide

This guide will help you quickly migrate data from WeeGym to your new CMS.

## Step 1: Copy the Package

```bash
# Copy the entire supabase-config folder to your new project
cp -r /path/to/weegym/supabase-config /path/to/your-cms/

# Or if you're working in your CMS project already:
cd your-cms-project
cp -r /path/to/weegym/supabase-config ./
```

## Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

## Step 3: Set Up Your Source Environment

Create a `.env.weegym` file with your WeeGym Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-weegym-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-weegym-anon-key
```

## Step 4: Export Data from WeeGym

```bash
# Load WeeGym environment
export $(cat .env.weegym | xargs)

# Run export
cd supabase-config
node migrate-data.js export
```

This creates a `weegym-data-export.json` file with all your data.

## Step 5: Set Up Your Destination Database

### Option A: New Supabase Project

1. Create a new Supabase project for your CMS
2. Run the schema.sql in the SQL Editor:

```bash
# Copy the SQL
cat supabase-config/schema.sql

# Go to Supabase Dashboard > SQL Editor > Paste and Run
```

### Option B: Existing Database

Adapt the schema.sql to your needs or create migration scripts.

## Step 6: Import Data to CMS

Create a `.env.cms` file with your CMS Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-cms-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-cms-anon-key
```

Import the data:

```bash
# Load CMS environment
export $(cat .env.cms | xargs)

# Run import
cd supabase-config
node migrate-data.js import
```

## Step 7: Verify Migration

```bash
# Compare exported vs imported data
node migrate-data.js compare
```

## Advanced: Custom Migration Script

For custom data transformations, create your own script:

```javascript
// custom-migrate.js
import { createSupabaseClient } from "./supabase-config/client.js";
import createDatabaseService from "./supabase-config/database.js";
import fs from "fs";

// Source (WeeGym)
const sourceSupabase = createSupabaseClient({
  url: "https://weegym-project.supabase.co",
  anonKey: "weegym-key",
});

// Destination (CMS)
const destSupabase = createSupabaseClient({
  url: "https://cms-project.supabase.co",
  anonKey: "cms-key",
});

const sourceDb = createDatabaseService(sourceSupabase);
const destDb = createDatabaseService(destSupabase);

// Migrate with transformations
const workouts = await sourceDb.getWorkouts();
for (const workout of workouts) {
  // Transform data for your CMS
  const transformed = {
    ...workout,
    // Add custom fields
    source: "weegym",
    importedAt: new Date().toISOString(),
  };

  await destDb.saveWorkout(transformed);
}
```

## Troubleshooting

### Error: "No user is currently authenticated"

You need to sign in before exporting/importing:

```javascript
// Add to migrate-data.js before export/import
import createAuthService from "./auth.js";

const auth = createAuthService(supabase);
await auth.signIn("your-email@example.com", "your-password");
```

### Error: "Invalid API key"

Double-check your environment variables:

```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Large Data Sets

For large datasets, modify the import script to use batch operations:

```javascript
// Import in batches of 100
const batchSize = 100;
for (let i = 0; i < workouts.length; i += batchSize) {
  const batch = workouts.slice(i, i + batchSize);
  await Promise.all(batch.map((w) => db.saveWorkout(w)));
}
```

## Next Steps

1. **Integrate with your CMS**: Use the database service in your CMS
2. **Customize schema**: Add/modify tables in schema.sql for your needs
3. **Set up sync**: Create real-time sync between systems if needed
4. **Archive old data**: Keep WeeGym as archive, use CMS for new data

## Example: Real-time Sync

If you want to keep both systems in sync:

```javascript
import { getSupabaseClient } from "./supabase-config/client.js";

const weeGymSupabase = getSupabaseClient({
  url: "weegym-url",
  anonKey: "weegym-key",
});

// Listen for changes in WeeGym
weeGymSupabase
  .from("workouts")
  .on("INSERT", (payload) => {
    // Forward to CMS
    cmsDb.saveWorkout(payload.new);
  })
  .subscribe();
```

## Support

- Check the [main README](README.md) for detailed API documentation
- Review [schema.sql](schema.sql) for database structure
- Examine [database.js](database.js) for available operations
