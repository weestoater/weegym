/**
 * Calorie Estimation Utility
 * 
 * Since Strava API doesn't expose calorie data from Garmin devices,
 * we estimate calories based on heart rate, activity type, and duration.
 * 
 * These are approximations based on MET (Metabolic Equivalent) values
 * and heart rate zones.
 */

/**
 * Estimate calories burned based on activity data
 * @param {Object} activity - Activity data
 * @param {Object} options - User profile options
 * @returns {number|null} - Estimated calories or null if insufficient data
 */
export function estimateCalories(activity, options = {}) {
  const {
    userWeight = 75, // kg (default: 165 lbs)
    userAge = 40,
    userGender = 'male',
  } = options;

  // Need at least duration and some activity metric
  if (!activity.moving_time) {
    return null;
  }

  const durationHours = activity.moving_time / 3600;
  const distanceKm = activity.distance ? activity.distance / 1000 : 0;

  // Method 1: Heart rate based (most accurate if available)
  if (activity.average_heartrate) {
    return estimateFromHeartRate(
      activity.average_heartrate,
      durationHours,
      userWeight,
      userAge,
      userGender,
    );
  }

  // Method 2: Activity type and intensity (fallback)
  return estimateFromActivityType(
    activity.type,
    durationHours,
    distanceKm,
    userWeight,
  );
}

/**
 * Estimate calories from heart rate
 * Uses the formula: Calories = ((Age × 0.2017) + (Weight × 0.1988) + (HR × 0.6309) − 55.0969) × Time / 4.184
 * This is a simplified version of research-based formulas
 */
function estimateFromHeartRate(avgHR, durationHours, weight, age, gender) {
  // Gender coefficient (males burn slightly more calories at same HR)
  const genderCoeff = gender === 'male' ? 1.0 : 0.95;

  // Simplified formula based on heart rate
  const caloriesPerHour =
    ((age * 0.2017 + weight * 0.1988 + avgHR * 0.6309 - 55.0969) * 60) / 4.184;

  return Math.round(caloriesPerHour * durationHours * genderCoeff);
}

/**
 * Estimate calories from activity type using MET values
 * MET = Metabolic Equivalent of Task (multiples of resting metabolic rate)
 */
function estimateFromActivityType(type, durationHours, distanceKm, weight) {
  let met;

  // Calculate speed if distance available
  const speedKmh = distanceKm > 0 ? distanceKm / durationHours : 0;

  switch (type) {
    case 'Ride':
    case 'VirtualRide':
    case 'EBikeRide':
      // Cycling MET values vary by speed
      if (speedKmh < 16) met = 4.0; // Light cycling
      else if (speedKmh < 19) met = 6.8; // Moderate cycling
      else if (speedKmh < 22) met = 8.0; // Vigorous cycling
      else met = 10.0; // Racing
      break;

    case 'Run':
    case 'VirtualRun':
      // Running MET values vary by pace
      if (speedKmh < 8) met = 8.3; // Jogging
      else if (speedKmh < 11) met = 11.5; // Running
      else met = 14.5; // Fast running
      break;

    case 'Walk':
    case 'Hike':
      // Walking/hiking
      if (speedKmh < 4) met = 3.5; // Slow walk
      else if (speedKmh < 6) met = 4.3; // Moderate walk
      else met = 5.0; // Brisk walk
      break;

    case 'Swim':
      met = 6.0; // Moderate swimming
      break;

    case 'Workout':
    case 'WeightTraining':
      met = 6.0; // General gym workout
      break;

    case 'Yoga':
      met = 2.5;
      break;

    default:
      // Default to moderate activity if unknown
      met = 5.0;
  }

  // Formula: Calories = MET × weight (kg) × duration (hours)
  return Math.round(met * weight * durationHours);
}

/**
 * Get MET value description for display
 */
export function getActivityIntensity(type, speedKmh) {
  switch (type) {
    case 'Ride':
    case 'VirtualRide':
      if (speedKmh < 16) return 'Light';
      if (speedKmh < 22) return 'Moderate';
      return 'Vigorous';

    case 'Run':
      if (speedKmh < 8) return 'Jogging';
      if (speedKmh < 11) return 'Running';
      return 'Fast';

    case 'Walk':
    case 'Hike':
      if (speedKmh < 4) return 'Slow';
      if (speedKmh < 6) return 'Moderate';
      return 'Brisk';

    default:
      return 'Moderate';
  }
}
