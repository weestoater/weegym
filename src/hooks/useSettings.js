import { useState, useEffect, useCallback } from "react";
import {
  DEFAULT_SETTINGS,
  validateSettings,
} from "../utils/settingsValidation";

/**
 * Custom hook for managing settings
 * Handles loading, saving, and validation logic
 * Can be tested independently of UI components
 *
 * @param {Object} database - Database service (injected for testability)
 * @returns {Object} - Settings state and methods
 */
export function useSettings(database) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  /**
   * Load settings from database with localStorage fallback
   */
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const savedSettings = await database.getUserSettings();

      if (savedSettings) {
        setSettings(savedSettings);
      } else {
        // Try localStorage fallback
        const storedSettings = localStorage.getItem("gymSettings");
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load settings");

      // Fallback to localStorage
      const storedSettings = localStorage.getItem("gymSettings");
      if (storedSettings) {
        try {
          setSettings(JSON.parse(storedSettings));
        } catch (parseErr) {
          console.error("Error parsing stored settings:", parseErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [database]);

  /**
   * Save settings to database with localStorage backup
   */
  const saveSettings = useCallback(
    async (newSettings) => {
      // Validate before saving
      const validation = validateSettings(newSettings);

      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return { success: false, errors: validation.errors };
      }

      try {
        setSaving(true);
        setError(null);
        setValidationErrors([]);

        await database.saveUserSettings(newSettings);

        // Backup to localStorage
        localStorage.setItem("gymSettings", JSON.stringify(newSettings));

        setSettings(newSettings);

        return { success: true };
      } catch (err) {
        console.error("Error saving settings:", err);
        setError("Failed to save settings");

        // Still save to localStorage as fallback
        localStorage.setItem("gymSettings", JSON.stringify(newSettings));
        setSettings(newSettings);

        return { success: false, error: err.message };
      } finally {
        setSaving(false);
      }
    },
    [database],
  );

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(async () => {
    return saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  /**
   * Update a single setting value
   */
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    validationErrors,
    saveSettings,
    resetSettings,
    updateSetting,
    refreshSettings: loadSettings,
  };
}
