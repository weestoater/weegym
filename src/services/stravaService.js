import { supabase } from "../lib/supabaseClient";
import { estimateCalories } from "../utils/calorieEstimator";
import { checkForPersonalRecords, PR_CATEGORIES } from "../utils/prCalculator";

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
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Cache for database configuration
let configCache = null;
let configLoadPromise = null;

/**
 * Load Strava app configuration from database
 * Falls back to environment variables if database config not available
 * @param {boolean} forceReload - Force reload from database, bypassing cache
 * @returns {Promise<Object>} Active Strava app configuration
 */
async function loadStravaConfig(forceReload = false) {
  // Return cached config if available and not forcing reload
  if (configCache && !forceReload) {
    return configCache;
  }

  // If already loading, wait for that promise
  if (configLoadPromise && !forceReload) {
    return configLoadPromise;
  }

  // Load from database
  configLoadPromise = (async () => {
    try {
      console.log("🔧 Loading Strava configuration from database...");

      const { data, error } = await supabase
        .from("strava_app_configs")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found - fall back to env vars
          console.warn(
            "⚠️ No active Strava config in database, using environment variables",
          );
          configCache = getEnvConfig();
          return configCache;
        }
        throw error;
      }

      if (!data) {
        console.warn(
          "⚠️ No active Strava config found, using environment variables",
        );
        configCache = getEnvConfig();
        return configCache;
      }

      console.log("✅ Strava config loaded from database:", {
        appName: data.app_name,
        clientId: data.client_id,
        redirectUri: data.redirect_uri,
        clientSecret: data.client_secret
          ? "***" + data.client_secret.slice(-4)
          : "MISSING",
      });

      configCache = {
        appName: data.app_name,
        clientId: data.client_id,
        clientSecret: data.client_secret,
        redirectUri: data.redirect_uri,
        description: data.description,
      };

      return configCache;
    } catch (err) {
      console.error("❌ Error loading Strava config from database:", err);
      console.warn("⚠️ Falling back to environment variables");
      configCache = getEnvConfig();
      return configCache;
    } finally {
      configLoadPromise = null;
    }
  })();

  return configLoadPromise;
}

/**
 * Get configuration from environment variables (fallback)
 * @returns {Object} Strava app configuration from env vars
 */
function getEnvConfig() {
  const config = {
    appName: "env-primary",
    clientId: import.meta.env.VITE_STRAVA_CLIENT_ID,
    clientSecret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_STRAVA_REDIRECT_URI,
    description: "Configuration from environment variables",
  };

  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    console.error("❌ STRAVA CONFIGURATION ERROR:");
    console.error(
      "Missing required configuration in both database and environment variables",
    );
    if (!config.clientId)
      console.error("  - VITE_STRAVA_CLIENT_ID or database config");
    if (!config.clientSecret)
      console.error("  - VITE_STRAVA_CLIENT_SECRET or database config");
    if (!config.redirectUri)
      console.error("  - VITE_STRAVA_REDIRECT_URI or database config");
    throw new Error("Strava is not configured properly");
  }

  console.log("ℹ️ Using Strava config from environment variables:", {
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    clientSecret: config.clientSecret
      ? "***" + config.clientSecret.slice(-4)
      : "MISSING",
  });

  return config;
}

/**
 * Reload configuration from database
 * @returns {Promise<Object>} Refreshed configuration
 */
export async function reloadStravaConfig() {
  console.log("🔄 Reloading Strava configuration...");
  return await loadStravaConfig(true);
}

// Track token refresh to prevent race conditions
let tokenRefreshPromise = null;

// Load initial config
loadStravaConfig().catch((err) => {
  console.error("❌ Failed to load initial Strava config:", err);
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Make a fetch request with timeout and retry logic
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithTimeout(url, options = {}, retries = MAX_RETRIES) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Check if it was a timeout
    if (error.name === "AbortError") {
      console.warn(`⏱️ Request timeout for ${url}`);
      if (retries > 0) {
        console.log(`🔄 Retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
        return fetchWithTimeout(url, options, retries - 1);
      }
      throw new Error("Request timeout - Strava API did not respond in time");
    }

    // Network error - retry if we have attempts left
    if (
      retries > 0 &&
      (error.message.includes("fetch") || error.message.includes("network"))
    ) {
      console.warn(`🌐 Network error for ${url}:`, error.message);
      console.log(`🔄 Retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s for network issues
      return fetchWithTimeout(url, options, retries - 1);
    }

    throw error;
  }
}

/**
 * Validate that Strava configuration is loaded and valid
 * @param {Object} config - Configuration object to validate
 * @throws {Error} If configuration is invalid
 */
function validateConfig(config) {
  if (
    !config ||
    !config.clientId ||
    !config.clientSecret ||
    !config.redirectUri
  ) {
    throw new Error(
      "Strava app is not configured. Please configure in database or environment variables.",
    );
  }
}

/**
 * Get all Strava app configurations from database
 * @returns {Promise<Array<Object>>} List of all app configurations
 */
export async function getAllAppConfigs() {
  try {
    const { data, error } = await supabase
      .from("strava_app_configs")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching app configs:", err);
    return [];
  }
}

/**
 * Set which Strava app configuration is active
 * @param {string} appName - App name to activate
 * @returns {Promise<boolean>} Success status
 */
export async function setActiveApp(appName) {
  try {
    const { error } = await supabase
      .from("strava_app_configs")
      .update({ is_active: true })
      .eq("app_name", appName);

    if (error) throw error;

    // Reload config cache
    await reloadStravaConfig();
    return true;
  } catch (err) {
    console.error("Error setting active app:", err);
    return false;
  }
}

/**
 * Get list of available Strava apps
 * Returns configured apps from database (or env as fallback)
 * @returns {Promise<Array<Object>>} List of apps with name and label
 */
export async function getAvailableApps() {
  try {
    // First try to get from database
    const configs = await getAllAppConfigs();

    if (configs && configs.length > 0) {
      return configs.map((config) => ({
        name: config.app_name,
        label: config.description || config.app_name,
        clientId: config.client_id,
        isActive: config.is_active,
      }));
    }

    // Fallback to environment variables if no database configs
    console.warn("No database configs found, checking environment variables");
    const apps = [];

    const envConfig = {
      clientId: import.meta.env.VITE_STRAVA_CLIENT_ID,
      clientSecret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_STRAVA_REDIRECT_URI,
    };

    if (envConfig.clientId && envConfig.clientSecret && envConfig.redirectUri) {
      apps.push({
        name: "primary",
        label: "Primary Account (from .env)",
        clientId: envConfig.clientId,
        isActive: true,
      });
    }

    return apps;
  } catch (err) {
    console.error("Error getting available apps:", err);
    return [];
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Generate Strava OAuth authorization URL
 * Uses the active Strava app configuration from database
 * @returns {Promise<string>} Authorization URL to redirect user to
 */
export async function getAuthorizationUrl() {
  const config = await loadStravaConfig();
  validateConfig(config);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "read,activity:read_all",
    approval_prompt: "auto",
    state: config.appName, // Pass app name in state to identify on callback
  });

  return `${STRAVA_AUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 * Uses the active Strava app configuration from database
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} Token data with access_token, refresh_token, expires_at
 */
export async function exchangeCodeForToken(code) {
  try {
    const config = await loadStravaConfig();
    validateConfig(config);
    console.log(
      `🔐 Exchanging authorization code for ${config.appName} app token...`,
    );

    const response = await fetchWithTimeout(`${STRAVA_AUTH_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Token exchange failed:", response.status, errorText);

      let errorMessage = `Strava token exchange failed (${response.status})`;
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || errorMessage;
      } catch {
        // If not JSON, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Token exchange successful");

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("❌ User not authenticated:", userError);
      throw new Error("User not authenticated");
    }

    console.log(
      `💾 Storing ${config.appName} Strava connection in database...`,
    );

    // Check if this is the first connection for this user
    const { data: existingConnections } = await supabase
      .from("strava_connections")
      .select("id")
      .eq("user_id", userData.user.id);

    const isFirstConnection =
      !existingConnections || existingConnections.length === 0;

    // Store tokens in database
    const { data: connection, error: dbError } = await supabase
      .from("strava_connections")
      .upsert({
        user_id: userData.user.id,
        app_name: config.appName,
        athlete_id: data.athlete.id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(data.expires_at * 1000).toISOString(),
        athlete_data: data.athlete,
        connected_at: new Date().toISOString(),
        is_active: isFirstConnection, // First connection is active by default
      })
      .select()
      .single();

    if (dbError) {
      console.error("❌ Error storing Strava connection:", dbError);
      throw dbError;
    }

    console.log(`✅ ${config.appName} Strava connection stored successfully`);
    return connection;
  } catch (err) {
    console.error("❌ Failed to exchange code for token:", err);
    throw err;
  }
}

/**
 * Refresh expired access token
 * Uses the current active Strava app configuration
 * @param {string} userId - User ID
 * @param {string} appName - Optional app name override
 * @returns {Promise<Object>} Updated connection with new tokens
 */
export async function refreshAccessToken(userId, appName = null) {
  // Prevent multiple simultaneous token refreshes
  if (tokenRefreshPromise) {
    console.log("⏳ Token refresh already in progress, waiting...");
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = (async () => {
    try {
      const config = await loadStravaConfig();
      validateConfig(config);
      const activeAppName = appName || config.appName;
      console.log(`🔄 Refreshing access token for ${activeAppName} app...`);

      // Get current connection
      const { data: connection, error: fetchError } = await supabase
        .from("strava_connections")
        .select("*")
        .eq("user_id", userId)
        .eq("app_name", activeAppName)
        .single();

      if (fetchError) {
        console.error("❌ Strava connection not found:", fetchError);
        throw new Error("Strava connection not found");
      }

      // Request new token
      const response = await fetchWithTimeout(`${STRAVA_AUTH_BASE}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: connection.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Token refresh failed:", response.status, errorText);

        let errorMessage = `Token refresh failed (${response.status})`;
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Token refreshed successfully");

      // Update tokens in database
      const { data: updatedConnection, error: updateError } = await supabase
        .from("strava_connections")
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: new Date(data.expires_at * 1000).toISOString(),
        })
        .eq("user_id", userId)
        .eq("app_name", activeAppName)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating tokens in database:", updateError);
        throw updateError;
      }

      return updatedConnection;
    } catch (err) {
      console.error("❌ Failed to refresh access token:", err);
      throw err;
    } finally {
      tokenRefreshPromise = null;
    }
  })();

  return tokenRefreshPromise;
}

/**
 * Get valid access token, refreshing if expired
 * @param {string} userId - User ID
 * @param {string} appName - App name (default: uses active connection's app_name)
 * @returns {Promise<string>} Valid access token
 */
async function getValidAccessToken(userId, appName = null) {
  try {
    // Get connection - if appName not specified, get active connection
    const connection = await getConnectionStatus(appName);

    if (!connection) {
      console.error("❌ Strava connection not found");
      throw new Error(
        "Strava connection not found. Please reconnect your Strava account.",
      );
    }

    const actualAppName = connection.app_name;

    // Check if token is expired (refresh 5 minutes before expiry)
    const expiresAt = new Date(connection.expires_at);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    if (timeUntilExpiry < bufferTime) {
      console.log(
        `🔑 Token for ${actualAppName} expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes, refreshing...`,
      );
      const refreshed = await refreshAccessToken(userId, actualAppName);
      return refreshed.access_token;
    }

    console.log(
      `✅ Using cached token for ${actualAppName} (expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes)`,
    );
    return connection.access_token;
  } catch (err) {
    console.error("❌ Failed to get valid access token:", err);
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
 * @param {string} options.appName - App name to sync from (default: active connection)
 * @returns {Promise<Object>} Sync result with count of new/updated activities
 */
export async function syncActivities(userId, options = {}) {
  try {
    const { after, page = 1, perPage = 30, appName = null } = options;
    console.log("🚀 Starting Strava sync...", {
      userId,
      after,
      page,
      perPage,
      appName,
    });

    // Get the connection (active or specific app)
    const connection = await getConnectionStatus(appName);
    if (!connection) {
      throw new Error(
        appName
          ? `No ${appName} connection found`
          : "No active Strava connection found",
      );
    }

    const activeAppName = connection.app_name;
    console.log(`📱 Using ${activeAppName} connection`);

    // Get valid access token
    const accessToken = await getValidAccessToken(userId, activeAppName);

    // If no 'after' timestamp provided, get last sync time
    // Note: Use undefined check, not falsy check, so after: 0 works for full resync
    let afterTimestamp = after;
    if (after === undefined) {
      if (connection?.last_sync) {
        afterTimestamp = Math.floor(
          new Date(connection.last_sync).getTime() / 1000,
        );
        console.log(
          `📅 Using last sync timestamp: ${afterTimestamp} (${new Date(connection.last_sync).toISOString()})`,
        );
      } else {
        console.log("📅 No previous sync found, fetching all activities");
      }
    } else if (after === 0) {
      console.log("🔄 Full resync requested (after=0)");
    } else {
      console.log(`📅 Using provided after timestamp: ${afterTimestamp}`);
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

    const apiUrl = `${STRAVA_API_BASE}/athlete/activities?${params.toString()}`;
    console.log(`🌐 Fetching from: ${apiUrl}`);

    // Fetch activities from Strava
    const response = await fetchWithTimeout(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Strava API error:", response.status, errorText);
      throw new Error(
        `Strava API error (${response.status}): ${response.statusText}`,
      );
    }

    const activities = await response.json();
    console.log(`📊 Received ${activities.length} activities from Strava`);

    if (!Array.isArray(activities)) {
      console.error("❌ Unexpected response format:", activities);
      throw new Error("Unexpected response format from Strava API");
    }

    // Store activities in database
    let newCount = 0;
    let updatedCount = 0;
    let caloriesCount = 0;
    let kilojoulesCount = 0;
    let noEnergyCount = 0;
    const debugSamples = [];

    for (const activity of activities) {
      console.log(`📝 Processing activity ${activity.id}: ${activity.name}`);

      // Fetch detailed activity data (list endpoint doesn't include calories)
      const detailResponse = await fetchWithTimeout(
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
      } else {
        console.warn(
          `⚠️ Could not fetch detailed data for activity ${activity.id}, using list data`,
        );
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
        app_name: activeAppName,
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
          onConflict: "user_id,app_name,strava_id",
        });

      if (upsertError) {
        console.error(
          `❌ Error upserting activity ${activity.id}:`,
          upsertError,
        );
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
        console.log(`✅ New activity saved: ${detailedActivity.name}`);
      } else {
        updatedCount++;
        console.log(`♻️ Activity updated: ${detailedActivity.name}`);
      }
    }

    console.log(`💾 Updating last_sync timestamp for ${activeAppName}...`);
    // Update last_sync timestamp for this specific app
    const { error: syncUpdateError } = await supabase
      .from("strava_connections")
      .update({ last_sync: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("app_name", activeAppName);

    if (syncUpdateError) {
      console.warn("⚠️ Could not update last_sync timestamp:", syncUpdateError);
    }

    console.log(`🏆 Checking for personal records...`);
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

    const result = {
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

    console.log("✅ Sync completed successfully:", {
      total: result.total,
      new: result.new,
      updated: result.updated,
      newPRs: newPRs.length,
    });

    return result;
  } catch (err) {
    console.error("❌ Failed to sync activities:", err);
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
 * @param {string} options.appName - App name filter (default: active connection)
 * @param {boolean} options.allApps - If true, fetch from all apps (ignores appName)
 * @returns {Promise<Array>} Array of activities
 */
export async function getActivities(userId, options = {}) {
  try {
    const {
      type,
      startDate,
      endDate,
      limit = 30,
      offset = 0,
      appName = null,
      allApps = false,
    } = options;

    let query = supabase
      .from("strava_activities")
      .select("*")
      .eq("user_id", userId);

    // Filter by app_name unless allApps is true
    if (!allApps) {
      if (appName) {
        query = query.eq("app_name", appName);
      } else {
        // Get active connection's app_name
        const connection = await getConnectionStatus();
        if (connection) {
          query = query.eq("app_name", connection.app_name);
        }
      }
    }

    query = query
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
    console.log(`🗺️ Fetching GPS stream for activity ${stravaActivityId}...`);

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("❌ User not authenticated:", userError);
      throw new Error("User not authenticated");
    }

    // Get valid access token (handles refresh automatically)
    const accessToken = await getValidAccessToken(userData.user.id);

    // Fetch stream data (latlng type)
    const response = await fetchWithTimeout(
      `${STRAVA_API_BASE}/activities/${stravaActivityId}/streams?keys=latlng&key_by_type=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log("ℹ️ No GPS data available for this activity");
        return [];
      }
      const errorText = await response.text();
      console.error("❌ Failed to fetch stream:", response.status, errorText);
      throw new Error(
        `Failed to fetch stream (${response.status}): ${response.statusText}`,
      );
    }

    const streamData = await response.json();

    // Check if latlng stream exists
    if (!streamData.latlng || !streamData.latlng.data) {
      console.log("ℹ️ No latlng data in stream response");
      return [];
    }

    console.log(`✅ Fetched ${streamData.latlng.data.length} GPS points`);

    // Convert to {lat, lng} format
    return streamData.latlng.data.map(([lat, lng]) => ({ lat, lng }));
  } catch (err) {
    console.error("❌ Failed to get activity stream:", err);
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
 * @param {string} appName - Optional app name. If not provided, returns active connection
 * @returns {Promise<Object|null>} Connection data or null if not connected
 */
export async function getConnectionStatus(appName = null) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return null;
    }

    let query = supabase
      .from("strava_connections")
      .select("*")
      .eq("user_id", userData.user.id);

    if (appName) {
      // Get specific app connection
      query = query.eq("app_name", appName);
    } else {
      // Get active connection
      query = query.eq("is_active", true);
    }

    const { data, error } = await query.single();

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
 * Get all Strava connections for current user
 * @returns {Promise<Array>} List of all connections
 */
export async function getAllConnections() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return [];
    }

    const { data, error } = await supabase
      .from("strava_connections")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("connected_at", { ascending: true });

    if (error) {
      console.error("Error fetching connections:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get all connections:", err);
    return [];
  }
}

/**
 * Switch active Strava connection
 * @param {string} appName - App name to activate
 * @returns {Promise<boolean>} Success status
 */
export async function switchActiveConnection(appName) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new Error("User not authenticated");
    }

    console.log(`🔄 Switching active connection to ${appName}...`);

    // Deactivate all connections
    await supabase
      .from("strava_connections")
      .update({ is_active: false })
      .eq("user_id", userData.user.id);

    // Activate the specified connection
    const { error: activateError } = await supabase
      .from("strava_connections")
      .update({ is_active: true })
      .eq("user_id", userData.user.id)
      .eq("app_name", appName);

    if (activateError) {
      console.error("❌ Error activating connection:", activateError);
      throw activateError;
    }

    console.log(`✅ Switched to ${appName} connection`);
    return true;
  } catch (err) {
    console.error("Failed to switch active connection:", err);
    throw err;
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
 * @param {string} appName - Optional app name. If not provided, disconnects all apps
 * @returns {Promise<boolean>} Success status
 */
export async function disconnectStrava(userId, appName = null) {
  try {
    if (appName) {
      console.log(`🔌 Disconnecting ${appName} Strava connection...`);

      // Delete activities for this app
      const { error: activitiesError } = await supabase
        .from("strava_activities")
        .delete()
        .eq("user_id", userId)
        .eq("app_name", appName);

      if (activitiesError) {
        console.error("Error deleting activities:", activitiesError);
      }

      // Delete connection for this app
      const { error: connectionError } = await supabase
        .from("strava_connections")
        .delete()
        .eq("user_id", userId)
        .eq("app_name", appName);

      if (connectionError) {
        throw connectionError;
      }

      console.log(`✅ ${appName} connection disconnected`);
    } else {
      console.log("🔌 Disconnecting all Strava connections...");

      // Delete all activities
      const { error: activitiesError } = await supabase
        .from("strava_activities")
        .delete()
        .eq("user_id", userId);

      if (activitiesError) {
        console.error("Error deleting activities:", activitiesError);
      }

      // Delete all connections
      const { error: connectionError } = await supabase
        .from("strava_connections")
        .delete()
        .eq("user_id", userId);

      if (connectionError) {
        throw connectionError;
      }

      console.log("✅ All connections disconnected");
    }

    return true;
  } catch (err) {
    console.error("Failed to disconnect Strava:", err);
    throw err;
  }
}

/**
 * Delete a single activity
 * @param {string} userId - User ID
 * @param {string} activityId - Activity ID (UUID from database)
 * @returns {Promise<boolean>} Success status
 */
export async function deleteActivity(userId, activityId) {
  try {
    console.log(`🗑️ Deleting activity ${activityId} for user ${userId}`);

    // Delete the activity
    const { error } = await supabase
      .from("strava_activities")
      .delete()
      .eq("id", activityId)
      .eq("user_id", userId); // Ensure user can only delete their own activities

    if (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }

    console.log(`✅ Activity deleted successfully`);
    return true;
  } catch (err) {
    console.error("Failed to delete activity:", err);
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
    const config = await loadStravaConfig();
    validateConfig(config);
    console.log("🔔 Subscribing to Strava webhooks...", { callbackUrl });

    const response = await fetchWithTimeout(
      `${STRAVA_API_BASE}/push_subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          callback_url: callbackUrl,
          verify_token: "WEEGYM_STRAVA_WEBHOOK", // Must match Edge Function
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Webhook subscription failed:",
        response.status,
        errorText,
      );
      let errorMessage = `Failed to subscribe to webhooks (${response.status})`;
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
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
    const config = await loadStravaConfig();
    validateConfig(config);
    console.log("📋 Viewing webhook subscriptions...");

    const response = await fetchWithTimeout(
      `${STRAVA_API_BASE}/push_subscriptions?client_id=${config.clientId}&client_secret=${config.clientSecret}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Failed to view subscriptions:",
        response.status,
        errorText,
      );
      throw new Error(
        `Failed to view subscriptions (${response.status}): ${response.statusText}`,
      );
    }

    const subscriptions = await response.json();
    console.log(`✅ Found ${subscriptions.length} webhook subscription(s)`);
    return subscriptions;
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
    const config = await loadStravaConfig();
    validateConfig(config);
    console.log("🔕 Unsubscribing from webhook:", subscriptionId);

    const response = await fetchWithTimeout(
      `${STRAVA_API_BASE}/push_subscriptions/${subscriptionId}?client_id=${config.clientId}&client_secret=${config.clientSecret}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to unsubscribe:", response.status, errorText);
      throw new Error(
        `Failed to unsubscribe (${response.status}): ${response.statusText}`,
      );
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
