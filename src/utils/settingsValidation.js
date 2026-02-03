/**
 * Pure utility functions for settings validation and calculations
 * 100% testable without any React dependencies
 */

export const DEFAULT_SETTINGS = {
  shortRest: 60,
  defaultRest: 90,
  longRest: 120,
};

export const MIN_REST_TIME = 10;
export const MAX_REST_TIME = 300;

/**
 * Validates rest time value
 * @param {number} value - Rest time in seconds
 * @returns {boolean} - Whether the value is valid
 */
export function isValidRestTime(value) {
  const num = Number(value);
  return !isNaN(num) && num >= MIN_REST_TIME && num <= MAX_REST_TIME;
}

/**
 * Validates all settings
 * @param {Object} settings - Settings object
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateSettings(settings) {
  const errors = [];

  if (!isValidRestTime(settings.shortRest)) {
    errors.push(
      `Short rest must be between ${MIN_REST_TIME}-${MAX_REST_TIME}s`,
    );
  }
  if (!isValidRestTime(settings.defaultRest)) {
    errors.push(
      `Default rest must be between ${MIN_REST_TIME}-${MAX_REST_TIME}s`,
    );
  }
  if (!isValidRestTime(settings.longRest)) {
    errors.push(`Long rest must be between ${MIN_REST_TIME}-${MAX_REST_TIME}s`);
  }

  // Logical validation
  if (settings.shortRest >= settings.defaultRest) {
    errors.push("Short rest must be less than default rest");
  }
  if (settings.defaultRest >= settings.longRest) {
    errors.push("Default rest must be less than long rest");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formats settings for display
 * @param {Object} settings - Settings object
 * @returns {Object} - Formatted settings with labels
 */
export function formatSettingsForDisplay(settings) {
  return {
    shortRest: {
      value: settings.shortRest,
      label: "Short Rest",
      description: "For isolation exercises",
    },
    defaultRest: {
      value: settings.defaultRest,
      label: "Default Rest",
      description: "For standard exercises",
    },
    longRest: {
      value: settings.longRest,
      label: "Long Rest",
      description: "For compound exercises",
    },
  };
}

/**
 * Calculates rest time recommendation based on exercise type
 * @param {string} exerciseType - 'isolation', 'standard', or 'compound'
 * @param {Object} settings - Settings object
 * @returns {number} - Recommended rest time in seconds
 */
export function getRecommendedRestTime(exerciseType, settings) {
  switch (exerciseType) {
    case "isolation":
      return settings.shortRest;
    case "compound":
      return settings.longRest;
    case "standard":
    default:
      return settings.defaultRest;
  }
}
