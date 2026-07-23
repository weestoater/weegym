#!/usr/bin/env node

/**
 * Check Strava Activities in Database
 *
 * This script checks if any Strava activities are stored in the database
 * even if connections have been removed.
 *
 * Usage: node scripts/check-strava-activities.js
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

// Load .env file manually
function loadEnvFile(filename) {
  try {
    const envPath = resolve(rootDir, filename);
    const content = readFileSync(envPath, "utf-8");
    const env = {};

    content.split("\n").forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    });

    return env;
  } catch {
    return null;
  }
}

// Try to load environment variables
let env = loadEnvFile(".env") || {};
const envDev = loadEnvFile(".env.development");
const envLocal = loadEnvFile(".env.local");

// Merge in order of precedence
if (envDev) env = { ...env, ...envDev };
if (envLocal) env = { ...env, ...envLocal };

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Supabase credentials not found in .env file");
  console.error(
    "Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActivities() {
  console.log("🔍 Checking Strava activities in database...\n");

  try {
    // Get activity count
    const { count: totalCount, error: countError } = await supabase
      .from("strava_activities")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error counting activities:", countError.message);
      return;
    }

    if (totalCount === 0) {
      console.log("✅ No Strava activities found in database");
      console.log(
        "This is expected if you haven't synced any activities yet.\n",
      );
      return;
    }

    // Get detailed activity info
    const { data: activities, error } = await supabase
      .from("strava_activities")
      .select("*")
      .order("start_date", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Error fetching activities:", error.message);
      return;
    }

    // Get summary stats
    const { data: stats } = await supabase
      .from("strava_activities")
      .select("user_id, type, start_date")
      .order("start_date", { ascending: false });

    const uniqueUsers = new Set(stats?.map((a) => a.user_id) || []);
    const activityTypes = {};
    stats?.forEach((a) => {
      activityTypes[a.type] = (activityTypes[a.type] || 0) + 1;
    });

    const oldestDate =
      stats && stats.length > 0
        ? new Date(stats[stats.length - 1].start_date)
        : null;
    const newestDate =
      stats && stats.length > 0 ? new Date(stats[0].start_date) : null;

    // Display summary
    console.log("📊 Activity Summary:");
    console.log("━".repeat(70));
    console.log(`Total Activities:      ${totalCount}`);
    console.log(`Unique Users:          ${uniqueUsers.size}`);
    console.log(
      `Oldest Activity:       ${oldestDate ? oldestDate.toLocaleString() : "N/A"}`,
    );
    console.log(
      `Newest Activity:       ${newestDate ? newestDate.toLocaleString() : "N/A"}`,
    );
    console.log("━".repeat(70));
    console.log("");

    // Activity types breakdown
    console.log("📋 Activity Types:");
    console.log("━".repeat(70));
    Object.entries(activityTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type.padEnd(20)} ${count}`);
      });
    console.log("━".repeat(70));
    console.log("");

    // Show recent activities
    console.log("📅 Most Recent 10 Activities:");
    console.log("━".repeat(70));
    console.log("Date                  | Type           | Name");
    console.log("━".repeat(70));

    activities.forEach((activity) => {
      const date = new Date(activity.start_date).toLocaleString().padEnd(21);
      const type = (activity.type || "").padEnd(14);
      const name = activity.name || "Unnamed";
      console.log(`${date} | ${type} | ${name}`);
    });
    console.log("━".repeat(70));
    console.log("");

    // Check for orphaned data
    console.log("💡 Data Status:");
    console.log("━".repeat(70));
    if (uniqueUsers.size > 0) {
      console.log(
        `You have ${totalCount} activities from ${uniqueUsers.size} user(s) in the database.`,
      );
      console.log("");
      console.log(
        "Note: These activities remain in the database even if you disconnect",
      );
      console.log("from Strava. They will not be automatically deleted.");
      console.log("");
      console.log("To clear old data:");
      console.log("  1. Use the Supabase SQL Editor");
      console.log(
        "  2. Run: DELETE FROM strava_activities WHERE user_id = 'your-user-id';",
      );
    }
    console.log("━".repeat(70));
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
    console.error(err);
  }
}

// Run the check
checkActivities();
