/**
 * Error Utilities
 * Helper functions for better error handling and user-friendly messages
 */

/**
 * Format error for user display
 * Converts technical errors into user-friendly messages
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - Optional custom fallback message
 * @returns {string} User-friendly error message
 */
export function formatErrorMessage(error, fallbackMessage = null) {
  // Network errors
  if (!navigator.onLine) {
    return "No internet connection. Please check your network and try again.";
  }

  // Supabase errors
  if (error?.code === "PGRST301") {
    return "Session expired. Please log in again.";
  }

  if (error?.code === "23505") {
    return "This item already exists. Please use a different name or identifier.";
  }

  if (error?.code === "23503") {
    return "Cannot complete this action due to related data. Please try a different approach.";
  }

  // Auth errors
  if (error?.message?.includes("JWT") || error?.message?.includes("token")) {
    return "Your session has expired. Please log in again.";
  }

  if (error?.message?.includes("logged in")) {
    return "You must be logged in to perform this action.";
  }

  // Network/fetch errors
  if (
    error?.message?.includes("fetch") ||
    error?.message?.includes("network")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // Rate limiting
  if (error?.status === 429 || error?.message?.includes("rate limit")) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // Server errors
  if (error?.status >= 500) {
    return "Server error. Our team has been notified. Please try again later.";
  }

  // Default to fallback message, error message, or generic fallback
  return (
    fallbackMessage ||
    error?.message ||
    "An unexpected error occurred. Please try again."
  );
}

/**
 * Validate form fields
 * Returns array of error messages
 */
export function validateForm(fields, rules) {
  const errors = [];

  Object.keys(rules).forEach((fieldName) => {
    const value = fields[fieldName];
    const fieldRules = rules[fieldName];

    // Required validation
    if (fieldRules.required && !value) {
      errors.push(`${fieldRules.label || fieldName} is required`);
      return;
    }

    // Skip other validations if empty and not required
    if (!value) return;

    // Min length validation
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors.push(
        `${fieldRules.label || fieldName} must be at least ${fieldRules.minLength} characters`,
      );
    }

    // Max length validation
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors.push(
        `${fieldRules.label || fieldName} must be no more than ${fieldRules.maxLength} characters`,
      );
    }

    // Min value validation
    if (fieldRules.min !== undefined && Number(value) < fieldRules.min) {
      errors.push(
        `${fieldRules.label || fieldName} must be at least ${fieldRules.min}`,
      );
    }

    // Max value validation
    if (fieldRules.max !== undefined && Number(value) > fieldRules.max) {
      errors.push(
        `${fieldRules.label || fieldName} must be no more than ${fieldRules.max}`,
      );
    }

    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors.push(
        fieldRules.patternMessage ||
          `${fieldRules.label || fieldName} is invalid`,
      );
    }

    // Custom validation
    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, fields);
      if (customError) {
        errors.push(customError);
      }
    }
  });

  return errors;
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-+()]+$/,
  url: /^https?:\/\/.+/,
  number: /^\d+$/,
  decimal: /^\d+\.?\d*$/,
};

/**
 * Get user-friendly HTTP status message
 */
export function getStatusMessage(status) {
  const messages = {
    400: "Invalid request. Please check your input.",
    401: "Authentication required. Please log in.",
    403: "Access denied. You don't have permission for this action.",
    404: "Not found. The requested item doesn't exist.",
    408: "Request timeout. Please try again.",
    429: "Too many requests. Please wait and try again.",
    500: "Server error. Please try again later.",
    502: "Service unavailable. Please try again later.",
    503: "Service temporarily unavailable. Please try again later.",
  };

  return messages[status] || `Request failed with status ${status}`;
}

/**
 * Log error for debugging (without exposing to user)
 */
export function logError(error, context = "") {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error?.message,
    stack: error?.stack,
    code: error?.code,
    status: error?.status,
  };

  console.error(`[Error ${timestamp}]`, context, errorInfo);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
  if (import.meta.env.PROD) {
    // window.errorTracker?.captureException(error, { context });
  }

  return errorInfo;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on auth errors or client errors (4xx)
      if (error?.status >= 400 && error?.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export default formatErrorMessage;
