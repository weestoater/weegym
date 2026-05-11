import { supabase } from "../lib/supabaseClient";

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
      console.log("Token expiring soon, refreshing...");
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
    let afterTimestamp = after;
    if (!afterTimestamp) {
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

    if (afterTimestamp) {
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

    for (const activity of activities) {
      // Debug: Log calorie/energy data from Strava
      console.log(`Activity "${activity.name}":`, {
        calories: activity.calories,
        kilojoules: activity.kilojoules,
        hasHeartRate: !!activity.average_heartrate,
      });

      // Strava API may provide calories in multiple ways:
      // 1. activity.calories (direct from source device like Garmin)
      // 2. activity.kilojoules (Strava's calculation, 1 kJ = ~0.239 cal)
      let calories = null;
      if (activity.calories) {
        calories = Math.round(activity.calories);
      } else if (activity.kilojoules) {
        calories = Math.round(activity.kilojoules * 0.239);
      }

      const activityData = {
        user_id: userId,
        strava_id: activity.id,
        name: activity.name,
        type: activity.type,
        start_date: activity.start_date,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        total_elevation_gain: activity.total_elevation_gain,
        average_speed: activity.average_speed,
        max_speed: activity.max_speed,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        calories: calories,
        activity_data: activity, // Store full response for future use
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

    return {
      success: true,
      total: activities.length,
      new: newCount,
      updated: updatedCount,
      hasMore: activities.length === perPage,
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
export function getActivityIcon(type) {
  const icons = {
    Ride: "bi-bicycle",
    Walk: "bi-person-walking",
    Run: "bi-person-running",
    Hike: "bi-tree",
    Swim: "bi-water",
    VirtualRide: "bi-bicycle",
    VirtualRun: "bi-person-running",
    Workout: "bi-heart-pulse",
    default: "bi-activity",
  };

  return icons[type] || icons.default;
}
