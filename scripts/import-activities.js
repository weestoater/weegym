#!/usr/bin/env node

/**
 * Import Activities from Multiple Sources
 *
 * Supports:
 * - Strava bulk export (CSV)
 * - GPX files
 * - Manual JSON data
 *
 * Features:
 * - Automatic duplicate detection
 * - Merge data from multiple sources
 * - Preserve all historical activities
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load environment variables
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
 * Find duplicate activities using smart detection
 */
async function findDuplicates(supabase, userId, activity) {
  try {
    const { data, error } = await supabase.rpc("find_duplicate_activities", {
      p_user_id: userId,
      p_start_date: activity.start_date,
      p_type: activity.type,
      p_distance: activity.distance,
      p_moving_time: activity.moving_time,
      p_tolerance_seconds: 300, // 5 minutes
    });

    if (error) {
      console.warn(
        "⚠️  Duplicate detection function not available:",
        error.message,
      );
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn("⚠️  Error checking for duplicates:", err.message);
    return [];
  }
}

/**
 * Import activities from Strava CSV export
 *
 * To get your Strava data:
 * 1. Go to https://www.strava.com/athlete/delete_your_account
 * 2. Click "Request Your Archive"
 * 3. Wait for email with download link
 * 4. Extract activities.csv from the archive
 */
async function importFromStravaCSV(filePath, userId, appName = "imported") {
  console.log(`📊 Reading CSV file: ${filePath}`);

  const csvContent = readFileSync(filePath, "utf8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📝 Found ${records.length} activities in CSV`);

  loadEnvFile();
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
  );

  let imported = 0;
  let duplicates = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    try {
      // Map CSV columns to our schema
      const activity = {
        user_id: userId,
        app_name: appName,
        strava_id: parseInt(record["Activity ID"]) || null,
        name: record["Activity Name"] || "Imported Activity",
        type: record["Activity Type"] || "Ride",
        start_date: record["Activity Date"] || record["Activity Timestamp"],
        distance: parseFloat(record["Distance"]) * 1000 || null, // Convert km to meters
        moving_time: parseFloat(record["Moving Time"]) || null,
        elapsed_time: parseFloat(record["Elapsed Time"]) || null,
        total_elevation_gain: parseFloat(record["Elevation Gain"]) || null,
        average_speed: parseFloat(record["Average Speed"]) || null,
        max_speed: parseFloat(record["Max Speed"]) || null,
        average_heartrate: parseFloat(record["Average Heart Rate"]) || null,
        max_heartrate: parseFloat(record["Max Heart Rate"]) || null,
        calories: parseFloat(record["Calories"]) || null,
        import_source: "csv_import",
        original_source_id: record["Activity ID"],
        activity_data: record, // Store full CSV row
        synced_at: new Date().toISOString(),
      };

      // Check for duplicates
      const dupes = await findDuplicates(supabase, userId, activity);

      if (dupes.length > 0) {
        console.log(
          `⏭️  Skipping duplicate [${i + 1}/${records.length}]: ${activity.name} (${dupes[0].similarity_score}% match)`,
        );
        duplicates++;
        continue;
      }

      // Insert activity
      const { error } = await supabase
        .from("strava_activities")
        .insert(activity);

      if (error) {
        console.error(`❌ Error importing activity ${i + 1}:`, error.message);
        errors++;
      } else {
        console.log(
          `✅ Imported [${i + 1}/${records.length}]: ${activity.name}`,
        );
        imported++;
      }

      // Rate limiting - pause every 10 activities
      if ((i + 1) % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error(`❌ Error processing activity ${i + 1}:`, err.message);
      errors++;
    }
  }

  console.log("\n📊 Import Summary:");
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped (duplicates): ${duplicates}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total processed: ${records.length}`);
}

/**
 * Import activities from JSON array
 *
 * Format:
 * [
 *   {
 *     "name": "Morning Ride",
 *     "type": "Ride",
 *     "start_date": "2024-07-01T10:00:00Z",
 *     "distance": 15000,
 *     "moving_time": 3600,
 *     "calories": 450
 *   },
 *   ...
 * ]
 */
async function importFromJSON(filePath, userId, appName = "manual_import") {
  console.log(`📄 Reading JSON file: ${filePath}`);

  const jsonContent = readFileSync(filePath, "utf8");
  const activities = JSON.parse(jsonContent);

  if (!Array.isArray(activities)) {
    throw new Error("JSON file must contain an array of activities");
  }

  console.log(`📝 Found ${activities.length} activities in JSON`);

  loadEnvFile();
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
  );

  let imported = 0;
  let duplicates = 0;
  let errors = 0;

  for (let i = 0; i < activities.length; i++) {
    const activity = {
      ...activities[i],
      user_id: userId,
      app_name: appName,
      import_source: "manual_import",
      synced_at: new Date().toISOString(),
    };

    try {
      // Check for duplicates
      const dupes = await findDuplicates(supabase, userId, activity);

      if (dupes.length > 0) {
        console.log(
          `⏭️  Skipping duplicate [${i + 1}/${activities.length}]: ${activity.name}`,
        );
        duplicates++;
        continue;
      }

      // Insert activity
      const { error } = await supabase
        .from("strava_activities")
        .insert(activity);

      if (error) {
        console.error(`❌ Error importing activity ${i + 1}:`, error.message);
        errors++;
      } else {
        console.log(
          `✅ Imported [${i + 1}/${activities.length}]: ${activity.name}`,
        );
        imported++;
      }
    } catch (err) {
      console.error(`❌ Error processing activity ${i + 1}:`, err.message);
      errors++;
    }
  }

  console.log("\n📊 Import Summary:");
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped (duplicates): ${duplicates}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total processed: ${activities.length}`);
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log("🔄 Strava Activity Importer");
    console.log("\nUsage:");
    console.log(
      "  node import-activities.js <format> <file-path> <user-id> [app-name]",
    );
    console.log("\nFormats:");
    console.log("  csv  - Strava CSV export (from archive)");
    console.log("  json - JSON array of activities");
    console.log("\nExamples:");
    console.log(
      '  node import-activities.js csv activities.csv "123e4567-e89b-12d3-a456-426614174000"',
    );
    console.log(
      '  node import-activities.js json old-account.json "123e4567-e89b-12d3-a456-426614174000" "old_account"',
    );
    console.log("\nNotes:");
    console.log("  - Run the SQL migration first: unified-activities-view.sql");
    console.log("  - Activities are automatically checked for duplicates");
    console.log(
      "  - Duplicate detection uses: start time, type, distance, duration",
    );
    process.exit(1);
  }

  const [format, filePath, userId, appName = "imported"] = args;

  try {
    if (format === "csv") {
      await importFromStravaCSV(filePath, userId, appName);
    } else if (format === "json") {
      await importFromJSON(filePath, userId, appName);
    } else {
      console.error(`❌ Unknown format: ${format}`);
      console.log('Supported formats: "csv", "json"');
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Import failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
