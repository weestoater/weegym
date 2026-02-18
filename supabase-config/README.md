# WeeGym Supabase Configuration Package

A portable, reusable Supabase configuration package for the WeeGym application. This package can be used across multiple projects to connect to the same Supabase instance and perform data migrations.

## 📦 Package Contents

```
supabase-config/
├── config.js         # Configuration validation and loading
├── client.js         # Supabase client factory
├── database.js       # Database operations (workouts, sessions, settings)
├── auth.js           # Authentication operations
├── schema.sql        # Complete database schema
├── package.json      # Package metadata and dependencies
└── README.md         # This file
```

## 🚀 Quick Start

### 1. Installation

#### Option A: Copy to Another Project

```bash
# From your new project directory
cp -r /path/to/weegym/supabase-config ./

# Install dependencies
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

#### Option B: Use as NPM Package (Future)

```bash
npm install /path/to/weegym/supabase-config
# or
yarn add file:/path/to/weegym/supabase-config
```

### 2. Set Up Environment Variables

Create a `.env` or `.env.local` file in your project root:

```env
# For Vite projects
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# For Next.js projects
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Initialize Database Schema

Run the SQL schema in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Click **Run** to create all tables and policies

## 💻 Usage Examples

### Basic Setup

```javascript
import { getSupabaseClient } from "./supabase-config/client.js";
import createDatabaseService from "./supabase-config/database.js";
import createAuthService from "./supabase-config/auth.js";

// Get Supabase client (singleton)
const supabase = getSupabaseClient();

// Create service instances
const db = createDatabaseService(supabase);
const auth = createAuthService(supabase);
```

### Using with Environment Variables

```javascript
import { createSupabaseClientFromEnv } from "./supabase-config/client.js";

// Automatically loads from VITE_SUPABASE_* or NEXT_PUBLIC_SUPABASE_*
const supabase = createSupabaseClientFromEnv(true); // true = debug mode
```

### Using with Manual Configuration

```javascript
import { createSupabaseClient } from "./supabase-config/client.js";

const supabase = createSupabaseClient({
  url: "https://your-project.supabase.co",
  anonKey: "your-anon-key",
  options: {
    auth: {
      persistSession: true,
    },
  },
});
```

### Authentication Examples

```javascript
import { getSupabaseClient } from "./supabase-config/client.js";
import createAuthService from "./supabase-config/auth.js";

const supabase = getSupabaseClient();
const auth = createAuthService(supabase);

// Sign up
await auth.signUp("user@example.com", "password", { name: "John Doe" });

// Sign in
await auth.signIn("user@example.com", "password");

// Get current user
const user = await auth.getUser();

// Sign out
await auth.signOut();

// Listen to auth changes
const subscription = auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  console.log("Session:", session);
});

// Unsubscribe
subscription.unsubscribe();
```

### Database Operations Examples

```javascript
import { getSupabaseClient } from "./supabase-config/client.js";
import createDatabaseService from "./supabase-config/database.js";

const supabase = getSupabaseClient();
const db = createDatabaseService(supabase);

// Save a workout
const workout = await db.saveWorkout({
  date: new Date().toISOString(),
  name: "Chest Day",
  duration: 3600, // seconds
  exercises: [
    { name: "Bench Press", sets: 3, reps: 10 },
    { name: "Push-ups", sets: 3, reps: 15 },
  ],
});

// Get all workouts
const workouts = await db.getWorkouts();

// Get workouts by date range
const workoutsInRange = await db.getWorkoutsByDateRange(
  "2026-01-01",
  "2026-12-31",
);

// Delete a workout
await db.deleteWorkout(workoutId);

// Save active wellbeing session
const session = await db.saveActiveWellbeingSession({
  machine: "Rowing",
  mode: "Endurance",
  score: 850,
  date: new Date().toISOString(),
});

// Get all sessions
const sessions = await db.getActiveWellbeingSessions();

// Get user settings
const settings = await db.getUserSettings();

// Save user settings
await db.saveUserSettings({
  defaultRestTime: 90,
  shortRestTime: 60,
  longRestTime: 120,
});
```

## 🔄 Data Migration

### Exporting Data from WeeGym

```javascript
import { getSupabaseClient } from "./supabase-config/client.js";
import createDatabaseService from "./supabase-config/database.js";
import fs from "fs";

const supabase = getSupabaseClient();
const db = createDatabaseService(supabase);

async function exportData() {
  const workouts = await db.getWorkouts();
  const sessions = await db.getActiveWellbeingSessions();
  const settings = await db.getUserSettings();

  const exportData = {
    workouts,
    sessions,
    settings,
    exportedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "weegym-data-export.json",
    JSON.stringify(exportData, null, 2),
  );

  console.log("Data exported successfully!");
}

exportData();
```

### Importing Data to Your CMS

```javascript
import { createSupabaseClient } from "./supabase-config/client.js";
import createDatabaseService from "./supabase-config/database.js";
import fs from "fs";

const supabase = createSupabaseClient({
  url: "https://your-cms-project.supabase.co",
  anonKey: "your-cms-anon-key",
});

const db = createDatabaseService(supabase);

async function importData() {
  const data = JSON.parse(fs.readFileSync("weegym-data-export.json", "utf8"));

  // Import workouts
  for (const workout of data.workouts) {
    await db.saveWorkout(workout);
  }

  // Import sessions
  for (const session of data.sessions) {
    await db.saveActiveWellbeingSession(session);
  }

  // Import settings
  if (data.settings) {
    await db.saveUserSettings(data.settings);
  }

  console.log("Data imported successfully!");
}

importData();
```

## 🏗️ Using in Different Frameworks

### React (Vite)

```javascript
// src/config/supabase.js
import { getSupabaseClient } from "../supabase-config/client.js";
import createDatabaseService from "../supabase-config/database.js";

export const supabase = getSupabaseClient();
export const db = createDatabaseService(supabase);
```

### Next.js

```javascript
// lib/supabase.js
import { createSupabaseClient } from "../supabase-config/client.js";
import createDatabaseService from "../supabase-config/database.js";

const supabase = createSupabaseClient({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const db = createDatabaseService(supabase);
export default supabase;
```

### Node.js (Backend)

```javascript
// services/supabase.js
import { createSupabaseClient } from "./supabase-config/client.js";
import createDatabaseService from "./supabase-config/database.js";

const supabase = createSupabaseClient({
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
});

export const db = createDatabaseService(supabase);
```

## 🔒 Security Notes

- **Never commit `.env` files** - Add to `.gitignore`
- **Use environment variables** for all credentials
- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Anonymous key is safe for client-side use

## 📝 API Reference

### Configuration Module (`config.js`)

- `validateConfig(config)` - Validates Supabase configuration
- `loadConfigFromEnv()` - Loads config from environment variables
- `createConfig(config)` - Creates and validates configuration
- `debugConfig(config)` - Debug utility for configuration

### Client Module (`client.js`)

- `createSupabaseClient(config, debug)` - Creates new client instance
- `getSupabaseClient(config, debug)` - Gets or creates singleton client
- `resetSupabaseClient()` - Resets singleton (useful for testing)
- `createSupabaseClientFromEnv(debug)` - Creates client from env vars

### Database Module (`database.js`)

#### Workouts

- `saveWorkout(workoutData)` - Save a workout
- `getWorkouts()` - Get all workouts
- `getWorkoutsByDateRange(startDate, endDate)` - Get workouts in range
- `deleteWorkout(id)` - Delete a workout

#### Active Wellbeing

- `saveActiveWellbeingSession(sessionData)` - Save a session
- `getActiveWellbeingSessions()` - Get all sessions
- `deleteActiveWellbeingSession(id)` - Delete a session

#### Settings

- `getUserSettings()` - Get user settings
- `saveUserSettings(settings)` - Save/update settings

### Auth Module (`auth.js`)

- `signUp(email, password, metadata)` - Register new user
- `signIn(email, password)` - Sign in user
- `signOut()` - Sign out current user
- `getSession()` - Get current session
- `getUser()` - Get current user
- `onAuthStateChange(callback)` - Listen to auth changes
- `resetPassword(email)` - Send password reset email
- `updateUser(updates)` - Update user information
- `isAuthenticated()` - Check if user is logged in

## 🎯 Use Cases

### 1. Data Migration Tool

Create a script to migrate data from WeeGym to your CMS:

```javascript
import { getSupabaseClient as getWeeGymClient } from "./weegym/supabase-config/client.js";
import { createSupabaseClient as getCMSClient } from "./supabase-config/client.js";
import createDatabaseService from "./supabase-config/database.js";

const weeGymSupabase = getWeeGymClient();
const cmsSupabase = getCMSClient({
  url: "https://cms-project.supabase.co",
  anonKey: "cms-key",
});

const weeGymDb = createDatabaseService(weeGymSupabase);
const cmsDb = createDatabaseService(cmsSupabase);

// Copy data
const workouts = await weeGymDb.getWorkouts();
for (const workout of workouts) {
  await cmsDb.saveWorkout(workout);
}
```

### 2. Multi-Project Data Access

Use the same Supabase instance from multiple projects:

```javascript
// Both projects use the same configuration
import { getSupabaseClient } from "./supabase-config/client.js";

// Project A and Project B can access the same data
const supabase = getSupabaseClient();
```

### 3. Testing Environment

Create a test suite that connects to a test Supabase instance:

```javascript
import { createSupabaseClient } from "./supabase-config/client.js";

const testSupabase = createSupabaseClient({
  url: "https://test-project.supabase.co",
  anonKey: "test-anon-key",
});
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contributing

Feel free to extend this package with additional features:

- Additional table schemas
- Migration utilities
- Data validation helpers
- Batch operation support

## 📄 License

This package is part of the WeeGym project.
