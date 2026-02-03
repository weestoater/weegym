/**
 * Settings Service
 * Abstracts database operations for settings
 * Can be easily mocked in tests
 */

/**
 * Creates a settings service with the provided database client
 * @param {Object} database - Database client
 * @returns {Object} - Settings service methods
 */
export function createSettingsService(database) {
  return {
    /**
     * Get user settings from database
     * @returns {Promise<Object|null>} - Settings object or null
     */
    async getUserSettings() {
      return database.getUserSettings();
    },

    /**
     * Save user settings to database
     * @param {Object} settings - Settings to save
     * @returns {Promise<void>}
     */
    async saveUserSettings(settings) {
      return database.saveUserSettings(settings);
    },
  };
}

/**
 * Default settings service using the real database
 */
import * as databaseModule from "../lib/database";

export const defaultSettingsService = createSettingsService(databaseModule);
