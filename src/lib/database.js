import { supabase } from "./supabaseClient";

/**
 * Workout Database Service
 * Handles all workout-related database operations
 */

// Save a workout
export async function saveWorkout(workoutData) {
  const { data, error } = await supabase
    .from("workouts")
    .insert([
      {
        date: workoutData.date,
        name: workoutData.name,
        duration: workoutData.duration,
        exercises: workoutData.exercises,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      },
    ])
    .select();

  if (error) {
    console.error("Error saving workout:", error);
    throw error;
  }

  return data[0];
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
  const { data, error } = await supabase
    .from("active_wellbeing_sessions")
    .insert([
      {
        machine: sessionData.machine,
        mode: sessionData.mode,
        score: sessionData.score,
        date: sessionData.date,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      },
    ])
    .select();

  if (error) {
    console.error("Error saving session:", error);
    throw error;
  }

  return data[0];
}

// Get all active wellbeing sessions
export async function getActiveWellbeingSessions() {
  const { data, error } = await supabase
    .from("active_wellbeing_sessions")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }

  return data;
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
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const { data, error } = await supabase
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

// Save user settings
export async function saveUserSettings(settings) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
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
