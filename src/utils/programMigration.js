import { supabase } from "../lib/supabaseClient";
import {
  saveUserProfile,
  createWorkoutProgramme,
  createProgrammeExercises,
} from "../services/userProfileService";

/**
 * Migration Script - Hardcoded Programme to Database
 *
 * This script migrates the hardcoded programme data from Programme.jsx
 * into the new database schema for the current user.
 *
 * Usage: Import and call migrateCurrentUserProgramme() from your app
 */

// Original hardcoded programme data
const HARDCODED_PROGRAMME = {
  client: {
    name: "Ian Burrett",
    instructor: "Adam",
    date: "31/01/26",
    review: "Intro",
  },
  day1: {
    name: "Day 1 - Upper Body",
    description: "Push Focus: Chest, Shoulders, Triceps",
    target: "Chest • Shoulders • Arms",
    exercises: [
      {
        name: "Chest Press",
        type: "Machine",
        sets: 3,
        reps: "6-8",
        rest: "90s",
      },
      {
        name: "Lat Pulldown",
        type: "Machine",
        sets: 3,
        reps: "8-10",
        rest: "90s",
      },
      {
        name: "Leg Extension",
        type: "Machine",
        sets: 3,
        reps: "10-12",
        rest: "90s",
      },
      {
        name: "Alternating Lateral Raised",
        type: "Free-weights",
        sets: 2,
        reps: "10-12",
        rest: "60s",
      },
      {
        name: "Tricep Pushdown (Rope)",
        type: "Machine",
        sets: 2,
        reps: "10-12",
        rest: "60s",
      },
    ],
  },
  day2: {
    name: "Day 2 - Mixed Areas",
    description: "Legs, Shoulders & Core Strength",
    target: "Legs • Shoulders • Core",
    exercises: [
      {
        name: "Seated Row",
        type: "Machine",
        sets: 3,
        reps: "6-8",
        rest: "90s",
      },
      {
        name: "Leg Curl",
        type: "Machine",
        sets: 3,
        reps: "10-12",
        rest: "90s",
      },
      {
        name: "Shoulder Press",
        type: "Machine",
        sets: 3,
        reps: "8-10",
        rest: "90s",
      },
      {
        name: "Dumbell Hammer Curl",
        type: "Free-weights",
        sets: 2,
        reps: "10-12",
        rest: "60s",
      },
      {
        name: "Overhead Tricep Extensions (V-Bar)",
        type: "Machine",
        sets: 2,
        reps: "10-12",
        rest: "60s",
      },
    ],
  },
};

/**
 * Parse date string (DD/MM/YY) to ISO date
 */
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split("/");
  const fullYear = `20${year}`;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Parse rest time string (e.g., "90s") to seconds
 */
function parseRestSeconds(restStr) {
  return parseInt(restStr.replace("s", ""), 10);
}

/**
 * Migrate current user's profile
 */
async function migrateUserProfile() {
  try {
    console.log("Creating user profile...");

    const profileData = {
      displayName: HARDCODED_PROGRAMME.client.name,
      instructorName: HARDCODED_PROGRAMME.client.instructor,
      programmeStartDate: parseDate(HARDCODED_PROGRAMME.client.date),
      programmePhase: HARDCODED_PROGRAMME.client.review,
      fitnessGoal: "Build strength and foundation",
      experienceLevel: "Beginner",
      isActive: true,
    };

    const profile = await saveUserProfile(profileData);
    console.log("✓ User profile created:", profile);
    return profile;
  } catch (err) {
    console.error("Failed to migrate user profile:", err);
    throw err;
  }
}

/**
 * Migrate a single day's programme
 */
async function migrateProgrammeDay(dayNumber, dayData) {
  try {
    console.log(`Creating programme for Day ${dayNumber}...`);

    // Create the programme
    const programme = await createWorkoutProgramme({
      dayNumber,
      name: dayData.name,
      description: dayData.description,
      targetAreas: dayData.target,
      isActive: true,
    });

    console.log(`✓ Programme created: ${programme.name}`);

    // Create exercises
    const exercises = dayData.exercises.map((exercise, index) => ({
      exerciseOrder: index + 1,
      name: exercise.name,
      type: exercise.type,
      sets: exercise.sets,
      reps: exercise.reps,
      restSeconds: parseRestSeconds(exercise.rest),
    }));

    const createdExercises = await createProgrammeExercises(
      programme.id,
      exercises,
    );
    console.log(
      `✓ Created ${createdExercises.length} exercises for Day ${dayNumber}`,
    );

    return { programme, exercises: createdExercises };
  } catch (err) {
    console.error(`Failed to migrate Day ${dayNumber}:`, err);
    throw err;
  }
}

/**
 * Main migration function - migrates current user's programme
 */
export async function migrateCurrentUserProgramme() {
  try {
    console.log("=== Starting Programme Migration ===");

    // Check if user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      throw new Error("You must be logged in to migrate your programme");
    }

    console.log(`Migrating programme for user: ${userData.user.email}`);

    // Migrate user profile
    const profile = await migrateUserProfile();

    // Migrate Day 1
    const day1 = await migrateProgrammeDay(1, HARDCODED_PROGRAMME.day1);

    // Migrate Day 2
    const day2 = await migrateProgrammeDay(2, HARDCODED_PROGRAMME.day2);

    console.log("=== Migration Completed Successfully! ===");
    console.log({
      profile,
      programmes: [day1, day2],
    });

    return {
      success: true,
      profile,
      programmes: [day1, day2],
    };
  } catch (err) {
    console.error("=== Migration Failed ===");
    console.error(err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Migration function to add a new user with custom data
 * @param {Object} userData - User information
 * @param {Array} programmes - Array of programme days
 */
export async function migrateCustomUserProgramme(userData, programmes) {
  try {
    console.log("=== Starting Custom Programme Migration ===");

    // Check if user is authenticated
    const { data: authData, error: userError } = await supabase.auth.getUser();

    if (userError || !authData?.user) {
      throw new Error("You must be logged in");
    }

    console.log(`Migrating programme for user: ${authData.user.email}`);

    // Create user profile
    const profile = await saveUserProfile({
      displayName: userData.name,
      instructorName: userData.instructor,
      programmeStartDate: userData.startDate,
      programmePhase: userData.phase || "Intro",
      fitnessGoal: userData.fitnessGoal,
      experienceLevel: userData.experienceLevel || "Beginner",
      notes: userData.notes,
      isActive: true,
    });

    console.log("✓ User profile created");

    // Migrate each programme day
    const createdProgrammes = [];
    for (let i = 0; i < programmes.length; i++) {
      const programmeDay = await migrateProgrammeDay(i + 1, programmes[i]);
      createdProgrammes.push(programmeDay);
    }

    console.log("=== Custom Migration Completed Successfully! ===");

    return {
      success: true,
      profile,
      programmes: createdProgrammes,
    };
  } catch (err) {
    console.error("=== Custom Migration Failed ===");
    console.error(err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Helper function to create a template programme for a new user
 * Call this after a new user signs up to give them a starter programme
 */
export async function createStarterProgramme(
  userName,
  instructorName = "Coach",
) {
  const starterProgrammeData = {
    name: userName,
    instructor: instructorName,
    startDate: new Date().toISOString().split("T")[0],
    phase: "Foundation",
    fitnessGoal: "Build strength and learn proper form",
    experienceLevel: "Beginner",
  };

  const starterProgramme = [
    {
      name: "Day 1 - Full Body Foundation",
      description: "Basic compound movements",
      target: "Full Body",
      exercises: [
        {
          name: "Bodyweight Squat",
          type: "Bodyweight",
          sets: 3,
          reps: "10-12",
          rest: "60s",
        },
        {
          name: "Push-ups",
          type: "Bodyweight",
          sets: 3,
          reps: "8-10",
          rest: "60s",
        },
        {
          name: "Assisted Pull-up",
          type: "Machine",
          sets: 3,
          reps: "6-8",
          rest: "90s",
        },
      ],
    },
  ];

  return await migrateCustomUserProgramme(
    starterProgrammeData,
    starterProgramme,
  );
}

export default {
  migrateCurrentUserProgramme,
  migrateCustomUserProgramme,
  createStarterProgramme,
};
