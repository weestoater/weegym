import { supabase } from "../lib/supabaseClient";

/**
 * User Profile Service
 * Handles all user profile-related database operations
 */

// ============================================================================
// USER PROFILES
// ============================================================================

/**
 * Get the current user's profile
 * @returns {Promise<Object|null>} User profile or null
 */
export async function getUserProfile() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("User not authenticated:", userError);
      return null;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" - expected for new users
      console.error("Error fetching user profile:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get user profile:", err);
    return null;
  }
}

/**
 * Create or update user profile
 * @param {Object} profileData - Profile information
 * @returns {Promise<Object>} Created/updated profile
 */
export async function saveUserProfile(profileData) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("User not authenticated:", userError);
      throw new Error("You must be logged in to save profile");
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert([
        {
          user_id: userData.user.id,
          email: userData.user.email, // Cache email for display
          display_name: profileData.displayName,
          instructor_name: profileData.instructorName,
          programme_start_date: profileData.programmeStartDate,
          programme_phase: profileData.programmePhase,
          programme_end_date: profileData.programmeEndDate,
          fitness_goal: profileData.fitnessGoal,
          experience_level: profileData.experienceLevel,
          notes: profileData.notes,
          is_active:
            profileData.isActive !== undefined ? profileData.isActive : true,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to save user profile:", err);
    throw err;
  }
}

/**
 * Update specific fields in user profile
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated profile
 */
export async function updateUserProfile(updates) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new Error("You must be logged in to update profile");
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userData.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to update user profile:", err);
    throw err;
  }
}

// ============================================================================
// WORKOUT PROGRAMMES
// ============================================================================

/**
 * Get all workout programmes for the current user
 * @returns {Promise<Array>} List of workout programmes
 */
export async function getWorkoutProgrammes() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.warn("User not logged in for getWorkoutProgrammes");
      return [];
    }

    const { data, error } = await supabase
      .from("workout_programmes")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("day_number", { ascending: true });

    if (error) {
      console.error("Error fetching workout programmes:", error);
      // Return empty array instead of throwing - user might not have programmes yet
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get workout programmes:", err);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Get a specific workout programme by day number
 * @param {number} dayNumber - Day number (1, 2, 3, etc.)
 * @returns {Promise<Object|null>} Workout programme or null
 */
export async function getWorkoutProgrammeByDay(dayNumber) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new Error("You must be logged in");
    }

    const { data, error } = await supabase
      .from("workout_programmes")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("day_number", dayNumber)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching workout programme:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get workout programme:", err);
    return null;
  }
}

/**
 * Create a new workout programme
 * @param {Object} programmeData - Programme information
 * @returns {Promise<Object>} Created programme
 */
export async function createWorkoutProgramme(programmeData) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new Error("You must be logged in");
    }

    const { data, error } = await supabase
      .from("workout_programmes")
      .insert([
        {
          user_id: userData.user.id,
          day_number: programmeData.dayNumber,
          name: programmeData.name,
          description: programmeData.description,
          target_areas: programmeData.targetAreas,
          is_active:
            programmeData.isActive !== undefined
              ? programmeData.isActive
              : true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating workout programme:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to create workout programme:", err);
    throw err;
  }
}

/**
 * Update a workout programme
 * @param {number} programmeId - Programme ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated programme
 */
export async function updateWorkoutProgramme(programmeId, updates) {
  try {
    const { data, error } = await supabase
      .from("workout_programmes")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programmeId)
      .select()
      .single();

    if (error) {
      console.error("Error updating workout programme:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to update workout programme:", err);
    throw err;
  }
}

/**
 * Delete a workout programme (and all its exercises)
 * @param {number} programmeId - Programme ID
 * @returns {Promise<void>}
 */
export async function deleteWorkoutProgramme(programmeId) {
  try {
    const { error } = await supabase
      .from("workout_programmes")
      .delete()
      .eq("id", programmeId);

    if (error) {
      console.error("Error deleting workout programme:", error);
      throw error;
    }
  } catch (err) {
    console.error("Failed to delete workout programme:", err);
    throw err;
  }
}

// ============================================================================
// PROGRAMME EXERCISES
// ============================================================================

/**
 * Get all exercises for a workout programme
 * @param {number} programmeId - Programme ID
 * @returns {Promise<Array>} List of exercises
 */
export async function getProgrammeExercises(programmeId) {
  try {
    const { data, error } = await supabase
      .from("programme_exercises")
      .select("*")
      .eq("programme_id", programmeId)
      .order("exercise_order", { ascending: true });

    if (error) {
      console.error("Error fetching programme exercises:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get programme exercises:", err);
    throw err;
  }
}

/**
 * Get full programme with exercises by day number
 * @param {number} dayNumber - Day number
 * @returns {Promise<Object|null>} Programme with exercises
 */
export async function getFullProgrammeByDay(dayNumber) {
  try {
    // First get the programme
    const programme = await getWorkoutProgrammeByDay(dayNumber);

    if (!programme) {
      return null;
    }

    // Then get the exercises
    const exercises = await getProgrammeExercises(programme.id);

    return {
      ...programme,
      exercises,
    };
  } catch (err) {
    console.error("Failed to get full programme:", err);
    throw err;
  }
}

/**
 * Get all programmes with their exercises for the current user
 * @returns {Promise<Array>} List of programmes with exercises
 */
export async function getAllUserProgrammes() {
  try {
    const programmes = await getWorkoutProgrammes();

    if (!programmes || programmes.length === 0) {
      console.log("No programmes found for user");
      return [];
    }

    const programmesWithExercises = await Promise.all(
      programmes.map(async (programme) => {
        try {
          const exercises = await getProgrammeExercises(programme.id);
          return {
            ...programme,
            exercises,
          };
        } catch (err) {
          console.error(`Failed to get exercises for programme ${programme.id}:`, err);
          return {
            ...programme,
            exercises: [],
          };
        }
      }),
    );

    return programmesWithExercises;
  } catch (err) {
    console.error("Failed to get all user programmes:", err);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Create a new programme exercise
 * @param {number} programmeId - Programme ID
 * @param {Object} exerciseData - Exercise information
 * @returns {Promise<Object>} Created exercise
 */
export async function createProgrammeExercise(programmeId, exerciseData) {
  try {
    const { data, error } = await supabase
      .from("programme_exercises")
      .insert([
        {
          programme_id: programmeId,
          exercise_order: exerciseData.exerciseOrder,
          name: exerciseData.name,
          type: exerciseData.type,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          rest_seconds: exerciseData.restSeconds,
          weight_guidance: exerciseData.weightGuidance,
          notes: exerciseData.notes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating programme exercise:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to create programme exercise:", err);
    throw err;
  }
}

/**
 * Bulk create programme exercises
 * @param {number} programmeId - Programme ID
 * @param {Array} exercises - Array of exercise data
 * @returns {Promise<Array>} Created exercises
 */
export async function createProgrammeExercises(programmeId, exercises) {
  try {
    const exercisesToInsert = exercises.map((exercise, index) => ({
      programme_id: programmeId,
      exercise_order: exercise.exerciseOrder || index + 1,
      name: exercise.name,
      type: exercise.type,
      sets: exercise.sets,
      reps: exercise.reps,
      rest_seconds: exercise.restSeconds,
      weight_guidance: exercise.weightGuidance,
      notes: exercise.notes,
    }));

    const { data, error } = await supabase
      .from("programme_exercises")
      .insert(exercisesToInsert)
      .select();

    if (error) {
      console.error("Error creating programme exercises:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to create programme exercises:", err);
    throw err;
  }
}

/**
 * Update a programme exercise
 * @param {number} exerciseId - Exercise ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated exercise
 */
export async function updateProgrammeExercise(exerciseId, updates) {
  try {
    const { data, error } = await supabase
      .from("programme_exercises")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", exerciseId)
      .select()
      .single();

    if (error) {
      console.error("Error updating programme exercise:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to update programme exercise:", err);
    throw err;
  }
}

/**
 * Delete a programme exercise
 * @param {number} exerciseId - Exercise ID
 * @returns {Promise<void>}
 */
export async function deleteProgrammeExercise(exerciseId) {
  try {
    const { error } = await supabase
      .from("programme_exercises")
      .delete()
      .eq("id", exerciseId);

    if (error) {
      console.error("Error deleting programme exercise:", error);
      throw error;
    }
  } catch (err) {
    console.error("Failed to delete programme exercise:", err);
    throw err;
  }
}

/**
 * Reorder programme exercises
 * @param {number} programmeId - Programme ID
 * @param {Array<{id: number, exerciseOrder: number}>} orderUpdates - Array of exercise IDs with new orders
 * @returns {Promise<void>}
 */
export async function reorderProgrammeExercises(programmeId, orderUpdates) {
  try {
    // Update each exercise's order
    const updates = orderUpdates.map((update) =>
      supabase
        .from("programme_exercises")
        .update({ exercise_order: update.exerciseOrder })
        .eq("id", update.id)
        .eq("programme_id", programmeId),
    );

    await Promise.all(updates);
  } catch (err) {
    console.error("Failed to reorder programme exercises:", err);
    throw err;
  }
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Check if current user is an admin
 * @returns {Promise<boolean>} True if user is admin
 */
export async function isAdmin() {
  try {
    const profile = await getUserProfile();
    console.log("Admin check - Profile:", profile);
    console.log("Admin check - is_admin value:", profile?.is_admin);
    const isAdminUser = profile?.is_admin === true;
    console.log("Admin check - Result:", isAdminUser);
    return isAdminUser;
  } catch (err) {
    console.error("Failed to check admin status:", err);
    return false;
  }
}

/**
 * Get all user profiles (admin only)
 * @returns {Promise<Array>} List of all user profiles
 */
export async function getAllUserProfiles() {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("display_name", { ascending: true });

    if (error) {
      console.error("Error fetching all user profiles:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get all user profiles:", err);
    throw err;
  }
}

/**
 * Get a specific user's profile by user_id (admin only)
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<Object|null>} User profile or null
 */
export async function getUserProfileById(userId) {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user profile by ID:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get user profile by ID:", err);
    return null;
  }
}

/**
 * Update any user's profile (admin only)
 * @param {string} userId - User ID (UUID)
 * @param {Object} profileData - Profile information to update
 * @returns {Promise<Object>} Updated profile
 */
export async function updateUserProfileById(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        display_name: profileData.displayName,
        instructor_name: profileData.instructorName,
        programme_start_date: profileData.programmeStartDate,
        programme_phase: profileData.programmePhase,
        programme_end_date: profileData.programmeEndDate,
        fitness_goal: profileData.fitnessGoal,
        experience_level: profileData.experienceLevel,
        notes: profileData.notes,
        is_active:
          profileData.isActive !== undefined ? profileData.isActive : true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile by ID:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to update user profile by ID:", err);
    throw err;
  }
}

/**
 * Get all workout programmes for a specific user (admin only)
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<Array>} List of workout programmes
 */
export async function getUserProgrammesById(userId) {
  try {
    const { data, error } = await supabase
      .from("workout_programmes")
      .select("*")
      .eq("user_id", userId)
      .order("day_number", { ascending: true });

    if (error) {
      console.error("Error fetching user programmes by ID:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to get user programmes by ID:", err);
    throw err;
  }
}
