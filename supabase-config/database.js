/**
 * WeeGym Database Operations
 * Provides database access layer for workouts, active wellbeing sessions, and settings
 * This module can be used with any Supabase client instance
 */

/**
 * Creates database service with the provided Supabase client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient
 * @returns {Object} Database service methods
 */
export function createDatabaseService(supabaseClient) {
  // ============================================================================
  // WORKOUT OPERATIONS
  // ============================================================================

  /**
   * Save a workout to the database
   * @param {Object} workoutData
   * @param {string} workoutData.date - ISO date string
   * @param {string} workoutData.name - Workout name
   * @param {number} workoutData.duration - Duration in seconds
   * @param {Array} workoutData.exercises - Array of exercise objects
   * @returns {Promise<Object>} The saved workout
   */
  async function saveWorkout(workoutData) {
    const { data, error } = await supabaseClient
      .from("workouts")
      .insert([
        {
          date: workoutData.date,
          name: workoutData.name,
          duration: workoutData.duration,
          exercises: workoutData.exercises,
          user_id: (await supabaseClient.auth.getUser()).data.user?.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error saving workout:", error);
      throw error;
    }

    return data[0];
  }

  /**
   * Get all workouts for the current user
   * @returns {Promise<Array>} Array of workout objects
   */
  async function getWorkouts() {
    const { data, error } = await supabaseClient
      .from("workouts")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching workouts:", error);
      throw error;
    }

    return data;
  }

  /**
   * Get workouts by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise<Array>} Array of workout objects
   */
  async function getWorkoutsByDateRange(startDate, endDate) {
    const { data, error } = await supabaseClient
      .from("workouts")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching workouts:", error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a workout by ID
   * @param {number} id - Workout ID
   */
  async function deleteWorkout(id) {
    const { error } = await supabaseClient
      .from("workouts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting workout:", error);
      throw error;
    }
  }

  // ============================================================================
  // ACTIVE WELLBEING OPERATIONS
  // ============================================================================

  /**
   * Save an active wellbeing session
   * @param {Object} sessionData
   * @param {string} sessionData.machine - Machine name (e.g., "Rowing", "Bike")
   * @param {string} sessionData.mode - Mode (e.g., "Endurance", "Intervals")
   * @param {number} sessionData.score - Session score
   * @param {string} sessionData.date - Date (ISO format)
   * @returns {Promise<Object>} The saved session
   */
  async function saveActiveWellbeingSession(sessionData) {
    const { data, error } = await supabaseClient
      .from("active_wellbeing_sessions")
      .insert([
        {
          machine: sessionData.machine,
          mode: sessionData.mode,
          score: sessionData.score,
          date: sessionData.date,
          user_id: (await supabaseClient.auth.getUser()).data.user?.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error saving session:", error);
      throw error;
    }

    return data[0];
  }

  /**
   * Get all active wellbeing sessions for the current user
   * @returns {Promise<Array>} Array of session objects
   */
  async function getActiveWellbeingSessions() {
    const { data, error } = await supabaseClient
      .from("active_wellbeing_sessions")
      .select("*")
      .order("date", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }

    return data;
  }

  /**
   * Delete an active wellbeing session by ID
   * @param {number} id - Session ID
   */
  async function deleteActiveWellbeingSession(id) {
    const { error } = await supabaseClient
      .from("active_wellbeing_sessions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

  // ============================================================================
  // USER SETTINGS OPERATIONS
  // ============================================================================

  /**
   * Get user settings
   * @returns {Promise<Object|null>} User settings object or null if not found
   */
  async function getUserSettings() {
    const user = (await supabaseClient.auth.getUser()).data.user;
    if (!user) return null;

    const { data, error } = await supabaseClient
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" - expected for first time users
      console.error("Error fetching settings:", error);
      throw error;
    }

    return data;
  }

  /**
   * Save user settings (creates or updates)
   * @param {Object} settings
   * @param {number} settings.defaultRestTime - Default rest time in seconds
   * @param {number} settings.shortRestTime - Short rest time in seconds
   * @param {number} settings.longRestTime - Long rest time in seconds
   * @returns {Promise<Object>} The saved settings
   */
  async function saveUserSettings(settings) {
    const user = (await supabaseClient.auth.getUser()).data.user;
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabaseClient
      .from("user_settings")
      .upsert([
        {
          user_id: user.id,
          default_rest_time: settings.defaultRestTime,
          short_rest_time: settings.shortRestTime,
          long_rest_time: settings.longRestTime,
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error saving settings:", error);
      throw error;
    }

    return data[0];
  }

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // Workout operations
    saveWorkout,
    getWorkouts,
    getWorkoutsByDateRange,
    deleteWorkout,

    // Active Wellbeing operations
    saveActiveWellbeingSession,
    getActiveWellbeingSessions,
    deleteActiveWellbeingSession,

    // Settings operations
    getUserSettings,
    saveUserSettings,
  };
}

/**
 * Default export for convenience
 * Usage: const db = createDatabaseService(supabaseClient);
 */
export default createDatabaseService;
