/**
 * Quick Script to Add Back Exercises - REST API Version
 *
 * HOW TO USE:
 * 1. Open your app at http://localhost:5174/weegym/profile-manager
 * 2. Make sure you're logged in
 * 3. Press F12 to open DevTools
 * 4. Go to Console tab
 * 5. Copy and paste this entire script into the console
 * 6. Press Enter
 * 7. Wait for success message
 * 8. Refresh the page to see the new exercises
 */

(async function addBackExercisesToDatabase() {
  const SUPABASE_URL = "https://huqmjtxwlybjtmouwgaz.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cW1qdHh3bHlianRtb3V3Z2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTU5OTgsImV4cCI6MjA4NTY5MTk5OH0.fL_mfvJMF5FVzJmJfB-GwkhVFNvxMZQZQDKyxWJKsrA";

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    console.log("🏋️ Starting to add back exercises...");

    // Get current user's session
    const sessionResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: headers,
    });

    if (!sessionResponse.ok) {
      throw new Error("Not logged in. Please log in to the app first.");
    }

    const userData = await sessionResponse.json();
    console.log("✓ User authenticated:", userData.email);

    // Get Day 1 programme
    const day1Response = await fetch(
      `${SUPABASE_URL}/rest/v1/workout_programmes?user_id=eq.${userData.id}&day_number=eq.1&select=*,programme_exercises(*)`,
      { headers },
    );
    const day1Data = await day1Response.json();

    if (!day1Data || day1Data.length === 0) {
      console.error(
        "❌ Day 1 programme not found. Create it first in the app!",
      );
      return;
    }

    const day1Programme = day1Data[0];
    console.log("✓ Found Day 1:", day1Programme.name);
    const day1ExerciseCount = day1Programme.programme_exercises?.length || 0;

    // Get Day 2 programme
    const day2Response = await fetch(
      `${SUPABASE_URL}/rest/v1/workout_programmes?user_id=eq.${userData.id}&day_number=eq.2&select=*,programme_exercises(*)`,
      { headers },
    );
    const day2Data = await day2Response.json();

    if (!day2Data || day2Data.length === 0) {
      console.error(
        "❌ Day 2 programme not found. Create it first in the app!",
      );
      return;
    }

    const day2Programme = day2Data[0];
    console.log("✓ Found Day 2:", day2Programme.name);
    const day2ExerciseCount = day2Programme.programme_exercises?.length || 0;

    // Day 1 Back Exercises
    const day1Exercises = [
      {
        programme_id: day1Programme.id,
        exercise_order: day1ExerciseCount + 1,
        name: "Cable Row",
        type: "Machine",
        sets: 3,
        reps: "8-10",
        rest_seconds: 90,
        notes: "Mid back, lats, rhomboids",
      },
      {
        programme_id: day1Programme.id,
        exercise_order: day1ExerciseCount + 2,
        name: "Face Pulls",
        type: "Machine",
        sets: 3,
        reps: "12-15",
        rest_seconds: 60,
        notes: "Upper back, rear delts, rotator cuff",
      },
    ];

    // Day 2 Back Exercises
    const day2Exercises = [
      {
        programme_id: day2Programme.id,
        exercise_order: day2ExerciseCount + 1,
        name: "T-Bar Row",
        type: "Machine",
        sets: 3,
        reps: "8-10",
        rest_seconds: 90,
        notes: "Mid/upper back, lats, traps",
      },
      {
        programme_id: day2Programme.id,
        exercise_order: day2ExerciseCount + 2,
        name: "Single-Arm Dumbbell Row",
        type: "Free-weights",
        sets: 3,
        reps: "10-12",
        rest_seconds: 60,
        notes: "Unilateral back work",
      },
    ];

    // Insert Day 1 exercises
    console.log("Adding exercises to Day 1...");
    const day1InsertResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/programme_exercises`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(day1Exercises),
      },
    );

    if (!day1InsertResponse.ok) {
      const error = await day1InsertResponse.json();
      throw new Error(
        "Failed to add Day 1 exercises: " + JSON.stringify(error),
      );
    }

    const day1Added = await day1InsertResponse.json();
    console.log("✅ Added to Day 1:", day1Added.map((e) => e.name).join(", "));

    // Insert Day 2 exercises
    console.log("Adding exercises to Day 2...");
    const day2InsertResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/programme_exercises`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(day2Exercises),
      },
    );

    if (!day2InsertResponse.ok) {
      const error = await day2InsertResponse.json();
      throw new Error(
        "Failed to add Day 2 exercises: " + JSON.stringify(error),
      );
    }

    const day2Added = await day2InsertResponse.json();
    console.log("✅ Added to Day 2:", day2Added.map((e) => e.name).join(", "));

    console.log("");
    console.log("🎉 SUCCESS! All back exercises added!");
    console.log("📝 Refresh the page to see them in your programme manager.");
    console.log("");
    console.log("Summary:");
    console.log("- Day 1: Added Cable Row, Face Pulls");
    console.log("- Day 2: Added T-Bar Row, Single-Arm Dumbbell Row");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
  }
})();
