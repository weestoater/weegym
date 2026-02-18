/**
 * Data Migration Script Example
 *
 * This script demonstrates how to export data from WeeGym Supabase
 * and prepare it for import into another system (like your CMS)
 *
 * Usage:
 * 1. Set up environment variables for source Supabase
 * 2. Run: node migrate-data.js export
 * 3. Review the exported-data.json file
 * 4. Set up environment variables for destination Supabase/CMS
 * 5. Run: node migrate-data.js import
 */

import fs from "fs";
import { getSupabaseClient } from "./client.js";
import createDatabaseService from "./database.js";
import createAuthService from "./auth.js";

const EXPORT_FILE = "weegym-data-export.json";

// ============================================================================
// EXPORT DATA FROM WEEGYM
// ============================================================================

async function exportData() {
  console.log("🔍 Starting data export from WeeGym...\n");

  try {
    const supabase = getSupabaseClient();
    const db = createDatabaseService(supabase);
    const auth = createAuthService(supabase);

    // Check authentication
    const user = await auth.getUser();
    if (!user) {
      console.error("❌ Error: No user is currently authenticated");
      console.log(
        "Please sign in first or ensure auth is configured correctly",
      );
      process.exit(1);
    }

    console.log(`✅ Authenticated as: ${user.email}\n`);

    // Export workouts
    console.log("📦 Exporting workouts...");
    const workouts = await db.getWorkouts();
    console.log(`   Found ${workouts.length} workouts`);

    // Export active wellbeing sessions
    console.log("📦 Exporting active wellbeing sessions...");
    const sessions = await db.getActiveWellbeingSessions();
    console.log(`   Found ${sessions.length} sessions`);

    // Export settings
    console.log("📦 Exporting user settings...");
    const settings = await db.getUserSettings();
    console.log(`   Found settings: ${settings ? "Yes" : "No"}`);

    // Prepare export data
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
        userId: user.id,
        version: "1.0.0",
      },
      data: {
        workouts,
        sessions,
        settings,
      },
      stats: {
        totalWorkouts: workouts.length,
        totalSessions: sessions.length,
        hasSettings: !!settings,
      },
    };

    // Write to file
    fs.writeFileSync(EXPORT_FILE, JSON.stringify(exportData, null, 2));

    console.log(`\n✅ Export complete!`);
    console.log(`📄 Data saved to: ${EXPORT_FILE}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Workouts: ${exportData.stats.totalWorkouts}`);
    console.log(`   - Sessions: ${exportData.stats.totalSessions}`);
    console.log(
      `   - Settings: ${exportData.stats.hasSettings ? "Yes" : "No"}`,
    );
  } catch (error) {
    console.error("❌ Export failed:", error.message);
    process.exit(1);
  }
}

// ============================================================================
// IMPORT DATA TO NEW SYSTEM
// ============================================================================

async function importData() {
  console.log("🔍 Starting data import...\n");

  try {
    // Read export file
    if (!fs.existsSync(EXPORT_FILE)) {
      console.error(`❌ Error: Export file not found: ${EXPORT_FILE}`);
      console.log("Please run export first: node migrate-data.js export");
      process.exit(1);
    }

    const fileContent = fs.readFileSync(EXPORT_FILE, "utf8");
    const exportData = JSON.parse(fileContent);

    console.log(`📄 Loaded export from: ${exportData.metadata.exportedAt}`);
    console.log(`👤 Original user: ${exportData.metadata.exportedBy}\n`);

    // Connect to destination Supabase/CMS
    const supabase = getSupabaseClient();
    const db = createDatabaseService(supabase);
    const auth = createAuthService(supabase);

    // Check authentication
    const user = await auth.getUser();
    if (!user) {
      console.error("❌ Error: No user is currently authenticated");
      console.log("Please sign in first to the destination system");
      process.exit(1);
    }

    console.log(`✅ Authenticated as: ${user.email}\n`);

    // Import workouts
    console.log("📥 Importing workouts...");
    let workoutCount = 0;
    for (const workout of exportData.data.workouts) {
      // Remove system fields before import
      const { id, user_id, created_at, ...workoutData } = workout;
      await db.saveWorkout(workoutData);
      workoutCount++;
      if (workoutCount % 10 === 0) {
        process.stdout.write(
          `   Imported ${workoutCount}/${exportData.data.workouts.length}...\r`,
        );
      }
    }
    console.log(`   Imported ${workoutCount} workouts ✅`);

    // Import sessions
    console.log("📥 Importing active wellbeing sessions...");
    let sessionCount = 0;
    for (const session of exportData.data.sessions) {
      // Remove system fields before import
      const { id, user_id, created_at, ...sessionData } = session;
      await db.saveActiveWellbeingSession(sessionData);
      sessionCount++;
      if (sessionCount % 10 === 0) {
        process.stdout.write(
          `   Imported ${sessionCount}/${exportData.data.sessions.length}...\r`,
        );
      }
    }
    console.log(`   Imported ${sessionCount} sessions ✅`);

    // Import settings
    if (exportData.data.settings) {
      console.log("📥 Importing user settings...");
      const { id, user_id, created_at, updated_at, ...settingsData } =
        exportData.data.settings;

      // Map database field names to the expected format
      const settings = {
        defaultRestTime: settingsData.default_rest_time,
        shortRestTime: settingsData.short_rest_time,
        longRestTime: settingsData.long_rest_time,
      };

      await db.saveUserSettings(settings);
      console.log("   Imported settings ✅");
    }

    console.log(`\n✅ Import complete!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Workouts imported: ${workoutCount}`);
    console.log(`   - Sessions imported: ${sessionCount}`);
    console.log(
      `   - Settings imported: ${exportData.data.settings ? "Yes" : "No"}`,
    );
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// ============================================================================
// COMPARE DATA (Verification)
// ============================================================================

async function compareData() {
  console.log("🔍 Comparing exported data with current database...\n");

  try {
    // Read export file
    if (!fs.existsSync(EXPORT_FILE)) {
      console.error(`❌ Error: Export file not found: ${EXPORT_FILE}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(EXPORT_FILE, "utf8");
    const exportData = JSON.parse(fileContent);

    // Get current data
    const supabase = getSupabaseClient();
    const db = createDatabaseService(supabase);

    const currentWorkouts = await db.getWorkouts();
    const currentSessions = await db.getActiveWellbeingSessions();
    const currentSettings = await db.getUserSettings();

    console.log("📊 Comparison:");
    console.log("");
    console.log("Workouts:");
    console.log(`   Exported: ${exportData.data.workouts.length}`);
    console.log(`   Current:  ${currentWorkouts.length}`);
    console.log("");
    console.log("Sessions:");
    console.log(`   Exported: ${exportData.data.sessions.length}`);
    console.log(`   Current:  ${currentSessions.length}`);
    console.log("");
    console.log("Settings:");
    console.log(`   Exported: ${exportData.data.settings ? "Yes" : "No"}`);
    console.log(`   Current:  ${currentSettings ? "Yes" : "No"}`);
  } catch (error) {
    console.error("❌ Comparison failed:", error.message);
    process.exit(1);
  }
}

// ============================================================================
// CLI
// ============================================================================

const command = process.argv[2];

console.log("");
console.log("╔════════════════════════════════════════╗");
console.log("║   WeeGym Data Migration Tool           ║");
console.log("╚════════════════════════════════════════╝");
console.log("");

switch (command) {
  case "export":
    await exportData();
    break;
  case "import":
    await importData();
    break;
  case "compare":
    await compareData();
    break;
  default:
    console.log("Usage:");
    console.log("  node migrate-data.js export   - Export data from WeeGym");
    console.log("  node migrate-data.js import   - Import data to new system");
    console.log(
      "  node migrate-data.js compare  - Compare exported vs current",
    );
    console.log("");
    console.log("Make sure to set environment variables before running:");
    console.log("  VITE_SUPABASE_URL=...");
    console.log("  VITE_SUPABASE_ANON_KEY=...");
    break;
}
