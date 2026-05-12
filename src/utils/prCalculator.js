/**
 * Personal Records (PRs) Calculator
 * Determines if activities set new personal records
 * Created: May 12, 2026
 */

// PR Category Constants
export const PR_CATEGORIES = {
  LONGEST_DISTANCE: 'longest_distance',
  MOST_ELEVATION: 'most_elevation',
  HIGHEST_AVG_SPEED: 'highest_avg_speed',
  LONGEST_DURATION: 'longest_duration',
  MOST_CALORIES: 'most_calories',
  MAX_SPEED: 'max_speed',
};

// PR Category Labels for UI
export const PR_LABELS = {
  [PR_CATEGORIES.LONGEST_DISTANCE]: 'Longest Distance',
  [PR_CATEGORIES.MOST_ELEVATION]: 'Most Elevation',
  [PR_CATEGORIES.HIGHEST_AVG_SPEED]: 'Highest Avg Speed',
  [PR_CATEGORIES.LONGEST_DURATION]: 'Longest Duration',
  [PR_CATEGORIES.MOST_CALORIES]: 'Most Calories',
  [PR_CATEGORIES.MAX_SPEED]: 'Max Speed',
};

// PR Category Icons for UI
export const PR_ICONS = {
  [PR_CATEGORIES.LONGEST_DISTANCE]: 'bi-arrow-right',
  [PR_CATEGORIES.MOST_ELEVATION]: 'bi-triangle',
  [PR_CATEGORIES.HIGHEST_AVG_SPEED]: 'bi-speedometer2',
  [PR_CATEGORIES.LONGEST_DURATION]: 'bi-clock',
  [PR_CATEGORIES.MOST_CALORIES]: 'bi-fire',
  [PR_CATEGORIES.MAX_SPEED]: 'bi-lightning',
};

/**
 * Check if an activity sets any personal records
 * @param {Object} activity - The activity to check
 * @param {Object} existingPRs - Object with current PR values by category
 * @param {string} activityType - Type of activity (Ride, Run, Walk, etc.)
 * @returns {Array} Array of new PRs set by this activity
 */
export function checkForPersonalRecords(activity, existingPRs = {}, activityType) {
  const newPRs = [];

  // 1. Check longest distance
  if (activity.distance && activity.distance > (existingPRs.longest_distance || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.LONGEST_DISTANCE,
      value: activity.distance,
      unit: 'meters',
      previousValue: existingPRs.longest_distance || null,
      improvement: existingPRs.longest_distance 
        ? ((activity.distance - existingPRs.longest_distance) / existingPRs.longest_distance * 100).toFixed(1)
        : null,
    });
  }

  // 2. Check most elevation
  if (activity.total_elevation_gain && activity.total_elevation_gain > (existingPRs.most_elevation || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.MOST_ELEVATION,
      value: activity.total_elevation_gain,
      unit: 'meters',
      previousValue: existingPRs.most_elevation || null,
      improvement: existingPRs.most_elevation
        ? ((activity.total_elevation_gain - existingPRs.most_elevation) / existingPRs.most_elevation * 100).toFixed(1)
        : null,
    });
  }

  // 3. Check highest average speed
  if (activity.average_speed && activity.average_speed > (existingPRs.highest_avg_speed || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.HIGHEST_AVG_SPEED,
      value: activity.average_speed,
      unit: 'meters_per_second',
      previousValue: existingPRs.highest_avg_speed || null,
      improvement: existingPRs.highest_avg_speed
        ? ((activity.average_speed - existingPRs.highest_avg_speed) / existingPRs.highest_avg_speed * 100).toFixed(1)
        : null,
    });
  }

  // 4. Check longest duration
  if (activity.moving_time && activity.moving_time > (existingPRs.longest_duration || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.LONGEST_DURATION,
      value: activity.moving_time,
      unit: 'seconds',
      previousValue: existingPRs.longest_duration || null,
      improvement: existingPRs.longest_duration
        ? ((activity.moving_time - existingPRs.longest_duration) / existingPRs.longest_duration * 100).toFixed(1)
        : null,
    });
  }

  // 5. Check most calories
  if (activity.calories && activity.calories > (existingPRs.most_calories || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.MOST_CALORIES,
      value: activity.calories,
      unit: 'calories',
      previousValue: existingPRs.most_calories || null,
      improvement: existingPRs.most_calories
        ? ((activity.calories - existingPRs.most_calories) / existingPRs.most_calories * 100).toFixed(1)
        : null,
    });
  }

  // 6. Check max speed
  if (activity.max_speed && activity.max_speed > (existingPRs.max_speed || 0)) {
    newPRs.push({
      category: PR_CATEGORIES.MAX_SPEED,
      value: activity.max_speed,
      unit: 'meters_per_second',
      previousValue: existingPRs.max_speed || null,
      improvement: existingPRs.max_speed
        ? ((activity.max_speed - existingPRs.max_speed) / existingPRs.max_speed * 100).toFixed(1)
        : null,
    });
  }

  return newPRs;
}

/**
 * Format PR value for display
 * @param {number} value - The PR value
 * @param {string} unit - The unit (meters, seconds, etc.)
 * @param {boolean} useMetric - Whether to use metric or imperial units
 * @returns {string} Formatted string for display
 */
export function formatPRValue(value, unit, useMetric = false) {
  if (!value) return 'N/A';

  switch (unit) {
    case 'meters':
      if (useMetric) {
        return value >= 1000 
          ? `${(value / 1000).toFixed(2)} km`
          : `${Math.round(value)} m`;
      } else {
        const miles = value * 0.000621371;
        return miles >= 1
          ? `${miles.toFixed(2)} mi`
          : `${Math.round(value * 3.28084)} ft`;
      }

    case 'meters_per_second':
      if (useMetric) {
        return `${(value * 3.6).toFixed(1)} km/h`;
      } else {
        return `${(value * 2.23694).toFixed(1)} mph`;
      }

    case 'seconds':
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      const seconds = Math.floor(value % 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }

    case 'calories':
      return `${Math.round(value)} cal`;

    default:
      return String(value);
  }
}

/**
 * Get time scope for current date (for categorizing PRs)
 * @returns {Object} Object with year and month strings
 */
export function getCurrentTimeScopes() {
  const now = new Date();
  return {
    year: now.getFullYear().toString(),
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  };
}

/**
 * Filter activities by time scope
 * @param {Array} activities - Array of activities
 * @param {string} timeScope - 'all_time', 'year', or 'month'
 * @returns {Array} Filtered activities
 */
export function filterActivitiesByTimeScope(activities, timeScope) {
  if (timeScope === 'all_time') {
    return activities;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return activities.filter(activity => {
    const activityDate = new Date(activity.start_date);
    const activityYear = activityDate.getFullYear();
    const activityMonth = activityDate.getMonth();

    if (timeScope === 'year') {
      return activityYear === currentYear;
    } else if (timeScope === 'month') {
      return activityYear === currentYear && activityMonth === currentMonth;
    }

    return true;
  });
}

/**
 * Calculate PRs for a set of activities
 * Useful for initial calculation or recalculation
 * @param {Array} activities - Array of activities
 * @param {string} activityType - Type to filter by
 * @param {string} timeScope - 'all_time', 'year', or 'month'
 * @returns {Object} Object with PR values by category
 */
export function calculatePRsFromActivities(activities, activityType, timeScope = 'all_time') {
  // Filter by activity type and time scope
  const filtered = activities
    .filter(a => a.type === activityType)
    .filter(a => {
      if (timeScope === 'all_time') return true;
      
      const activityDate = new Date(a.start_date);
      const now = new Date();
      
      if (timeScope === 'year') {
        return activityDate.getFullYear() === now.getFullYear();
      } else if (timeScope === 'month') {
        return activityDate.getFullYear() === now.getFullYear() &&
               activityDate.getMonth() === now.getMonth();
      }
      
      return true;
    });

  if (filtered.length === 0) {
    return null;
  }

  // Find best in each category
  const prs = {};

  // Longest distance
  const longestDistance = Math.max(...filtered.map(a => a.distance || 0));
  if (longestDistance > 0) {
    const activity = filtered.find(a => a.distance === longestDistance);
    prs[PR_CATEGORIES.LONGEST_DISTANCE] = {
      value: longestDistance,
      unit: 'meters',
      activity,
    };
  }

  // Most elevation
  const mostElevation = Math.max(...filtered.map(a => a.total_elevation_gain || 0));
  if (mostElevation > 0) {
    const activity = filtered.find(a => a.total_elevation_gain === mostElevation);
    prs[PR_CATEGORIES.MOST_ELEVATION] = {
      value: mostElevation,
      unit: 'meters',
      activity,
    };
  }

  // Highest average speed
  const highestAvgSpeed = Math.max(...filtered.map(a => a.average_speed || 0));
  if (highestAvgSpeed > 0) {
    const activity = filtered.find(a => a.average_speed === highestAvgSpeed);
    prs[PR_CATEGORIES.HIGHEST_AVG_SPEED] = {
      value: highestAvgSpeed,
      unit: 'meters_per_second',
      activity,
    };
  }

  // Longest duration
  const longestDuration = Math.max(...filtered.map(a => a.moving_time || 0));
  if (longestDuration > 0) {
    const activity = filtered.find(a => a.moving_time === longestDuration);
    prs[PR_CATEGORIES.LONGEST_DURATION] = {
      value: longestDuration,
      unit: 'seconds',
      activity,
    };
  }

  // Most calories
  const mostCalories = Math.max(...filtered.map(a => a.calories || 0));
  if (mostCalories > 0) {
    const activity = filtered.find(a => a.calories === mostCalories);
    prs[PR_CATEGORIES.MOST_CALORIES] = {
      value: mostCalories,
      unit: 'calories',
      activity,
    };
  }

  // Max speed
  const maxSpeed = Math.max(...filtered.map(a => a.max_speed || 0));
  if (maxSpeed > 0) {
    const activity = filtered.find(a => a.max_speed === maxSpeed);
    prs[PR_CATEGORIES.MAX_SPEED] = {
      value: maxSpeed,
      unit: 'meters_per_second',
      activity,
    };
  }

  return prs;
}
