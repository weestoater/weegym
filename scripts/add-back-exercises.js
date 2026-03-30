/**
 * Add Back Exercises to Existing Programmes
 *
 * This script adds the new upper and mid back exercises to your existing
 * Day 1 and Day 2 programmes in the database.
 *
 * Run this from the browser console while on the app.
 */

import {
  getWorkoutProgrammeByDay,
  createProgrammeExercises,
} from "../services/userProfileService";

export async function addBackExercises() {
  try {
    console.log("🏋️ Adding back exercises to your programmes...");

    // Get Day 1 programme
    const day1 = await getWorkoutProgrammeByDay(1);
    if (!day1) {
      console.error("❌ Day 1 programme not found");
      return;
    }

    // Get Day 2 programme
    const day2 = await getWorkoutProgrammeByDay(2);
    if (!day2) {
      console.error("❌ Day 2 programme not found");
      return;
    }

    // Day 1 Back Exercises (add after Lat Pulldown)
    const day1BackExercises = [
      {
        name: "Cable Row",
        type: "Machine",
        sets: 3,
        reps: "8-10",
        restSeconds: 90,
        exerciseOrder: 3, // Adjust this based on where you want it
        notes: "Mid back, lats, rhomboids",
      },
      {
        name: "Face Pulls",
        type: "Machine",
        sets: 3,
        reps: "12-15",
        restSeconds: 60,
        exerciseOrder: 4,
        notes: "Upper back, rear delts, rotator cuff",
      },
    ];

    // Day 2 Back Exercises (add after Seated Row)
    const day2BackExercises = [
      {
        name: "T-Bar Row",
        type: "Machine",
        sets: 3,
        reps: "8-10",
        restSeconds: 90,
        exerciseOrder: 2,
        notes: "Mid/upper back, lats, traps",
      },
      {
        name: "Single-Arm Dumbbell Row",
        type: "Free-weights",
        sets: 3,
        reps: "10-12",
        restSeconds: 60,
        exerciseOrder: 3,
        notes: "Unilateral back work - lats and rhomboids",
      },
    ];

    // Add exercises to Day 1
    console.log("Adding exercises to Day 1...");
    const day1Added = await createProgrammeExercises(
      day1.id,
      day1BackExercises,
    );
    console.log(
      `✅ Added ${day1Added.length} exercises to Day 1:`,
      day1Added.map((e) => e.name),
    );

    // Add exercises to Day 2
    console.log("Adding exercises to Day 2...");
    const day2Added = await createProgrammeExercises(
      day2.id,
      day2BackExercises,
    );
    console.log(
      `✅ Added ${day2Added.length} exercises to Day 2:`,
      day2Added.map((e) => e.name),
    );

    console.log("🎉 All back exercises added successfully!");
    console.log("Refresh your profile manager page to see the changes.");

    return {
      success: true,
      day1: day1Added,
      day2: day2Added,
    };
  } catch (error) {
    console.error("❌ Error adding back exercises:", error);
    throw error;
  }
}

// Auto-run if you want
// addBackExercises();
