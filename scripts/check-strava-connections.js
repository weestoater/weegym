#!/usr/bin/env node

/**
 * Check Strava Connections Status
 *
 * This script checks how many athletes are connected to your Strava app
 * in the Supabase database and helps identify quota usage.
 *
 * Usage: node scripts/check-strava-connections.js
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

async function checkConnections() {
  console.log("🔍 Checking Strava connections...\n");

  try {
    // Get all connections
    const { data: connections, error } = await supabase
      .from("strava_connections")
      .select("*")
      .order("connected_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching connections:", error.message);
      return;
    }

    if (!connections || connections.length === 0) {
      console.log("✅ No Strava connections found in database");
      console.log("You should be able to connect without issues.\n");
      return;
    }

    // Count unique athletes
    const uniqueAthletes = new Set(connections.map((c) => c.athlete_id));
    const uniqueUsers = new Set(connections.map((c) => c.user_id));

    // Display summary
    console.log("📊 Connection Summary:");
    console.log("━".repeat(60));
    console.log(`Total Connections:     ${connections.length}`);
    console.log(`Unique Athletes:       ${uniqueAthletes.size}`);
    console.log(`Unique Users:          ${uniqueUsers.size}`);
    console.log(
      `First Connection:      ${new Date(connections[connections.length - 1].connected_at).toLocaleString()}`,
    );
    console.log(
      `Latest Connection:     ${new Date(connections[0].connected_at).toLocaleString()}`,
    );
    console.log("━".repeat(60));
    console.log("");

    // Quota warning
    if (uniqueAthletes.size >= 15) {
      console.log(
        "⚠️  WARNING: Approaching or exceeded typical development quota (15-30 athletes)",
      );
      console.log(
        "   You may need to clean up old connections or request a quota increase.\n",
      );
    } else if (uniqueAthletes.size >= 10) {
      console.log("⚠️  NOTICE: Getting close to development quota limit");
      console.log(
        `   You have ${uniqueAthletes.size}/~15 athletes connected.\n`,
      );
    } else {
      console.log(
        `✅ You have ${uniqueAthletes.size} athletes connected (under typical limit).\n`,
      );
    }

    // List all connections
    console.log("📋 All Connections:");
    console.log("━".repeat(60));
    console.log("Athlete ID    | User ID (first 8)     | Connected At");
    console.log("━".repeat(60));

    connections.forEach((conn) => {
      const athleteId = conn.athlete_id.toString().padEnd(13);
      const userId = conn.user_id.substring(0, 8).padEnd(21);
      const connectedAt = new Date(conn.connected_at).toLocaleString();
      console.log(`${athleteId} | ${userId} | ${connectedAt}`);
    });
    console.log("━".repeat(60));
    console.log("");

    // Check for duplicates
    if (connections.length > uniqueAthletes.size) {
      console.log("⚠️  DUPLICATES DETECTED:");
      console.log(
        `   You have ${connections.length - uniqueAthletes.size} duplicate athlete connections.`,
      );
      console.log(
        "   Some athletes may be connected multiple times (same athlete, different users).\n",
      );
    }

    // Next steps
    console.log("💡 Next Steps:");
    console.log("━".repeat(60));
    if (uniqueAthletes.size >= 15) {
      console.log("1. Visit https://www.strava.com/settings/api");
      console.log("2. Remove old/test athlete connections");
      console.log(
        "3. Or email developers@strava.com to request quota increase",
      );
      console.log(
        "4. See docs/STRAVA_QUOTA_LIMIT.md for detailed instructions",
      );
    } else {
      console.log("You should be able to add more connections.");
      console.log("If you're still getting quota errors:");
      console.log(
        "1. Check https://www.strava.com/settings/api for your app status",
      );
      console.log("2. You may have connections not shown in this database");
      console.log("3. See docs/STRAVA_QUOTA_LIMIT.md for help");
    }
    console.log("━".repeat(60));
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
  }
}

// Run the check
checkConnections();
