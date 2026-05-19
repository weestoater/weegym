// Supabase Edge Function for Strava Webhooks
// Handles real-time activity updates from Strava

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const STRAVA_CLIENT_SECRET = Deno.env.get("STRAVA_CLIENT_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Strava Webhook Event Handler
 *
 * Handles two types of requests:
 * 1. GET: Webhook subscription verification (responds to challenge)
 * 2. POST: Activity events (create, update, delete)
 */
serve(async (req) => {
  const url = new URL(req.url);

  try {
    // ========================================================================
    // WEBHOOK VERIFICATION (GET REQUEST)
    // ========================================================================
    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      console.log("📥 Webhook verification request:", { mode, token });

      // Strava webhook verification
      if (mode === "subscribe" && token === "WEEGYM_STRAVA_WEBHOOK") {
        console.log("✅ Webhook verification successful");
        return new Response(JSON.stringify({ "hub.challenge": challenge }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response("Verification failed", { status: 403 });
    }

    // ========================================================================
    // WEBHOOK EVENT PROCESSING (POST REQUEST)
    // ========================================================================
    if (req.method === "POST") {
      const event = await req.json();
      console.log("📨 Webhook event received:", JSON.stringify(event, null, 2));

      const {
        object_type,
        object_id,
        aspect_type,
        owner_id,
        subscription_id,
        event_time,
      } = event;

      // Only process activity events
      if (object_type !== "activity") {
        console.log("⏭️  Ignoring non-activity event");
        return new Response("OK", { status: 200 });
      }

      // Find the user with this Strava athlete ID
      const { data: connection, error: connError } = await supabase
        .from("strava_connections")
        .select("user_id, access_token, refresh_token, expires_at")
        .eq("athlete_id", owner_id)
        .single();

      if (connError || !connection) {
        console.error("❌ No user found for athlete_id:", owner_id);
        return new Response("OK", { status: 200 }); // Still return 200 to avoid retries
      }

      console.log("👤 Found user:", connection.user_id);

      // Handle different event types
      switch (aspect_type) {
        case "create":
          await handleActivityCreate(connection, object_id);
          break;

        case "update":
          await handleActivityUpdate(connection, object_id);
          break;

        case "delete":
          await handleActivityDelete(connection.user_id, object_id);
          break;

        default:
          console.log("⚠️  Unknown aspect_type:", aspect_type);
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle new activity creation
 */
async function handleActivityCreate(connection: any, activityId: number) {
  console.log("🆕 Creating activity:", activityId);

  // Fetch activity details from Strava
  const activity = await fetchStravaActivity(connection, activityId);
  if (!activity) return;

  // Estimate calories if not provided
  let calories = activity.calories;
  if (!calories && activity.kilojoules) {
    calories = Math.round(activity.kilojoules * 0.239);
  } else if (!calories) {
    calories = estimateCaloriesFromActivity(activity);
  }

  // Insert into database
  const { error } = await supabase.from("strava_activities").insert({
    user_id: connection.user_id,
    activity_id: activityId,
    name: activity.name,
    type: activity.type,
    sport_type: activity.sport_type || activity.type,
    start_date: activity.start_date,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    calories: calories,
    average_speed: activity.average_speed,
    max_speed: activity.max_speed,
    average_heartrate: activity.average_heartrate,
    max_heartrate: activity.max_heartrate,
    activity_data: activity,
    synced_at: new Date().toISOString(),
  });

  if (error) {
    console.error("❌ Error inserting activity:", error);
  } else {
    console.log("✅ Activity created successfully");
  }
}

/**
 * Handle activity update
 */
async function handleActivityUpdate(connection: any, activityId: number) {
  console.log("🔄 Updating activity:", activityId);

  const activity = await fetchStravaActivity(connection, activityId);
  if (!activity) return;

  let calories = activity.calories;
  if (!calories && activity.kilojoules) {
    calories = Math.round(activity.kilojoules * 0.239);
  } else if (!calories) {
    calories = estimateCaloriesFromActivity(activity);
  }

  const { error } = await supabase
    .from("strava_activities")
    .update({
      name: activity.name,
      type: activity.type,
      sport_type: activity.sport_type || activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain,
      calories: calories,
      average_speed: activity.average_speed,
      max_speed: activity.max_speed,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
      activity_data: activity,
      synced_at: new Date().toISOString(),
    })
    .eq("user_id", connection.user_id)
    .eq("activity_id", activityId);

  if (error) {
    console.error("❌ Error updating activity:", error);
  } else {
    console.log("✅ Activity updated successfully");
  }
}

/**
 * Handle activity deletion
 */
async function handleActivityDelete(userId: string, activityId: number) {
  console.log("🗑️  Deleting activity:", activityId);

  const { error } = await supabase
    .from("strava_activities")
    .delete()
    .eq("user_id", userId)
    .eq("activity_id", activityId);

  if (error) {
    console.error("❌ Error deleting activity:", error);
  } else {
    console.log("✅ Activity deleted successfully");
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch activity details from Strava API
 */
async function fetchStravaActivity(connection: any, activityId: number) {
  // Check if token needs refresh
  const expiresAt = new Date(connection.expires_at);
  let accessToken = connection.access_token;

  if (expiresAt <= new Date()) {
    console.log("🔄 Refreshing expired token");
    const newTokens = await refreshStravaToken(connection.refresh_token);
    if (newTokens) {
      accessToken = newTokens.access_token;

      // Update tokens in database
      await supabase
        .from("strava_connections")
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
        })
        .eq("user_id", connection.user_id);
    }
  }

  // Fetch activity from Strava
  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    console.error("❌ Failed to fetch activity from Strava:", response.status);
    return null;
  }

  return await response.json();
}

/**
 * Refresh Strava access token
 */
async function refreshStravaToken(refreshToken: string) {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: Deno.env.get("STRAVA_CLIENT_ID"),
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    console.error("❌ Failed to refresh token:", response.status);
    return null;
  }

  return await response.json();
}

/**
 * Estimate calories from activity data
 */
function estimateCaloriesFromActivity(activity: any): number {
  const durationHours = activity.moving_time / 3600;
  const distanceKm = activity.distance / 1000;

  // Basic MET-based estimation
  const metValues: Record<string, number> = {
    Run: 10,
    Ride: 8,
    Swim: 8,
    Walk: 3.5,
    Hike: 6,
    default: 6,
  };

  const met = metValues[activity.type] || metValues.default;
  const weight = 75; // Default weight in kg (could be stored in user profile)

  return Math.round(met * weight * durationHours);
}
