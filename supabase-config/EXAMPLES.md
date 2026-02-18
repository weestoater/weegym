# Usage Examples

Complete examples for common use cases.

## Example 1: Basic Setup in New Project

```javascript
// app.js
import {
  getSupabaseClient,
  createDatabaseService,
} from "./supabase-config/index.js";

// Initialize
const supabase = getSupabaseClient();
const db = createDatabaseService(supabase);

// Use it
const workouts = await db.getWorkouts();
console.log(`You have ${workouts.length} workouts`);
```

## Example 2: React Component with Hooks

```jsx
// hooks/useWorkouts.js
import { useState, useEffect } from "react";
import { getSupabaseClient } from "../supabase-config/client.js";
import createDatabaseService from "../supabase-config/database.js";

const supabase = getSupabaseClient();
const db = createDatabaseService(supabase);

export function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    try {
      const data = await db.getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addWorkout(workoutData) {
    const newWorkout = await db.saveWorkout(workoutData);
    setWorkouts([newWorkout, ...workouts]);
  }

  async function removeWorkout(id) {
    await db.deleteWorkout(id);
    setWorkouts(workouts.filter((w) => w.id !== id));
  }

  return { workouts, loading, addWorkout, removeWorkout };
}
```

```jsx
// components/WorkoutList.jsx
import { useWorkouts } from "../hooks/useWorkouts";

export function WorkoutList() {
  const { workouts, loading, addWorkout, removeWorkout } = useWorkouts();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Workouts ({workouts.length})</h1>
      {workouts.map((workout) => (
        <div key={workout.id}>
          <h3>{workout.name}</h3>
          <p>{new Date(workout.date).toLocaleDateString()}</p>
          <button onClick={() => removeWorkout(workout.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Example 3: Authentication Flow

```jsx
// contexts/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "../supabase-config/client.js";
import createAuthService from "../supabase-config/auth.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseClient();
  const auth = createAuthService(supabase);

  useEffect(() => {
    // Check current session
    auth.getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const subscription = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

## Example 4: Multi-Project Data Access

```javascript
// sync-tool.js
import { createSupabaseClient } from "./supabase-config/client.js";
import createDatabaseService from "./supabase-config/database.js";

// Connect to multiple Supabase instances
const prodSupabase = createSupabaseClient({
  url: process.env.PROD_SUPABASE_URL,
  anonKey: process.env.PROD_SUPABASE_KEY,
});

const devSupabase = createSupabaseClient({
  url: process.env.DEV_SUPABASE_URL,
  anonKey: process.env.DEV_SUPABASE_KEY,
});

const prodDb = createDatabaseService(prodSupabase);
const devDb = createDatabaseService(devSupabase);

// Copy production data to dev
async function syncProdToDev() {
  const prodWorkouts = await prodDb.getWorkouts();

  for (const workout of prodWorkouts) {
    const { id, user_id, created_at, ...data } = workout;
    await devDb.saveWorkout(data);
  }

  console.log(`Synced ${prodWorkouts.length} workouts to dev`);
}

syncProdToDev();
```

## Example 5: Node.js CLI Tool

```javascript
#!/usr/bin/env node
// bin/weegym-stats.js
import { createSupabaseClientFromEnv } from "../supabase-config/client.js";
import createDatabaseService from "../supabase-config/database.js";
import createAuthService from "../supabase-config/auth.js";

const supabase = createSupabaseClientFromEnv();
const db = createDatabaseService(supabase);
const auth = createAuthService(supabase);

async function showStats() {
  // Sign in
  await auth.signIn(process.env.USER_EMAIL, process.env.USER_PASSWORD);

  // Get data
  const workouts = await db.getWorkouts();
  const sessions = await db.getActiveWellbeingSessions();

  // Calculate stats
  const totalWorkoutTime = workouts.reduce((sum, w) => sum + w.duration, 0);
  const avgWorkoutTime = totalWorkoutTime / workouts.length;

  console.log("📊 Your WeeGym Statistics");
  console.log("========================");
  console.log(`Total Workouts: ${workouts.length}`);
  console.log(`Total Sessions: ${sessions.length}`);
  console.log(`Total Time: ${Math.round(totalWorkoutTime / 3600)} hours`);
  console.log(`Avg Workout: ${Math.round(avgWorkoutTime / 60)} minutes`);

  await auth.signOut();
}

showStats();
```

## Example 6: Data Backup Script

```javascript
// scripts/backup.js
import { getSupabaseClient } from "../supabase-config/client.js";
import createDatabaseService from "../supabase-config/database.js";
import fs from "fs";
import path from "path";

const supabase = getSupabaseClient();
const db = createDatabaseService(supabase);

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const backupDir = "./backups";

  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  // Export all data
  const data = {
    workouts: await db.getWorkouts(),
    sessions: await db.getActiveWellbeingSessions(),
    settings: await db.getUserSettings(),
    backup_date: timestamp,
  };

  // Save to file
  const filename = path.join(backupDir, `backup-${timestamp}.json`);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));

  console.log(`✅ Backup created: ${filename}`);
  console.log(`   - Workouts: ${data.workouts.length}`);
  console.log(`   - Sessions: ${data.sessions.length}`);
}

// Run backup
createBackup();

// Or schedule it
import cron from "node-cron";

// Backup every day at 2am
cron.schedule("0 2 * * *", () => {
  console.log("Running scheduled backup...");
  createBackup();
});
```

## Example 7: Test Setup

```javascript
// test/setup.js
import {
  createSupabaseClient,
  resetSupabaseClient,
} from "../supabase-config/client.js";
import { beforeEach, afterAll } from "vitest";

// Use test database
beforeEach(() => {
  resetSupabaseClient();
  const testSupabase = createSupabaseClient({
    url: process.env.TEST_SUPABASE_URL,
    anonKey: process.env.TEST_SUPABASE_KEY,
  });
});

afterAll(async () => {
  // Cleanup test data
  const supabase = getSupabaseClient();
  await supabase.from("workouts").delete().neq("id", 0);
});

// test/database.test.js
import { test, expect } from "vitest";
import { getSupabaseClient } from "../supabase-config/client.js";
import createDatabaseService from "../supabase-config/database.js";

test("can save and retrieve workout", async () => {
  const supabase = getSupabaseClient();
  const db = createDatabaseService(supabase);

  const workout = await db.saveWorkout({
    date: new Date().toISOString(),
    name: "Test Workout",
    duration: 3600,
    exercises: [],
  });

  expect(workout).toBeDefined();
  expect(workout.name).toBe("Test Workout");

  const workouts = await db.getWorkouts();
  expect(workouts.length).toBeGreaterThan(0);
});
```

## Example 8: Next.js API Route

```javascript
// pages/api/workouts.js
import { createSupabaseClient } from "../../supabase-config/client.js";
import createDatabaseService from "../../supabase-config/database.js";

export default async function handler(req, res) {
  const supabase = createSupabaseClient();
  const db = createDatabaseService(supabase);

  if (req.method === "GET") {
    const workouts = await db.getWorkouts();
    res.status(200).json(workouts);
  } else if (req.method === "POST") {
    const workout = await db.saveWorkout(req.body);
    res.status(201).json(workout);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
```

## Example 9: Real-time Updates

```javascript
// services/realtimeWorkouts.js
import { getSupabaseClient } from "../supabase-config/client.js";

const supabase = getSupabaseClient();

export function subscribeToWorkouts(callback) {
  const subscription = supabase
    .from("workouts")
    .on("*", (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}

// Usage in React
import { useEffect, useState } from "react";
import { subscribeToWorkouts } from "../services/realtimeWorkouts";

function WorkoutFeed() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToWorkouts((payload) => {
      if (payload.eventType === "INSERT") {
        setWorkouts((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "DELETE") {
        setWorkouts((prev) => prev.filter((w) => w.id !== payload.old.id));
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      {workouts.map((workout) => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </div>
  );
}
```

## More Examples

See the [main README](README.md) for more detailed examples and API documentation.
