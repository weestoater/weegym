import { supabase } from "../lib/supabaseClient";

/**
 * Garmin Integration Service
 * Handles OAuth 1.0a authentication, step data syncing, and wellness data management
 * Phase 2: Backend Implementation
 *
 * DEVELOPMENT MODE: Set USE_MOCK_DATA to true while waiting for Garmin API approval
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const GARMIN_API_BASE = "https://apis.garmin.com";
const GARMIN_WELLNESS_API = "/wellness-api/rest";

const GARMIN_CONFIG = {
  consumerKey: import.meta.env.VITE_GARMIN_CONSUMER_KEY,
  consumerSecret: import.meta.env.VITE_GARMIN_CONSUMER_SECRET,
  redirectUri: import.meta.env.VITE_GARMIN_REDIRECT_URI,
};

// Mock data mode for development (set to false once API credentials received)
const USE_MOCK_DATA =
  !GARMIN_CONFIG.consumerKey ||
  GARMIN_CONFIG.consumerKey === "your_consumer_key";

// ============================================================================
// MOCK DATA GENERATORS (for development without API access)
// ============================================================================

/**
 * Generate mock daily step data for testing
 * @param {Date} date - Date to generate data for
 * @returns {Object} Mock step data
 */
function generateMockDailySteps(date) {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Simulate realistic step patterns (higher on weekdays for walks with Buster!)
  const baseSteps = isWeekend ? 8000 : 12000;
  const variance = Math.random() * 4000 - 2000; // ±2000 steps
  const totalSteps = Math.max(2000, Math.floor(baseSteps + variance));

  const goalSteps = 10000;
  const distanceMeters = Math.floor(totalSteps * 0.75); // ~0.75m per step
  const activeMinutes = Math.floor(totalSteps / 100); // ~100 steps per minute when active
  const caloriesBurned = Math.floor(totalSteps * 0.04); // ~0.04 cal per step

  return {
    date: date.toISOString().split("T")[0],
    total_steps: totalSteps,
    goal_steps: goalSteps,
    distance_meters: distanceMeters,
    active_minutes: activeMinutes,
    calories_burned: caloriesBurned,
  };
}

/**
 * Generate mock data for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of mock daily step data
 */
function generateMockDataRange(startDate, endDate) {
  const data = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    data.push(generateMockDailySteps(new Date(current)));
    current.setDate(current.getDate() + 1);
  }

  return data;
}

// ============================================================================
// AUTHENTICATION (OAuth 1.0a)
// ============================================================================

/**
 * Generate Garmin OAuth 1.0a authorization URL
 * NOTE: Requires OAuth 1.0a library (oauth-1.0a npm package)
 * @returns {string} Authorization URL to redirect user to
 */
export async function getAuthorizationUrl() {
  if (USE_MOCK_DATA) {
    console.log("🔧 MOCK MODE: Simulating Garmin authorization");
    return "/garmin/mock-callback"; // Mock callback for development
  }

  try {
    // TODO: Implement OAuth 1.0a flow once credentials received
    // const OAuth = require('oauth-1.0a');
    // const crypto = require('crypto');

    // const oauth = OAuth({
    //   consumer: {
    //     key: GARMIN_CONFIG.consumerKey,
    //     secret: GARMIN_CONFIG.consumerSecret,
    //   },
    //   signature_method: 'HMAC-SHA1',
    //   hash_function(base_string, key) {
    //     return crypto
    //       .createHmac('sha1', key)
    //       .update(base_string)
    //       .digest('base64');
    //   },
    // });

    // Request URL: https://connectapi.garmin.com/oauth-service/oauth/request_token
    // Authorization URL: https://connect.garmin.com/oauthConfirm

    throw new Error(
      "Garmin OAuth not yet implemented - awaiting API credentials",
    );
  } catch (err) {
    console.error("Failed to generate authorization URL:", err);
    throw err;
  }
}

/**
 * Exchange request token for access token
 * @param {string} oauthToken - OAuth token from callback
 * @param {string} oauthVerifier - OAuth verifier from callback
 * @returns {Promise<Object>} Connection data with tokens
 */
export async function exchangeTokens(_oauthToken, _oauthVerifier) {
  if (USE_MOCK_DATA) {
    console.log("🔧 MOCK MODE: Simulating token exchange");

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error("User not authenticated");
    }

    // Store mock connection
    const { data: connection, error: dbError } = await supabase
      .from("garmin_connections")
      .upsert({
        user_id: userData.user.id,
        access_token: "mock_access_token_" + Date.now(),
        access_token_secret: "mock_access_token_secret",
        garmin_user_id: "mock_user_" + userData.user.id.slice(0, 8),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error storing Garmin connection:", dbError);
      throw dbError;
    }

    return connection;
  }

  try {
    // TODO: Implement OAuth 1.0a token exchange
    // POST to: https://connectapi.garmin.com/oauth-service/oauth/access_token

    throw new Error(
      "Garmin token exchange not yet implemented - awaiting API credentials",
    );
  } catch (err) {
    console.error("Failed to exchange tokens:", err);
    throw err;
  }
}

/**
 * Get valid access token for API requests
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Token data with access_token and access_token_secret
 */
async function getValidAccessToken(userId) {
  try {
    const { data: connection, error } = await supabase
      .from("garmin_connections")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error("Garmin connection not found");
    }

    // OAuth 1.0a tokens don't expire like OAuth 2.0 tokens
    // But user can revoke them, so we should handle API errors gracefully
    return {
      access_token: connection.access_token,
      access_token_secret: connection.access_token_secret,
    };
  } catch (err) {
    console.error("Failed to get valid access token:", err);
    throw err;
  }
}

// ============================================================================
// DATA SYNCING
// ============================================================================

/**
 * Sync daily step data from Garmin to local database
 * @param {string} userId - User ID
 * @param {Object} options - Sync options
 * @param {number} options.after - Unix timestamp to fetch data after (optional, 0 for full resync)
 * @param {number} options.daysBack - Number of days to sync (default: 30)
 * @returns {Promise<Object>} Sync result with statistics
 */
export async function syncDailySteps(userId, options = {}) {
  try {
    const { after, daysBack = 30 } = options;

    console.log("🚀 Starting step data sync for user:", userId);
    console.log("📅 Options:", { after, daysBack });

    // Determine sync start date
    let startDate;
    if (after === undefined) {
      // No 'after' provided - check last sync
      const { data: connection } = await supabase
        .from("garmin_connections")
        .select("last_sync")
        .eq("user_id", userId)
        .single();

      if (connection?.last_sync) {
        startDate = new Date(connection.last_sync);
        console.log("📅 Syncing since last sync:", startDate);
      } else {
        // No last sync - go back daysBack days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        console.log("📅 First sync - going back", daysBack, "days");
      }
    } else if (after === 0) {
      // Full resync requested
      startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      console.log("🔄 Full resync requested - going back", daysBack, "days");
    } else {
      // Specific timestamp provided
      startDate = new Date(after * 1000);
      console.log("📅 Syncing from specified date:", startDate);
    }

    const endDate = new Date();

    // Fetch data from Garmin API (or mock)
    let dailyData;
    if (USE_MOCK_DATA) {
      console.log("🔧 Using mock data");
      dailyData = generateMockDataRange(startDate, endDate);
    } else {
      // Get valid access token
      const _tokens = await getValidAccessToken(userId);

      // TODO: Call Garmin API
      // GET /wellness-api/rest/dailies
      // Parameters: uploadStartTimeInSeconds, uploadEndTimeInSeconds

      throw new Error(
        "Garmin API integration not yet implemented - awaiting credentials",
      );
    }

    console.log(`📊 Fetched ${dailyData.length} days of data`);

    // Store in database
    let newRecords = 0;
    let updatedRecords = 0;

    for (const dayData of dailyData) {
      const { data, error } = await supabase
        .from("daily_steps")
        .upsert({
          user_id: userId,
          ...dayData,
        })
        .select();

      if (error) {
        console.error("Error storing daily steps:", error);
        continue;
      }

      if (data) {
        newRecords++;
      }
    }

    // Update last sync timestamp
    await supabase
      .from("garmin_connections")
      .update({ last_sync: new Date().toISOString() })
      .eq("user_id", userId);

    console.log(`✅ Sync complete: ${newRecords} records processed`);

    // Calculate weekly summaries
    await calculateWeeklySummaries(userId);

    return {
      success: true,
      records: newRecords,
      updated: updatedRecords,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  } catch (err) {
    console.error("❌ Failed to sync daily steps:", err);
    throw err;
  }
}

/**
 * Calculate and store weekly summaries
 * @param {string} userId - User ID
 * @param {Date} sinceDate - Calculate from this date forward (optional)
 */
async function calculateWeeklySummaries(userId, sinceDate = null) {
  try {
    // Get all daily steps (or since date)
    let query = supabase
      .from("daily_steps")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (sinceDate) {
      query = query.gte("date", sinceDate.toISOString().split("T")[0]);
    }

    const { data: dailySteps, error } = await query;

    if (error) {
      console.error("Error fetching daily steps:", error);
      return;
    }

    // Group by week (ISO week: Monday - Sunday)
    const weeklyData = {};

    for (const day of dailySteps) {
      const date = new Date(day.date);
      const weekStart = getWeekStart(date);
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          user_id: userId,
          week_start: weekKey,
          week_end: getWeekEnd(weekStart).toISOString().split("T")[0],
          days: [],
        };
      }

      weeklyData[weekKey].days.push(day);
    }

    // Calculate summaries and store
    for (const weekKey in weeklyData) {
      const week = weeklyData[weekKey];
      const days = week.days;

      const totalSteps = days.reduce((sum, d) => sum + d.total_steps, 0);
      const avgDailySteps = Math.round(totalSteps / days.length);
      const daysGoalMet = days.filter(
        (d) => d.total_steps >= d.goal_steps,
      ).length;

      const bestDay = days.reduce((best, d) =>
        d.total_steps > best.total_steps ? d : best,
      );

      await supabase.from("weekly_step_summaries").upsert({
        user_id: userId,
        week_start: week.week_start,
        week_end: week.week_end,
        total_steps: totalSteps,
        avg_daily_steps: avgDailySteps,
        days_goal_met: daysGoalMet,
        best_day_steps: bestDay.total_steps,
        best_day_date: bestDay.date,
      });
    }

    console.log("✅ Weekly summaries calculated");
  } catch (err) {
    console.error("Error calculating weekly summaries:", err);
  }
}

/**
 * Get start of ISO week (Monday)
 * @param {Date} date - Any date in the week
 * @returns {Date} Monday of that week
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get end of ISO week (Sunday)
 * @param {Date} weekStart - Monday of the week
 * @returns {Date} Sunday of that week
 */
function getWeekEnd(weekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
}

// ============================================================================
// DATA RETRIEVAL
// ============================================================================

/**
 * Get Garmin connection status for user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Connection data or null if not connected
 */
export async function getConnection(userId) {
  try {
    const { data, error } = await supabase
      .from("garmin_connections")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - that's okay
      console.error("Error fetching connection:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get connection:", err);
    return null;
  }
}

/**
 * Get daily steps for a date range
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date (optional)
 * @param {Date} options.endDate - End date (optional)
 * @param {number} options.limit - Max records to return (optional)
 * @returns {Promise<Array>} Array of daily step records
 */
export async function getDailySteps(userId, options = {}) {
  try {
    const { startDate, endDate, limit } = options;

    let query = supabase
      .from("daily_steps")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (startDate) {
      query = query.gte("date", startDate.toISOString().split("T")[0]);
    }

    if (endDate) {
      query = query.lte("date", endDate.toISOString().split("T")[0]);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching daily steps:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get daily steps:", err);
    throw err;
  }
}

/**
 * Get today's step count
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Today's step data or null
 */
export async function getTodaySteps(userId) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_steps")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching today steps:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get today steps:", err);
    return null;
  }
}

/**
 * Get weekly summary for a specific week
 * @param {string} userId - User ID
 * @param {Date} weekStart - Monday of the week
 * @returns {Promise<Object|null>} Weekly summary or null
 */
export async function getWeeklySummary(userId, weekStart) {
  try {
    const weekKey = weekStart.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("weekly_step_summaries")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekKey)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching weekly summary:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get weekly summary:", err);
    return null;
  }
}

/**
 * Get recent weekly summaries
 * @param {string} userId - User ID
 * @param {number} weeks - Number of weeks to fetch (default: 4)
 * @returns {Promise<Array>} Array of weekly summaries
 */
export async function getRecentWeeklySummaries(userId, weeks = 4) {
  try {
    const { data, error } = await supabase
      .from("weekly_step_summaries")
      .select("*")
      .eq("user_id", userId)
      .order("week_start", { ascending: false })
      .limit(weeks);

    if (error) {
      console.error("Error fetching weekly summaries:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get weekly summaries:", err);
    throw err;
  }
}

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

/**
 * Disconnect Garmin and remove all user data
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function disconnectGarmin(userId) {
  try {
    // Delete connection (cascade will delete related data)
    const { error } = await supabase
      .from("garmin_connections")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error disconnecting Garmin:", error);
      throw error;
    }

    console.log("✅ Garmin disconnected successfully");
  } catch (err) {
    console.error("Failed to disconnect Garmin:", err);
    throw err;
  }
}

/**
 * Update user's daily step goal
 * @param {string} userId - User ID
 * @param {number} goalSteps - New daily goal
 * @returns {Promise<void>}
 */
export async function updateStepGoal(userId, goalSteps) {
  try {
    // Update all existing records with new goal
    const { error } = await supabase
      .from("daily_steps")
      .update({ goal_steps: goalSteps })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating step goal:", error);
      throw error;
    }

    console.log("✅ Step goal updated to:", goalSteps);
  } catch (err) {
    console.error("Failed to update step goal:", err);
    throw err;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate current streak (consecutive days meeting goal)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Current streak in days
 */
export async function calculateStreak(userId) {
  try {
    const { data: steps, error } = await supabase
      .from("daily_steps")
      .select("date, total_steps, goal_steps")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(365); // Check up to 1 year

    if (error) {
      throw error;
    }

    let streak = 0;
    const today = new Date().toISOString().split("T")[0];

    for (const day of steps) {
      // Check if this day meets goal
      if (day.total_steps >= day.goal_steps) {
        streak++;
      } else if (day.date !== today) {
        // Streak broken (but don't count today if not complete yet)
        break;
      }
    }

    return streak;
  } catch (err) {
    console.error("Failed to calculate streak:", err);
    return 0;
  }
}

/**
 * Get achievement status
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Achievement data
 */
export async function getAchievements(userId) {
  try {
    const { data: steps, error } = await supabase
      .from("daily_steps")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const achievements = {
      totalDays: steps.length,
      totalSteps: steps.reduce((sum, d) => sum + d.total_steps, 0),
      daysGoalMet: steps.filter((d) => d.total_steps >= d.goal_steps).length,
      bestDay: steps.reduce(
        (best, d) => (d.total_steps > (best?.total_steps || 0) ? d : best),
        null,
      ),
      averageSteps: Math.round(
        steps.reduce((sum, d) => sum + d.total_steps, 0) / steps.length,
      ),
    };

    return achievements;
  } catch (err) {
    console.error("Failed to get achievements:", err);
    return null;
  }
}

// Export mock mode flag for UI to check
export const isMockMode = USE_MOCK_DATA;
