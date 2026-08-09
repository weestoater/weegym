import { supabase } from "./supabaseClient";

/**
 * Workout Database Service
 * Handles all workout-related database operations
 */

// Save a workout
export async function saveWorkout(workoutData) {
  try {
    // Get the user first
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("User not authenticated:", userError);
      throw new Error("You must be logged in to save workouts");
    }

    const { data, error } = await supabase
      .from("workouts")
      .insert([
        {
          date: workoutData.date,
          name: workoutData.name,
          duration: workoutData.duration,
          exercises: workoutData.exercises,
          user_id: userData.user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error saving workout to database:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error("Failed to save workout:", err);
    throw err;
  }
}

// Get all workouts for the current user
export async function getWorkouts() {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching workouts:", error);
    throw error;
  }

  return data;
}

// Get workouts by date range
export async function getWorkoutsByDateRange(startDate, endDate) {
  const { data, error } = await supabase
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

// Update a workout
export async function updateWorkout(id, updates) {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating workout:", error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error("Failed to update workout:", err);
    throw err;
  }
}

// Delete a workout
export async function deleteWorkout(id) {
  const { error } = await supabase.from("workouts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting workout:", error);
    throw error;
  }
}

/**
 * Active Wellbeing Database Service
 */

// Save an active wellbeing session
export async function saveActiveWellbeingSession(sessionData) {
  try {
    // Get the user first
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("User not authenticated:", userError);
      throw new Error("You must be logged in to save sessions");
    }

    const { data, error } = await supabase
      .from("active_wellbeing_sessions")
      .insert([
        {
          machine: sessionData.machine,
          mode: sessionData.mode,
          score: sessionData.score,
          date: sessionData.date,
          user_id: userData.user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error saving session:", error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error("Failed to save session:", err);
    throw err;
  }
}

// Get all active wellbeing sessions
export async function getActiveWellbeingSessions() {
  const { data, error } = await supabase
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

// Update an active wellbeing session
export async function updateActiveWellbeingSession(id, updates) {
  try {
    const updateData = {};
    if (updates.machine !== undefined) updateData.machine = updates.machine;
    if (updates.mode !== undefined) updateData.mode = updates.mode;
    if (updates.score !== undefined) updateData.score = updates.score;
    if (updates.date !== undefined) updateData.date = updates.date;

    const { data, error } = await supabase
      .from("active_wellbeing_sessions")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating session:", error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error("Failed to update session:", err);
    throw err;
  }
}

// Delete an active wellbeing session
export async function deleteActiveWellbeingSession(id) {
  const { error } = await supabase
    .from("active_wellbeing_sessions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
}

/**
 * Settings Database Service
 */

// Get user settings
export async function getUserSettings() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("User not authenticated:", userError);
      return null;
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" - expected for first time users
      console.error("Error fetching settings:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get user settings:", err);
    return null;
  }
}

// Save user settings
export async function saveUserSettings(settings) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("User not authenticated:", userError);
      throw new Error("You must be logged in to save settings");
    }

    const { data, error } = await supabase
      .from("user_settings")
      .upsert([
        {
          user_id: userData.user.id,
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
  } catch (err) {
    console.error("Failed to save user settings:", err);
    throw err;
  }
}

/**
 * Cardio Sessions Database Service
 * Handles cardio equipment tracking (treadmill, rowing machine, cross trainer, etc.)
 */

// Save a cardio session
export async function saveCardioSession(sessionData) {
  try {
    // Get the user first
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("User not authenticated:", userError);
      throw new Error("You must be logged in to save cardio sessions");
    }

    const { data, error } = await supabase
      .from("cardio_sessions")
      .insert([
        {
          equipment_type: sessionData.equipmentType,
          duration_minutes: sessionData.durationMinutes,
          distance_km: sessionData.distanceKm || null,
          calories: sessionData.calories || null,
          avg_heart_rate: sessionData.avgHeartRate || null,
          notes: sessionData.notes || null,
          date: sessionData.date || new Date().toISOString(),
          user_id: userData.user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error saving cardio session:", error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error("Failed to save cardio session:", err);
    throw err;
  }
}

// Get all cardio sessions for the current user
export async function getCardioSessions(options = {}) {
  try {
    let query = supabase
      .from("cardio_sessions")
      .select("*")
      .order("date", { ascending: false });

    // Apply filters if provided
    if (options.equipmentType && options.equipmentType !== "all") {
      query = query.eq("equipment_type", options.equipmentType);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching cardio sessions:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get cardio sessions:", err);
    throw err;
  }
}

// Get cardio sessions by date range
export async function getCardioSessionsByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from("cardio_sessions")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching cardio sessions:", error);
    throw error;
  }

  return data;
}

// Update a cardio session
export async function updateCardioSession(id, updates) {
  try {
    const updateData = {};
    if (updates.equipmentType !== undefined)
      updateData.equipment_type = updates.equipmentType;
    if (updates.durationMinutes !== undefined)
      updateData.duration_minutes = updates.durationMinutes;
    if (updates.distanceKm !== undefined)
      updateData.distance_km = updates.distanceKm;
    if (updates.calories !== undefined) updateData.calories = updates.calories;
    if (updates.avgHeartRate !== undefined)
      updateData.avg_heart_rate = updates.avgHeartRate;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.date !== undefined) updateData.date = updates.date;

    const { data, error } = await supabase
      .from("cardio_sessions")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating cardio session:", error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error("Failed to update cardio session:", err);
    throw err;
  }
}

// Delete a cardio session
export async function deleteCardioSession(id) {
  const { error } = await supabase
    .from("cardio_sessions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting cardio session:", error);
    throw error;
  }
}
