/**
 * FIT File Parser Service
 * Uses @garmin/fitsdk to parse Garmin FIT files and map to database schema
 *
 * FIT files contain:
 * - Activity files: Individual workouts (cycling, running, walking)
 * - Monitoring files: Daily wellness data (steps, heart rate)
 *
 * @module fitParser
 */

import { Stream, Decoder } from "@garmin/fitsdk";
import { supabase } from "../lib/supabaseClient";

/**
 * Activity type mapping from FIT to Strava-compatible types
 * Maps Garmin activity types to match existing database schema
 */
const ACTIVITY_TYPE_MAP = {
  cycling: "Ride",
  running: "Run",
  walking: "Walk",
  hiking: "Hike",
  swimming: "Swim",
  generic: "Workout",
  // Add more as needed
};

/**
 * Parse a FIT file and return structured data
 * @param {File} file - FIT file from user upload
 * @returns {Promise<Object>} Parsed FIT data with type information
 */
export async function parseFitFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const stream = Stream.fromByteArray(new Uint8Array(arrayBuffer));
        const decoder = new Decoder(stream);

        const { messages, errors } = decoder.read();

        if (errors && errors.length > 0) {
          console.warn("FIT parsing warnings:", errors);
        }

        // Log messages structure to understand format
        console.log("📦 FIT Messages structure:", Object.keys(messages));

        // Determine file type and extract data
        const result = classifyAndExtractFitData(messages, file.name);
        resolve(result);
      } catch (error) {
        console.error("Error parsing FIT file:", error);
        reject(new Error(`Failed to parse FIT file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Classify FIT file type and extract relevant data
 * @param {Object} messages - Decoded FIT messages (object with message type arrays)
 * @param {string} filename - Original filename
 * @returns {Object} Classified data with type and extracted information
 */
function classifyAndExtractFitData(messages, filename) {
  // FIT SDK returns messages as an object with keys like 'sessionMesgs', 'recordMesgs', etc.
  // Convert to flat array with messageType property
  const messageArray = [];

  for (const [key, msgArray] of Object.entries(messages)) {
    if (Array.isArray(msgArray)) {
      // Extract message type from key (e.g., 'sessionMesgs' -> 'session')
      const messageType = key.replace(/Mesgs?$/, "");
      msgArray.forEach((msg) => {
        messageArray.push({ ...msg, messageType });
      });
    }
  }

  console.log(`📊 Parsed ${messageArray.length} total messages`);

  // Check for session message (indicates activity file)
  const sessionMessages = messageArray.filter(
    (m) => m.messageType === "session",
  );

  // Check for monitoring messages (indicates daily wellness file)
  const monitoringMessages = messageArray.filter(
    (m) => m.messageType === "monitoring",
  );

  console.log(`🏃 Session messages: ${sessionMessages.length}`);
  console.log(`📈 Monitoring messages: ${monitoringMessages.length}`);

  if (sessionMessages.length > 0) {
    // Activity file
    return {
      type: "activity",
      filename,
      data: extractActivityData(messageArray),
    };
  } else if (monitoringMessages.length > 0) {
    // Monitoring file (daily steps, heart rate, etc.)
    return {
      type: "monitoring",
      filename,
      data: extractMonitoringData(messageArray),
    };
  } else {
    throw new Error(
      "Unknown FIT file type - no session or monitoring data found",
    );
  }
}

/**
 * Extract activity data from FIT messages
 * Maps to strava_activities table schema
 * @param {Array} messages - FIT messages
 * @returns {Object} Activity data
 */
function extractActivityData(messages) {
  const sessionMsg = messages.find((m) => m.messageType === "session");
  const recordMessages = messages.filter((m) => m.messageType === "record");
  const lapMessages = messages.filter((m) => m.messageType === "lap");

  if (!sessionMsg) {
    throw new Error("No session data found in activity file");
  }

  // Extract heart rate data from records
  const heartRates = recordMessages
    .map((r) => r.heartRate)
    .filter((hr) => hr && hr > 0);

  const avgHeartRate =
    heartRates.length > 0
      ? heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
      : null;

  const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : null;

  // Extract GPS coordinates for route mapping
  const coordinates = recordMessages
    .filter((r) => r.positionLat && r.positionLong)
    .map((r) => ({
      lat: convertSemicirclesToDegrees(r.positionLat),
      lng: convertSemicirclesToDegrees(r.positionLong),
      elevation: r.altitude || null,
      timestamp: r.timestamp ? new Date(r.timestamp) : null,
    }));

  // Map activity type
  const sport = sessionMsg.sport || "generic";
  const activityType = ACTIVITY_TYPE_MAP[sport.toLowerCase()] || "Workout";

  return {
    name: generateActivityName(sessionMsg, lapMessages),
    type: activityType,
    sport: sport,
    startDate: sessionMsg.startTime
      ? new Date(sessionMsg.startTime)
      : new Date(),
    distance: sessionMsg.totalDistance || 0, // meters
    movingTime: Math.round(
      sessionMsg.totalMovingTime || sessionMsg.totalElapsedTime || 0,
    ), // seconds - INTEGER
    elapsedTime: Math.round(sessionMsg.totalElapsedTime || 0), // seconds - INTEGER
    totalElevationGain: sessionMsg.totalAscent || 0, // meters
    averageSpeed: sessionMsg.avgSpeed || calculateAverageSpeed(sessionMsg), // m/s
    maxSpeed: sessionMsg.maxSpeed || 0, // m/s
    averageHeartRate: avgHeartRate,
    maxHeartRate: maxHeartRate,
    calories: sessionMsg.totalCalories || null,
    coordinates: coordinates.length > 0 ? coordinates : null,
    rawData: {
      session: sessionMsg,
      recordCount: recordMessages.length,
      lapCount: lapMessages.length,
    },
  };
}

/**
 * Extract daily monitoring data from FIT messages
 * Maps to daily_steps table schema
 * @param {Array} messages - FIT messages
 * @returns {Object} Daily monitoring data
 */
function extractMonitoringData(messages) {
  const monitoringMessages = messages.filter(
    (m) => m.messageType === "monitoring",
  );

  if (monitoringMessages.length === 0) {
    throw new Error("No monitoring data found");
  }

  // Group by date and aggregate
  const dataByDate = {};

  monitoringMessages.forEach((msg) => {
    if (!msg.timestamp) return;

    const date = new Date(msg.timestamp).toISOString().split("T")[0];

    if (!dataByDate[date]) {
      dataByDate[date] = {
        steps: 0,
        distance: 0,
        activeTime: 0,
        calories: 0,
        samples: 0,
      };
    }

    if (msg.steps !== undefined) {
      dataByDate[date].steps += msg.steps;
    }
    if (msg.distance !== undefined) {
      dataByDate[date].distance += msg.distance / 100; // Convert to meters
    }
    if (msg.activeTime !== undefined) {
      dataByDate[date].activeTime += msg.activeTime;
    }
    if (msg.calories !== undefined) {
      dataByDate[date].calories += msg.calories;
    }
    dataByDate[date].samples++;
  });

  // Convert to array format
  return Object.keys(dataByDate).map((date) => ({
    date: date,
    totalSteps: Math.round(dataByDate[date].steps),
    distanceMeters: Math.round(dataByDate[date].distance),
    activeMinutes: Math.round(dataByDate[date].activeTime / 60),
    caloriesBurned: Math.round(dataByDate[date].calories),
    samples: dataByDate[date].samples,
  }));
}

/**
 * Import parsed activity data to database
 * @param {string} userId - User ID
 * @param {Object} activityData - Parsed activity data
 * @param {string} source - Data source identifier
 * @returns {Promise<Object>} Import result
 */
export async function importActivityToDb(
  userId,
  activityData,
  source = "garmin_fit",
) {
  try {
    // Create a pseudo strava_id from timestamp to maintain uniqueness
    const stravaId = Date.now() + Math.floor(Math.random() * 1000);

    const activity = {
      user_id: userId,
      strava_id: stravaId,
      name: activityData.name,
      type: activityData.type,
      start_date: activityData.startDate.toISOString(),
      distance: activityData.distance,
      moving_time: activityData.movingTime,
      elapsed_time: activityData.elapsedTime,
      total_elevation_gain: activityData.totalElevationGain,
      average_speed: activityData.averageSpeed,
      max_speed: activityData.maxSpeed,
      average_heartrate: activityData.averageHeartRate,
      max_heartrate: activityData.maxHeartRate,
      calories: activityData.calories,
      activity_data: {
        source: source,
        sport: activityData.sport,
        coordinates: activityData.coordinates,
        raw: activityData.rawData,
      },
    };

    const { data, error } = await supabase
      .from("strava_activities")
      .insert([activity])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      activity: data,
      type: "activity",
    };
  } catch (error) {
    console.error("Error importing activity:", error);
    throw new Error(`Failed to import activity: ${error.message}`);
  }
}

/**
 * Import daily steps data to database
 * @param {string} userId - User ID
 * @param {Array} dailyData - Array of daily step data
 * @returns {Promise<Object>} Import result
 */
export async function importDailyStepsToDb(userId, dailyData) {
  try {
    const records = dailyData.map((day) => ({
      user_id: userId,
      date: day.date,
      total_steps: day.totalSteps,
      distance_meters: day.distanceMeters,
      active_minutes: day.activeMinutes,
      calories_burned: day.caloriesBurned,
    }));

    // Use upsert to handle duplicates
    const { data, error } = await supabase
      .from("daily_steps")
      .upsert(records, {
        onConflict: "user_id,date",
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;

    return {
      success: true,
      count: data.length,
      records: data,
      type: "monitoring",
    };
  } catch (error) {
    console.error("Error importing daily steps:", error);
    throw new Error(`Failed to import daily steps: ${error.message}`);
  }
}

/**
 * Main import function - handles both activity and monitoring files
 * @param {string} userId - User ID
 * @param {File} file - FIT file to import
 * @returns {Promise<Object>} Import result with details
 */
export async function importFitFile(userId, file) {
  try {
    // Parse the FIT file
    const parsed = await parseFitFile(file);

    if (parsed.type === "activity") {
      // Import as activity
      const result = await importActivityToDb(
        userId,
        parsed.data,
        "garmin_fit",
      );
      return {
        ...result,
        filename: parsed.filename,
        message: `Activity "${parsed.data.name}" imported successfully`,
      };
    } else if (parsed.type === "monitoring") {
      // Import as daily steps
      const result = await importDailyStepsToDb(userId, parsed.data);
      return {
        ...result,
        filename: parsed.filename,
        message: `Imported ${result.count} day(s) of step data`,
      };
    } else {
      throw new Error("Unknown file type");
    }
  } catch (error) {
    console.error("Error importing FIT file:", error);
    throw error;
  }
}

/**
 * Batch import multiple FIT files
 * @param {string} userId - User ID
 * @param {Array<File>} files - Array of FIT files
 * @returns {Promise<Object>} Batch import results
 */
export async function importMultipleFitFiles(userId, files) {
  const results = {
    total: files.length,
    successful: 0,
    failed: 0,
    activities: 0,
    monitoring: 0,
    details: [],
  };

  for (const file of files) {
    try {
      const result = await importFitFile(userId, file);
      results.successful++;

      if (result.type === "activity") {
        results.activities++;
      } else if (result.type === "monitoring") {
        results.monitoring++;
      }

      results.details.push({
        filename: file.name,
        success: true,
        type: result.type,
        message: result.message,
      });
    } catch (error) {
      results.failed++;
      results.details.push({
        filename: file.name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert FIT semicircles to decimal degrees
 * FIT format stores coordinates as semicircles (2^31 semicircles = 180 degrees)
 */
function convertSemicirclesToDegrees(semicircles) {
  return semicircles * (180 / Math.pow(2, 31));
}

/**
 * Calculate average speed from distance and time
 */
function calculateAverageSpeed(sessionMsg) {
  if (sessionMsg.totalDistance && sessionMsg.totalMovingTime) {
    return sessionMsg.totalDistance / sessionMsg.totalMovingTime;
  }
  return 0;
}

/**
 * Generate a readable activity name
 */
function generateActivityName(sessionMsg, lapMessages) {
  const sport = sessionMsg.sport || "Activity";
  const date = sessionMsg.startTime
    ? new Date(sessionMsg.startTime)
    : new Date();

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // If there's distance, include it
  if (sessionMsg.totalDistance) {
    const km = (sessionMsg.totalDistance / 1000).toFixed(1);
    return `${sport} - ${km}km (${timeStr})`;
  }

  return `${sport} - ${timeStr}`;
}

/**
 * Validate FIT file before processing
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export function validateFitFile(file) {
  const errors = [];

  // Check file extension
  if (!file.name.toLowerCase().endsWith(".fit")) {
    errors.push("File must have .fit extension");
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    errors.push("File size exceeds 50MB limit");
  }

  // Check file is not empty
  if (file.size === 0) {
    errors.push("File is empty");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
