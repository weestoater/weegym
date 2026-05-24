/**
 * Step Calculation Utilities
 * Helper functions for step-related calculations and conversions
 * Created: May 24, 2026
 */

// ============================================================================
// CONSTANTS
// ============================================================================

// Average values - can be customized per user in future
const AVERAGE_STRIDE_LENGTH_M = 0.75; // meters per step
const CALORIES_PER_1000_STEPS = 45; // average for 70kg person
const STEPS_PER_ACTIVE_MINUTE = 100; // typical walking pace

// Step goal levels with colors
export const STEP_LEVELS = {
  EXCELLENT: { threshold: 1.2, color: "success", label: "Excellent!" },
  GREAT: { threshold: 1.0, color: "primary", label: "Goal Met!" },
  GOOD: { threshold: 0.75, color: "info", label: "Good Progress" },
  FAIR: { threshold: 0.5, color: "warning", label: "Keep Going" },
  LOW: { threshold: 0, color: "danger", label: "Just Starting" },
};

// Achievement thresholds
export const ACHIEVEMENT_THRESHOLDS = {
  FIRST_10K: 10000,
  MARATHON_DAY: 20000,
  ULTRA_DAY: 30000,
  WEEKLY_STREAK: 7,
  MONTHLY_STREAK: 30,
  YEARLY_STREAK: 365,
};

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert steps to distance in meters
 * @param {number} steps - Number of steps
 * @param {number} strideLength - Stride length in meters (optional)
 * @returns {number} Distance in meters
 */
export function stepsToMeters(steps, strideLength = AVERAGE_STRIDE_LENGTH_M) {
  return Math.round(steps * strideLength);
}

/**
 * Convert steps to distance in kilometers
 * @param {number} steps - Number of steps
 * @param {number} strideLength - Stride length in meters (optional)
 * @returns {number} Distance in kilometers (rounded to 2 decimals)
 */
export function stepsToKilometers(
  steps,
  strideLength = AVERAGE_STRIDE_LENGTH_M,
) {
  return Math.round(((steps * strideLength) / 1000) * 100) / 100;
}

/**
 * Convert steps to distance in miles
 * @param {number} steps - Number of steps
 * @param {number} strideLength - Stride length in meters (optional)
 * @returns {number} Distance in miles (rounded to 2 decimals)
 */
export function stepsToMiles(steps, strideLength = AVERAGE_STRIDE_LENGTH_M) {
  const meters = steps * strideLength;
  const miles = meters / 1609.34; // meters per mile
  return Math.round(miles * 100) / 100;
}

/**
 * Convert steps to calories burned
 * @param {number} steps - Number of steps
 * @param {number} weightKg - User weight in kg (optional, affects accuracy)
 * @returns {number} Estimated calories burned
 */
export function stepsToCalories(steps, weightKg = 70) {
  // More accurate formula accounting for weight
  // Average person burns ~0.04-0.05 calories per step
  const caloriesPerStep = 0.04 * (weightKg / 70); // Adjust for weight
  return Math.round(steps * caloriesPerStep);
}

/**
 * Estimate active minutes from steps
 * @param {number} steps - Number of steps
 * @param {number} paceStepsPerMin - Walking pace (optional)
 * @returns {number} Estimated active minutes
 */
export function stepsToActiveMinutes(
  steps,
  paceStepsPerMin = STEPS_PER_ACTIVE_MINUTE,
) {
  return Math.round(steps / paceStepsPerMin);
}

/**
 * Calculate stride length from height
 * @param {number} heightCm - Height in centimeters
 * @param {string} gender - 'male' or 'female' (optional)
 * @returns {number} Estimated stride length in meters
 */
export function calculateStrideLength(heightCm, gender = "male") {
  // Rule of thumb: stride length is ~0.413 * height for women, ~0.415 * height for men
  const factor = gender === "female" ? 0.413 : 0.415;
  return (heightCm * factor) / 100; // convert to meters
}

// ============================================================================
// PROGRESS & ACHIEVEMENT FUNCTIONS
// ============================================================================

/**
 * Get progress percentage towards goal
 * @param {number} steps - Current steps
 * @param {number} goal - Goal steps
 * @returns {number} Percentage (0-100)
 */
export function getProgressPercentage(steps, goal) {
  if (!goal || goal === 0) return 0;
  const percentage = (steps / goal) * 100;
  return Math.min(Math.round(percentage), 100);
}

/**
 * Get step level based on progress
 * @param {number} steps - Current steps
 * @param {number} goal - Goal steps
 * @returns {Object} Level object with threshold, color, and label
 */
export function getStepLevel(steps, goal) {
  if (!goal || goal === 0) return STEP_LEVELS.LOW;

  const ratio = steps / goal;

  if (ratio >= STEP_LEVELS.EXCELLENT.threshold) return STEP_LEVELS.EXCELLENT;
  if (ratio >= STEP_LEVELS.GREAT.threshold) return STEP_LEVELS.GREAT;
  if (ratio >= STEP_LEVELS.GOOD.threshold) return STEP_LEVELS.GOOD;
  if (ratio >= STEP_LEVELS.FAIR.threshold) return STEP_LEVELS.FAIR;
  return STEP_LEVELS.LOW;
}

/**
 * Get color class for Bootstrap progress bar
 * @param {number} steps - Current steps
 * @param {number} goal - Goal steps
 * @returns {string} Bootstrap color class (bg-success, bg-primary, etc.)
 */
export function getProgressColor(steps, goal) {
  const level = getStepLevel(steps, goal);
  return `bg-${level.color}`;
}

/**
 * Format large numbers with commas (e.g., 12,345)
 * @param {number} value - Number to format
 * @returns {string} Formatted string
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return "--";
  return value.toLocaleString();
}

/**
 * Check if day meets goal
 * @param {number} steps - Steps taken
 * @param {number} goal - Goal steps
 * @returns {boolean} True if goal met
 */
export function meetsGoal(steps, goal) {
  return steps >= goal;
}

// ============================================================================
// STREAK CALCULATIONS
// ============================================================================

/**
 * Calculate consecutive days meeting goal (from sorted array)
 * @param {Array} dailySteps - Array of daily step objects (must be sorted desc by date)
 * @returns {number} Current streak in days
 */
export function calculateStreakFromArray(dailySteps) {
  if (!dailySteps || dailySteps.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];

  for (const day of dailySteps) {
    if (day.total_steps >= day.goal_steps) {
      streak++;
    } else if (day.date !== today) {
      // Streak broken (but don't penalize incomplete today)
      break;
    } else {
      // Today not complete yet
      break;
    }
  }

  return streak;
}

/**
 * Get streak emoji based on length
 * @param {number} streak - Streak length in days
 * @returns {string} Emoji
 */
export function getStreakEmoji(streak) {
  if (streak === 0) return "😴";
  if (streak < 3) return "🔥";
  if (streak < 7) return "💪";
  if (streak < 14) return "🎯";
  if (streak < 30) return "🚀";
  if (streak < 100) return "⭐";
  return "👑"; // 100+ days!
}

/**
 * Get motivational message based on streak
 * @param {number} streak - Streak length in days
 * @returns {string} Motivational message
 */
export function getStreakMessage(streak) {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Keep it going!";
  if (streak < 3) return "Building momentum!";
  if (streak < 7) return "Impressive consistency!";
  if (streak < 14) return "You're on fire!";
  if (streak < 30) return "Unstoppable!";
  if (streak < 100) return "Legend status!";
  return "Hall of Fame!";
}

// ============================================================================
// WEEKLY STATISTICS
// ============================================================================

/**
 * Calculate weekly statistics from daily data
 * @param {Array} dailySteps - Array of daily step objects for the week
 * @returns {Object} Weekly statistics
 */
export function calculateWeeklyStats(dailySteps) {
  if (!dailySteps || dailySteps.length === 0) {
    return {
      totalSteps: 0,
      avgDailySteps: 0,
      daysGoalMet: 0,
      bestDay: null,
      worstDay: null,
      totalDistance: 0,
      totalCalories: 0,
    };
  }

  const totalSteps = dailySteps.reduce((sum, d) => sum + d.total_steps, 0);
  const avgDailySteps = Math.round(totalSteps / dailySteps.length);
  const daysGoalMet = dailySteps.filter(
    (d) => d.total_steps >= d.goal_steps,
  ).length;

  const bestDay = dailySteps.reduce((best, d) =>
    d.total_steps > (best?.total_steps || 0) ? d : best,
  );

  const worstDay = dailySteps.reduce((worst, d) =>
    d.total_steps < (worst?.total_steps || Infinity) ? d : worst,
  );

  const totalDistance = stepsToKilometers(totalSteps);
  const totalCalories = stepsToCalories(totalSteps);

  return {
    totalSteps,
    avgDailySteps,
    daysGoalMet,
    bestDay,
    worstDay,
    totalDistance,
    totalCalories,
  };
}

/**
 * Calculate week-over-week change
 * @param {number} currentWeekSteps - Steps this week
 * @param {number} previousWeekSteps - Steps last week
 * @returns {Object} Change data with percentage and direction
 */
export function calculateWeeklyChange(currentWeekSteps, previousWeekSteps) {
  if (!previousWeekSteps || previousWeekSteps === 0) {
    return { change: 0, percentage: 0, direction: "neutral" };
  }

  const change = currentWeekSteps - previousWeekSteps;
  const percentage = Math.round((change / previousWeekSteps) * 100);
  const direction = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return {
    change,
    percentage: Math.abs(percentage),
    direction,
  };
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get Monday of the current week (ISO week)
 * @param {Date} date - Any date in the week (optional, defaults to today)
 * @returns {Date} Monday of that week
 */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get Sunday of the current week (ISO week)
 * @param {Date} date - Any date in the week (optional, defaults to today)
 * @returns {Date} Sunday of that week
 */
export function getWeekEnd(date = new Date()) {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Get day name from date
 * @param {string|Date} date - Date to format
 * @returns {string} Day name (e.g., 'Monday')
 */
export function getDayName(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

/**
 * Get short day name from date
 * @param {string|Date} date - Date to format
 * @returns {string} Short day name (e.g., 'Mon')
 */
export function getShortDayName(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (e.g., 'May 24, 2026')
 */
export function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get relative date string
 * @param {string|Date} date - Date to format
 * @returns {string} Relative date (e.g., 'Today', 'Yesterday', 'May 24')
 */
export function getRelativeDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = d.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============================================================================
// ACHIEVEMENTS & BADGES
// ============================================================================

/**
 * Check what achievements have been unlocked
 * @param {Object} stats - User statistics
 * @param {number} stats.totalSteps - Total lifetime steps
 * @param {number} stats.bestDay - Best single day steps
 * @param {number} stats.currentStreak - Current streak
 * @param {number} stats.longestStreak - Longest streak ever
 * @returns {Array} Array of unlocked achievement objects
 */
export function checkAchievements(stats) {
  const achievements = [];

  // Single day achievements
  if (stats.bestDay >= ACHIEVEMENT_THRESHOLDS.ULTRA_DAY) {
    achievements.push({
      id: "ultra_day",
      title: "Ultra Walker",
      description: "30,000+ steps in one day!",
      icon: "🏆",
      level: "gold",
    });
  } else if (stats.bestDay >= ACHIEVEMENT_THRESHOLDS.MARATHON_DAY) {
    achievements.push({
      id: "marathon_day",
      title: "Marathon Day",
      description: "20,000+ steps in one day!",
      icon: "🏃",
      level: "silver",
    });
  } else if (stats.bestDay >= ACHIEVEMENT_THRESHOLDS.FIRST_10K) {
    achievements.push({
      id: "first_10k",
      title: "First 10K",
      description: "Reached 10,000 steps!",
      icon: "🎯",
      level: "bronze",
    });
  }

  // Streak achievements
  if (stats.currentStreak >= ACHIEVEMENT_THRESHOLDS.YEARLY_STREAK) {
    achievements.push({
      id: "yearly_streak",
      title: "Year Warrior",
      description: "365 day streak!",
      icon: "👑",
      level: "platinum",
    });
  } else if (stats.currentStreak >= ACHIEVEMENT_THRESHOLDS.MONTHLY_STREAK) {
    achievements.push({
      id: "monthly_streak",
      title: "Monthly Master",
      description: "30 day streak!",
      icon: "⭐",
      level: "gold",
    });
  } else if (stats.currentStreak >= ACHIEVEMENT_THRESHOLDS.WEEKLY_STREAK) {
    achievements.push({
      id: "weekly_streak",
      title: "Week Warrior",
      description: "7 day streak!",
      icon: "🔥",
      level: "silver",
    });
  }

  // Milestone achievements
  const millionSteps = Math.floor(stats.totalSteps / 1000000);
  if (millionSteps >= 1) {
    achievements.push({
      id: "million_steps",
      title: `${millionSteps} Million Steps`,
      description: "Lifetime milestone!",
      icon: "💎",
      level: "platinum",
    });
  }

  return achievements;
}

/**
 * Get next milestone for motivation
 * @param {number} currentSteps - Current total/daily steps
 * @param {string} type - 'daily' or 'total'
 * @returns {Object} Next milestone info
 */
export function getNextMilestone(currentSteps, type = "daily") {
  if (type === "daily") {
    if (currentSteps < 10000) {
      return {
        target: 10000,
        label: "First 10K Day",
        remaining: 10000 - currentSteps,
      };
    } else if (currentSteps < 20000) {
      return {
        target: 20000,
        label: "Marathon Day",
        remaining: 20000 - currentSteps,
      };
    } else if (currentSteps < 30000) {
      return {
        target: 30000,
        label: "Ultra Day",
        remaining: 30000 - currentSteps,
      };
    }
    return { target: null, label: "Legend!", remaining: 0 };
  } else {
    // Total steps
    const nextMillion = Math.ceil(currentSteps / 1000000) * 1000000;
    return {
      target: nextMillion,
      label: `${nextMillion / 1000000} Million Steps`,
      remaining: nextMillion - currentSteps,
    };
  }
}
