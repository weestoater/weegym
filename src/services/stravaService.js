import { supabase } from "../lib/supabaseClient";
import { estimateCalories } from "../utils/calorieEstimator";
import {
  checkForPersonalRecords,
  _calculatePRsFromActivities,
  PR_CATEGORIES,
} from "../utils/prCalculator";

/**
 * Strava Integration Service
 * Handles OAuth authentication, activity syncing, and data management
 * Phase 2: Backend Implementation
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_AUTH_BASE = "https://www.strava.com/oauth";

const STRAVA_CONFIG = {
  clientId: import.meta.env.VITE_STRAVA_CLIENT_ID,
  clientSecret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_STRAVA_REDIRECT_URI,
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Generate Strava OAuth authorization URL
 * @returns {string} Authorization URL to redirect user to
 */
export function getAuthorizationUrl() {
  const params = new URLSearchParams({
    client_id: STRAVA_CONFIG.clientId,
    redirect_uri: STRAVA_CONFIG.redirectUri,
    response_type: "code",
    scope: "read,activity:read_all",
    approval_prompt: "auto",
  });

  return `${STRAVA_AUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} Token data with access_token, refresh_token, expires_at
 */
export async function exchangeCodeForToken(code) {
  try {
    const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: STRAVA_CONFIG.clientId,
        client_secret: STRAVA_CONFIG.clientSecret,
        code: code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Strava token exchange failed: ${error.message || response.statusText}`,
      );
    }

    const data = await response.json();

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error("User not authenticated");
    }

    // Store tokens in database
    const { data: connection, error: dbError } = await supabase
      .from("strava_connections")
      .upsert({
        user_id: userData.user.id,
        athlete_id: data.athlete.id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(data.expires_at * 1000).toISOString(),
        athlete_data: data.athlete,
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error storing Strava connection:", dbError);
      throw dbError;
    }

    return connection;
  } catch (err) {
    console.error("Failed to exchange code for token:", err);
    throw err;
  }
}

/**
 * Refresh expired access token
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated connection with new tokens
 */
export async function refreshAccessToken(userId) {
  try {
    // Get current connection
    const { data: connection, error: fetchError } = await supabase
      .from("strava_connections")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      throw new Error("Strava connection not found");
    }

    // Request new token
    const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: STRAVA_CONFIG.clientId,
        client_secret: STRAVA_CONFIG.clientSecret,
        refresh_token: connection.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Token refresh failed: ${error.message || response.statusText}`,
      );
    }

    const data = await response.json();

    // Update tokens in database
    const { data: updatedConnection, error: updateError } = await supabase
      .from("strava_connections")
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(data.expires_at * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return updatedConnection;
  } catch (err) {
    console.error("Failed to refresh access token:", err);
    throw err;
  }
}

/**
 * Get valid access token, refreshing if expired
 * @param {string} userId - User ID
 * @returns {Promise<string>} Valid access token
 */
async function getValidAccessToken(userId) {
  try {
    const { data: connection, error } = await supabase
      .from("strava_connections")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error("Strava connection not found");
    }

    // Check if token is expired (refresh 5 minutes before expiry)
    const expiresAt = new Date(connection.expires_at);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (expiresAt.getTime() - now.getTime() < bufferTime) {
      const refreshed = await refreshAccessToken(userId);
      return refreshed.access_token;
    }

    return connection.access_token;
  } catch (err) {
    console.error("Failed to get valid access token:", err);
    throw err;
  }
}

// ============================================================================
// ACTIVITY SYNCING
// ============================================================================

/**
 * Sync activities from Strava to local database
 * @param {string} userId - User ID
 * @param {Object} options - Sync options
 * @param {number} options.after - Unix timestamp to fetch activities after (optional)
 * @param {number} options.page - Page number for pagination (default: 1)
 * @param {number} options.perPage - Activities per page (default: 30, max: 200)
 * @returns {Promise<Object>} Sync result with count of new/updated activities
 */
export async function syncActivities(userId, options = {}) {
  try {
    const { after, page = 1, perPage = 30 } = options;

    // Get valid access token
    const accessToken = await getValidAccessToken(userId);

    // If no 'after' timestamp provided, get last sync time
    // Note: Use undefined check, not falsy check, so after: 0 works for full resync
    let afterTimestamp = after;
    if (after === undefined) {
      const { data: connection } = await supabase
        .from("strava_connections")
        .select("last_sync")
        .eq("user_id", userId)
        .single();

      if (connection?.last_sync) {
        afterTimestamp = Math.floor(
          new Date(connection.last_sync).getTime() / 1000,
        );
      }
    }

    // Build API URL
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: Math.min(perPage, 200).toString(),
    });

    // Only add 'after' param if we have a timestamp > 0
    // (after: 0 means "all activities", so we omit the param)
    if (afterTimestamp && afterTimestamp > 0) {
      params.append("after", afterTimestamp.toString());
    }

    // Fetch activities from Strava
    const response = await fetch(
      `${STRAVA_API_BASE}/athlete/activities?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.statusText}`);
    }

    const activities = await response.json();

    // Store activities in database
    let newCount = 0;
    let updatedCount = 0;
    let caloriesCount = 0;
    let kilojoulesCount = 0;
    let noEnergyCount = 0;
    const debugSamples = [];

    for (const activity of activities) {
      // Fetch detailed activity data (list endpoint doesn't include calories)
      const detailResponse = await fetch(
        `${STRAVA_API_BASE}/activities/${activity.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      let detailedActivity = activity;
      if (detailResponse.ok) {
        detailedActivity = await detailResponse.json();
      }

      // Strava API may provide calories in multiple ways:
      // 1. activity.calories (direct from source device like Garmin)
      // 2. activity.kilojoules (Strava's calculation, 1 kJ = ~0.239 cal)
      // 3. Estimated based on heart rate and activity type (fallback)
      let calories = null;
      let calorieSource = null;

      if (detailedActivity.calories) {
        calories = Math.round(detailedActivity.calories);
        caloriesCount++;
        calorieSource = "strava_calories";
      } else if (detailedActivity.kilojoules) {
        calories = Math.round(detailedActivity.kilojoules * 0.239);
        kilojoulesCount++;
        calorieSource = "strava_kilojoules";
      } else {
        // Estimate calories since Strava doesn't provide them
        const estimated = estimateCalories(detailedActivity, {
          userWeight: 75, // TODO: Get from user profile
          userAge: 40,
          userGender: "male",
        });

        if (estimated) {
          calories = estimated;
          calorieSource = "estimated";
        }
        noEnergyCount++;
      }

      // Save first 3 activities as debug samples
      if (debugSamples.length < 3) {
        debugSamples.push({
          name: detailedActivity.name,
          type: detailedActivity.type,
          moving_time: detailedActivity.moving_time,
          distance: detailedActivity.distance,
          avg_hr: detailedActivity.average_heartrate,
          calories: detailedActivity.calories,
          kilojoules: detailedActivity.kilojoules,
          computed: calories,
          source: calorieSource,
        });
      }

      const activityData = {
        user_id: userId,
        strava_id: detailedActivity.id,
        name: detailedActivity.name,
        type: detailedActivity.type,
        start_date: detailedActivity.start_date,
        distance: detailedActivity.distance,
        moving_time: detailedActivity.moving_time,
        elapsed_time: detailedActivity.elapsed_time,
        total_elevation_gain: detailedActivity.total_elevation_gain,
        average_speed: detailedActivity.average_speed,
        max_speed: detailedActivity.max_speed,
        average_heartrate: detailedActivity.average_heartrate,
        max_heartrate: detailedActivity.max_heartrate,
        calories: calories,
        activity_data: detailedActivity, // Store full detailed response
        synced_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("strava_activities")
        .upsert(activityData, {
          onConflict: "user_id,strava_id",
        });

      if (upsertError) {
        console.error("Error upserting activity:", upsertError);
        continue;
      }

      // Check if it was new or updated
      const { count } = await supabase
        .from("strava_activities")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("strava_id", activity.id);

      if (count === 1) {
        newCount++;
      } else {
        updatedCount++;
      }
    }

    // Update last_sync timestamp
    await supabase
      .from("strava_connections")
      .update({ last_sync: new Date().toISOString() })
      .eq("user_id", userId);

    // Get the newly synced activities from database for PR calculation
    const { data: syncedActivities } = await supabase
      .from("strava_activities")
      .select("*")
      .eq("user_id", userId)
      .in(
        "strava_id",
        activities.map((a) => a.id),
      );

    // Check and update personal records
    const newPRs = await updatePersonalRecords(userId, syncedActivities || []);

    return {
      success: true,
      total: activities.length,
      new: newCount,
      updated: updatedCount,
      hasMore: activities.length === perPage,
      newPRs: newPRs, // Include PR information in response
      debug: {
        withCalories: caloriesCount,
        withKilojoules: kilojoulesCount,
        withNoEnergy: noEnergyCount,
        samples: debugSamples,
      },
    };
  } catch (err) {
    console.error("Failed to sync activities:", err);
    throw err;
  }
}

// ============================================================================
// DATA RETRIEVAL
// ============================================================================

/**
 * Get activities from local database
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {string} options.type - Activity type filter (e.g., 'Ride', 'Walk', 'Run')
 * @param {Date} options.startDate - Filter activities after this date
 * @param {Date} options.endDate - Filter activities before this date
 * @param {number} options.limit - Number of activities to return (default: 30)
 * @param {number} options.offset - Pagination offset (default: 0)
 * @returns {Promise<Array>} Array of activities
 */
export async function getActivities(userId, options = {}) {
  try {
    const { type, startDate, endDate, limit = 30, offset = 0 } = options;

    let query = supabase
      .from("strava_activities")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq("type", type);
    }

    if (startDate) {
      query = query.gte("start_date", startDate.toISOString());
    }

    if (endDate) {
      query = query.lte("start_date", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get activities:", err);
    throw err;
  }
}

/**
 * Get detailed information for a specific activity
 * @param {string} userId - User ID
 * @param {string} activityId - Activity ID (UUID from local database)
 * @returns {Promise<Object>} Activity details
 */
export async function getActivityDetail(userId, activityId) {
  try {
    const { data, error } = await supabase
      .from("strava_activities")
      .select("*")
      .eq("user_id", userId)
      .eq("id", activityId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get activity detail:", err);
    throw err;
  }
}

/**
 * Get activity GPS stream data for route mapping
 * @param {number} stravaActivityId - Strava activity ID (not database ID)
 * @returns {Promise<Array>} Array of {lat, lng} coordinates
 */
export async function getActivityStream(stravaActivityId) {
  try {
    // Get connection and ensure token is valid
    const connection = await getConnectionStatus();
    if (!connection) {
      throw new Error("Not connected to Strava");
    }

    // Refresh token if expired
    const expiresAt = new Date(connection.expires_at);
    if (expiresAt < new Date()) {
      const { data: userData } = await supabase.auth.getUser();
      await refreshAccessToken(userData.user.id);
      // Re-fetch connection with new token
      const { data: refreshedConnection } = await supabase
        .from("strava_connections")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (!refreshedConnection) {
        throw new Error("Failed to refresh connection");
      }
    }

    // Fetch stream data (latlng type)
    const response = await fetch(
      `${STRAVA_API_BASE}/activities/${stravaActivityId}/streams?keys=latlng&key_by_type=true`,
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        // No GPS data available for this activity
        return [];
      }
      throw new Error(`Failed to fetch stream: ${response.statusText}`);
    }

    const streamData = await response.json();

    // Check if latlng stream exists
    if (!streamData.latlng || !streamData.latlng.data) {
      return [];
    }

    // Convert to {lat, lng} format
    return streamData.latlng.data.map(([lat, lng]) => ({ lat, lng }));
  } catch (err) {
    console.error("Failed to get activity stream:", err);
    throw err;
  }
}

/**
 * Get activity statistics summary
 * @param {string} userId - User ID
 * @param {Object} options - Filter options (same as getActivities)
 * @returns {Promise<Object>} Statistics (total distance, time, activities count, etc.)
 */
export async function getActivityStats(userId, options = {}) {
  try {
    const activities = await getActivities(userId, { ...options, limit: 1000 });

    const stats = activities.reduce(
      (acc, activity) => {
        acc.totalActivities++;
        acc.totalDistance += activity.distance || 0;
        acc.totalMovingTime += activity.moving_time || 0;
        acc.totalElevationGain += activity.total_elevation_gain || 0;
        acc.totalCalories += activity.calories || 0;

        // Count by type
        acc.byType[activity.type] = (acc.byType[activity.type] || 0) + 1;

        return acc;
      },
      {
        totalActivities: 0,
        totalDistance: 0,
        totalMovingTime: 0,
        totalElevationGain: 0,
        totalCalories: 0,
        byType: {},
      },
    );

    return stats;
  } catch (err) {
    console.error("Failed to get activity stats:", err);
    throw err;
  }
}

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

/**
 * Get Strava connection status for current user
 * @returns {Promise<Object|null>} Connection data or null if not connected
 */
export async function getConnectionStatus() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return null;
    }

    const { data, error } = await supabase
      .from("strava_connections")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching connection status:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Failed to get connection status:", err);
    return null;
  }
}

/**
 * Check if user is connected to Strava
 * @returns {Promise<boolean>} True if connected
 */
export async function isConnected() {
  const connection = await getConnectionStatus();
  return connection !== null;
}

/**
 * Disconnect Strava and remove all data
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function disconnectStrava(userId) {
  try {
    // Delete all activities
    const { error: activitiesError } = await supabase
      .from("strava_activities")
      .delete()
      .eq("user_id", userId);

    if (activitiesError) {
      console.error("Error deleting activities:", activitiesError);
    }

    // Delete connection (this will cascade delete activities due to foreign key)
    const { error: connectionError } = await supabase
      .from("strava_connections")
      .delete()
      .eq("user_id", userId);

    if (connectionError) {
      throw connectionError;
    }

    return true;
  } catch (err) {
    console.error("Failed to disconnect Strava:", err);
    throw err;
  }
}

// ============================================================================
// PERSONAL RECORDS (PRs)
// ============================================================================

/**
 * Get current personal records for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {string} options.activityType - Filter by activity type (optional)
 * @param {string} options.timeScope - Time scope: 'all_time', 'year', 'month' (default: 'all_time')
 * @returns {Promise<Array>} Array of PR records
 */
export async function getPersonalRecords(userId, options = {}) {
  try {
    const { activityType, timeScope = "all_time" } = options;

    let query = supabase
      .from("strava_personal_records")
      .select("*")
      .eq("user_id", userId)
      .eq("time_scope", timeScope)
      .order("set_at", { ascending: false });

    if (activityType) {
      query = query.eq("activity_type", activityType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching personal records:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get personal records:", err);
    throw err;
  }
}

/**
 * Update personal records after syncing activities
 * @param {string} userId - User ID
 * @param {Array} newActivities - Newly synced activities
 * @returns {Promise<Array>} Array of new PRs that were set
 */
export async function updatePersonalRecords(userId, newActivities) {
  if (!newActivities || newActivities.length === 0) {
    return [];
  }

  try {
    console.log("🏆 Checking for personal records...");
    const allNewPRs = [];

    // Get unique activity types from new activities
    const activityTypes = [...new Set(newActivities.map((a) => a.type))];

    for (const activityType of activityTypes) {
      // Get activities of this type
      const typeActivities = newActivities.filter(
        (a) => a.type === activityType,
      );

      // Check PRs for each time scope
      const timeScopes = ["all_time", "year", "month"];

      for (const timeScope of timeScopes) {
        // Get current PRs for this type and scope
        const currentPRs = await getPersonalRecords(userId, {
          activityType,
          timeScope,
        });

        // Convert to object for easier lookup
        const currentPRValues = {};
        currentPRs.forEach((pr) => {
          currentPRValues[pr.pr_category] = pr.record_value;
        });

        // Check each activity
        for (const activity of typeActivities) {
          // Filter by time scope
          if (timeScope === "year") {
            const activityYear = new Date(activity.start_date).getFullYear();
            const currentYear = new Date().getFullYear();
            if (activityYear !== currentYear) continue;
          } else if (timeScope === "month") {
            const activityDate = new Date(activity.start_date);
            const now = new Date();
            if (
              activityDate.getFullYear() !== now.getFullYear() ||
              activityDate.getMonth() !== now.getMonth()
            ) {
              continue;
            }
          }

          const newPRs = checkForPersonalRecords(
            activity,
            currentPRValues,
            activityType,
          );

          // Save each new PR
          for (const pr of newPRs) {
            const prRecord = {
              user_id: userId,
              activity_type: activityType,
              pr_category: pr.category,
              record_value: pr.value,
              record_unit: pr.unit,
              activity_id: activity.id,
              strava_activity_id: activity.strava_id,
              activity_name: activity.name,
              activity_date: activity.start_date,
              previous_record_value: pr.previousValue,
              time_scope: timeScope,
            };

            const { error } = await supabase
              .from("strava_personal_records")
              .upsert(prRecord, {
                onConflict: "user_id,activity_type,pr_category,time_scope",
              });

            if (error) {
              console.error("Error saving PR:", error);
            } else {
              console.log(
                `✅ New PR: ${activityType} - ${pr.category} (${timeScope})`,
              );
              if (timeScope === "all_time") {
                // Only add to notification list for all-time PRs
                allNewPRs.push({
                  activityType,
                  category: pr.category,
                  value: pr.value,
                  unit: pr.unit,
                  previousValue: pr.previousValue,
                  improvement: pr.improvement,
                  activityName: activity.name,
                });
              }
            }

            // Update current PR values for next activity check
            currentPRValues[pr.category] = pr.value;
          }
        }
      }
    }

    return allNewPRs;
  } catch (err) {
    console.error("Failed to update personal records:", err);
    return [];
  }
}

/**
 * Get PRs grouped by activity type for display
 * @param {string} userId - User ID
 * @param {string} timeScope - Time scope: 'all_time', 'year', 'month'
 * @returns {Promise<Object>} Object with PRs grouped by activity type
 */
export async function getPersonalRecordsByType(userId, timeScope = "all_time") {
  try {
    const prs = await getPersonalRecords(userId, { timeScope });

    // Group by activity type
    const grouped = {};
    prs.forEach((pr) => {
      if (!grouped[pr.activity_type]) {
        grouped[pr.activity_type] = [];
      }
      grouped[pr.activity_type].push(pr);
    });

    return grouped;
  } catch (err) {
    console.error("Failed to get PRs by type:", err);
    return {};
  }
}

/**
 * Check if an activity has any PRs
 * @param {string} activityId - Activity UUID
 * @returns {Promise<Array>} Array of PR categories this activity holds
 */
export async function getActivityPRs(activityId) {
  try {
    const { data, error } = await supabase
      .from("strava_personal_records")
      .select("pr_category, time_scope")
      .eq("activity_id", activityId);

    if (error) {
      console.error("Error fetching activity PRs:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get activity PRs:", err);
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format distance in appropriate units
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance (e.g., "15.3 km" or "2.1 mi")
 */
export function formatDistance(meters, useMetric = true) {
  if (!meters) return "0 km";

  if (useMetric) {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  } else {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  }
}

/**
 * Format duration in human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "1h 23m" or "45m 32s")
 */
export function formatDuration(seconds) {
  if (!seconds) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format speed in appropriate units
 * @param {number} metersPerSecond - Speed in m/s
 * @param {boolean} useMetric - Use metric (km/h) or imperial (mph)
 * @returns {string} Formatted speed
 */
export function formatSpeed(metersPerSecond, useMetric = true) {
  if (!metersPerSecond) return "0 km/h";

  if (useMetric) {
    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  } else {
    const mph = metersPerSecond * 2.237;
    return `${mph.toFixed(1)} mph`;
  }
}

/**
 * Get activity type icon
 * @param {string} type - Activity type (Ride, Walk, Run, etc.)
 * @returns {string} Bootstrap icon class
 */
/**
 * Get activity type icon
 * @param {string} type - Activity type (Ride, Walk, Run, etc.)
 * @returns {string} Bootstrap icon class
 */
export function getActivityIcon(type) {
  const icons = {
    Ride: "bi-bicycle",
    MountainBikeRide: "bi-bicycle",
    GravelRide: "bi-bicycle",
    EBikeRide: "bi-bicycle",
    Walk: "bi-person-walking",
    Run: "bi-person-running",
    TrailRun: "bi-person-running",
    Hike: "bi-tree",
    Swim: "bi-water",
    VirtualRide: "bi-display",
    VirtualRun: "bi-display",
    Workout: "bi-heart-pulse",
    WeightTraining: "bi-award",
    Yoga: "bi-flower1",
    Crossfit: "bi-award",
    Elliptical: "bi-arrow-repeat",
    StairStepper: "bi-arrow-up",
    AlpineSki: "bi-snow",
    NordicSki: "bi-snow",
    Snowboard: "bi-snow",
    IceSkate: "bi-snow",
    RockClimbing: "bi-triangle",
    Rowing: "bi-water",
    Kayaking: "bi-water",
    Canoeing: "bi-water",
    Surfing: "bi-water",
    Skateboard: "bi-circle",
    InlineSkate: "bi-circle",
    Golf: "bi-flag",
    default: "bi-activity",
  };

  return icons[type] || icons.default;
}

/**
 * Get activity type icon color class
 * @param {string} type - Activity type
 * @returns {string} Bootstrap text color class
 */
export function getActivityIconColor(type) {
  const colors = {
    Ride: "text-primary",
    MountainBikeRide: "text-primary",
    GravelRide: "text-primary",
    EBikeRide: "text-info",
    Walk: "text-success",
    Run: "text-danger",
    TrailRun: "text-danger",
    Hike: "text-success",
    Swim: "text-info",
    VirtualRide: "text-secondary",
    VirtualRun: "text-secondary",
    Workout: "text-warning",
    WeightTraining: "text-dark",
    Yoga: "text-purple",
    default: "text-muted",
  };

  return colors[type] || colors.default;
}

/**
 * Get activity type badge color class
 * @param {string} type - Activity type
 * @returns {string} Bootstrap badge color class
 */
export function getActivityBadgeColor(type) {
  const colors = {
    Ride: "bg-primary",
    MountainBikeRide: "bg-primary",
    GravelRide: "bg-primary",
    EBikeRide: "bg-info",
    Walk: "bg-success",
    Run: "bg-danger",
    TrailRun: "bg-danger",
    Hike: "bg-success",
    Swim: "bg-info",
    VirtualRide: "bg-secondary",
    VirtualRun: "bg-secondary",
    Workout: "bg-warning text-dark",
    WeightTraining: "bg-dark",
    Yoga: "bg-purple text-white",
    default: "bg-secondary",
  };

  return colors[type] || colors.default;
}

// ============================================================================
// WEBHOOK MANAGEMENT
// ============================================================================

/**
 * Subscribe to Strava webhooks for real-time activity updates
 * @param {string} callbackUrl - Public webhook endpoint URL (Supabase Edge Function)
 * @returns {Promise<Object>} Subscription data with subscription_id
 */
export async function subscribeToWebhooks(callbackUrl) {
  try {
    console.log("🔔 Subscribing to Strava webhooks...");

    const response = await fetch(`${STRAVA_API_BASE}/push_subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: STRAVA_CONFIG.clientId,
        client_secret: STRAVA_CONFIG.clientSecret,
        callback_url: callbackUrl,
        verify_token: "WEEGYM_STRAVA_WEBHOOK", // Must match Edge Function
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to subscribe to webhooks: ${error.message || response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("✅ Webhook subscription created:", data);

    // Store subscription ID in database
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      await supabase
        .from("strava_connections")
        .update({
          webhook_subscription_id: data.id,
          webhook_callback_url: callbackUrl,
          webhook_subscribed_at: new Date().toISOString(),
        })
        .eq("user_id", userData.user.id);
    }

    return data;
  } catch (err) {
    console.error("❌ Failed to subscribe to webhooks:", err);
    throw err;
  }
}

/**
 * View current webhook subscriptions
 * @returns {Promise<Array>} List of active subscriptions
 */
export async function viewWebhookSubscriptions() {
  try {
    const response = await fetch(
      `${STRAVA_API_BASE}/push_subscriptions?client_id=${STRAVA_CONFIG.clientId}&client_secret=${STRAVA_CONFIG.clientSecret}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to view subscriptions: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("❌ Failed to view webhook subscriptions:", err);
    throw err;
  }
}

/**
 * Unsubscribe from Strava webhooks
 * @param {number} subscriptionId - Subscription ID to delete
 * @returns {Promise<void>}
 */
export async function unsubscribeFromWebhooks(subscriptionId) {
  try {
    console.log("🔕 Unsubscribing from webhook:", subscriptionId);

    const response = await fetch(
      `${STRAVA_API_BASE}/push_subscriptions/${subscriptionId}?client_id=${STRAVA_CONFIG.clientId}&client_secret=${STRAVA_CONFIG.clientSecret}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to unsubscribe: ${response.statusText}`);
    }

    console.log("✅ Webhook unsubscribed successfully");

    // Clear subscription info from database
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      await supabase
        .from("strava_connections")
        .update({
          webhook_subscription_id: null,
          webhook_callback_url: null,
          webhook_subscribed_at: null,
        })
        .eq("user_id", userData.user.id);
    }
  } catch (err) {
    console.error("❌ Failed to unsubscribe from webhooks:", err);
    throw err;
  }
}

/**
 * Check if user has webhook subscription active
 * @returns {Promise<boolean>}
 */
export async function hasActiveWebhook() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return false;

    const { data: connection } = await supabase
      .from("strava_connections")
      .select("webhook_subscription_id")
      .eq("user_id", userData.user.id)
      .single();

    return !!(connection && connection.webhook_subscription_id);
  } catch (err) {
    console.error("Error checking webhook status:", err);
    return false;
  }
}
