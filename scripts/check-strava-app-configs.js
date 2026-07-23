#!/usr/bin/env node

/**
 * Check Strava app configurations in database
 * Verifies if the strava_app_configs table exists and shows configured apps
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load environment variables from .env file
 */
function loadEnvFile() {
  try {
    const envPath = join(__dirname, "..", ".env");
    const envContent = readFileSync(envPath, "utf8");

    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, "");
          process.env[key.trim()] = cleanValue;
        }
      }
    });
  } catch (err) {
    console.error("Failed to load .env file:", err.message);
    process.exit(1);
  }
}

/**
 * Check strava_app_configs table
 */
async function checkAppConfigs() {
  loadEnvFile();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "❌ Missing Supabase credentials in .env file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log("🔍 Checking Strava app configurations...\n");

  try {
    const { data, error } = await supabase
      .from("strava_app_configs")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        // Table doesn't exist
        console.error("❌ Table 'strava_app_configs' does not exist");
        console.log("\n📋 Next steps:");
        console.log("1. Open Supabase Dashboard → SQL Editor");
        console.log("2. Execute: supabase-config/add-strava-app-configs.sql");
        console.log("3. Run this script again to verify\n");
        process.exit(1);
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("⚠️  No app configurations found in database");
      console.log("\nThe table exists but is empty.");
      console.log(
        "This might mean the SQL script was run without the seed data.",
      );
      console.log(
        "\n💡 To add the default configuration, run the SQL script again:",
      );
      console.log("   supabase-config/add-strava-app-configs.sql\n");
      return;
    }

    console.log(`✅ Found ${data.length} app configuration(s):\n`);

    data.forEach((config, index) => {
      console.log(`${index + 1}. ${config.app_name}`);
      console.log(`   Client ID: ${config.client_id}`);
      console.log(`   Active: ${config.is_active ? "✅ Yes" : "❌ No"}`);
      console.log(
        `   Description: ${config.description || "(no description)"}`,
      );
      console.log(
        `   Created: ${new Date(config.created_at).toLocaleString()}`,
      );
      console.log("");
    });

    const activeApps = data.filter((c) => c.is_active);
    if (activeApps.length === 0) {
      console.log("⚠️  Warning: No active app configuration found!");
      console.log(
        "You need to set one app as active before connecting to Strava.\n",
      );
    } else if (activeApps.length > 1) {
      console.log(
        "⚠️  Warning: Multiple active apps found! Only one should be active.",
      );
      console.log(
        "The database trigger should prevent this, but something went wrong.\n",
      );
    }
  } catch (err) {
    console.error("❌ Error checking app configs:", err.message);
    process.exit(1);
  }
}

checkAppConfigs();
