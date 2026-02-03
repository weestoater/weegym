import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSettings } from "../hooks/useSettings";
import { DEFAULT_SETTINGS } from "../utils/settingsValidation";

describe("useSettings Hook", () => {
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      getUserSettings: vi.fn(),
      saveUserSettings: vi.fn(),
    };

    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("Loading Settings", () => {
    it("loads settings from database successfully", async () => {
      const mockSettings = { shortRest: 45, defaultRest: 75, longRest: 105 };
      mockDatabase.getUserSettings.mockResolvedValue(mockSettings);

      const { result } = renderHook(() => useSettings(mockDatabase));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.settings).toEqual(mockSettings);
      expect(mockDatabase.getUserSettings).toHaveBeenCalledTimes(1);
    });

    it("uses default settings when database returns null", async () => {
      mockDatabase.getUserSettings.mockResolvedValue(null);

      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    it("falls back to localStorage on database error", async () => {
      const storedSettings = { shortRest: 50, defaultRest: 80, longRest: 110 };
      localStorage.setItem("gymSettings", JSON.stringify(storedSettings));

      mockDatabase.getUserSettings.mockRejectedValue(
        new Error("Database error"),
      );

      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.settings).toEqual(storedSettings);
      expect(result.current.error).toBe("Failed to load settings");
    });

    it("handles corrupted localStorage data", async () => {
      localStorage.setItem("gymSettings", "invalid json");
      mockDatabase.getUserSettings.mockRejectedValue(
        new Error("Database error"),
      );

      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fall back to defaults
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe("Saving Settings", () => {
    beforeEach(() => {
      mockDatabase.getUserSettings.mockResolvedValue(DEFAULT_SETTINGS);
    });

    it("saves valid settings successfully", async () => {
      mockDatabase.saveUserSettings.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newSettings = { shortRest: 45, defaultRest: 75, longRest: 105 };
      let saveResult;

      await act(async () => {
        saveResult = await result.current.saveSettings(newSettings);
      });

      expect(saveResult.success).toBe(true);
      expect(mockDatabase.saveUserSettings).toHaveBeenCalledWith(newSettings);
      expect(result.current.settings).toEqual(newSettings);

      // Check localStorage backup
      const stored = JSON.parse(localStorage.getItem("gymSettings"));
      expect(stored).toEqual(newSettings);
    });

    it("rejects invalid settings", async () => {
      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const invalidSettings = { shortRest: 5, defaultRest: 90, longRest: 120 };
      let saveResult;

      await act(async () => {
        saveResult = await result.current.saveSettings(invalidSettings);
      });

      expect(saveResult.success).toBe(false);
      expect(saveResult.errors).toBeDefined();
      expect(mockDatabase.saveUserSettings).not.toHaveBeenCalled();
    });

    it("validates logical constraints", async () => {
      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // shortRest >= defaultRest (invalid)
      const invalidSettings = {
        shortRest: 100,
        defaultRest: 90,
        longRest: 120,
      };
      let saveResult;

      await act(async () => {
        saveResult = await result.current.saveSettings(invalidSettings);
      });

      expect(saveResult.success).toBe(false);
      expect(result.current.validationErrors.length).toBeGreaterThan(0);
    });

    it("saves to localStorage even if database fails", async () => {
      mockDatabase.saveUserSettings.mockRejectedValue(
        new Error("Database error"),
      );

      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newSettings = { shortRest: 45, defaultRest: 75, longRest: 105 };

      await act(async () => {
        await result.current.saveSettings(newSettings);
      });

      // Should still save to localStorage
      const stored = JSON.parse(localStorage.getItem("gymSettings"));
      expect(stored).toEqual(newSettings);
      expect(result.current.settings).toEqual(newSettings);
    });
  });

  describe("Updating Settings", () => {
    beforeEach(() => {
      mockDatabase.getUserSettings.mockResolvedValue(DEFAULT_SETTINGS);
    });

    it("updates a single setting", async () => {
      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateSetting("shortRest", 45);
      });

      expect(result.current.settings.shortRest).toBe(45);
      expect(result.current.settings.defaultRest).toBe(
        DEFAULT_SETTINGS.defaultRest,
      );
      expect(result.current.settings.longRest).toBe(DEFAULT_SETTINGS.longRest);
    });

    it("converts string values to numbers", async () => {
      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateSetting("shortRest", "45");
      });

      expect(result.current.settings.shortRest).toBe(45);
      expect(typeof result.current.settings.shortRest).toBe("number");
    });
  });

  describe("Resetting Settings", () => {
    beforeEach(() => {
      mockDatabase.getUserSettings.mockResolvedValue({
        shortRest: 45,
        defaultRest: 75,
        longRest: 105,
      });
      mockDatabase.saveUserSettings.mockResolvedValue(undefined);
    });

    it("resets to default settings", async () => {
      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Settings should be custom values
      expect(result.current.settings.shortRest).toBe(45);

      await act(async () => {
        await result.current.resetSettings();
      });

      // Should be reset to defaults
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
      expect(mockDatabase.saveUserSettings).toHaveBeenCalledWith(
        DEFAULT_SETTINGS,
      );
    });
  });

  describe("Refresh Settings", () => {
    it("reloads settings from database", async () => {
      const initialSettings = { shortRest: 45, defaultRest: 75, longRest: 105 };
      const updatedSettings = { shortRest: 50, defaultRest: 80, longRest: 110 };

      mockDatabase.getUserSettings.mockResolvedValueOnce(initialSettings);

      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.settings).toEqual(initialSettings);

      // Simulate external update
      mockDatabase.getUserSettings.mockResolvedValueOnce(updatedSettings);

      await act(async () => {
        await result.current.refreshSettings();
      });

      expect(result.current.settings).toEqual(updatedSettings);
    });
  });

  describe("State Management", () => {
    it("manages loading state correctly", async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockDatabase.getUserSettings.mockReturnValue(promise);

      const { result } = renderHook(() => useSettings(mockDatabase));

      expect(result.current.loading).toBe(true);

      resolvePromise(DEFAULT_SETTINGS);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("manages saving state correctly", async () => {
      mockDatabase.getUserSettings.mockResolvedValue(DEFAULT_SETTINGS);

      let resolveSave;
      const savePromise = new Promise((resolve) => {
        resolveSave = resolve;
      });
      mockDatabase.saveUserSettings.mockReturnValue(savePromise);

      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.saveSettings(DEFAULT_SETTINGS);
      });

      expect(result.current.saving).toBe(true);

      resolveSave();

      await waitFor(() => {
        expect(result.current.saving).toBe(false);
      });
    });

    it("clears errors on successful operations", async () => {
      mockDatabase.getUserSettings.mockResolvedValue(DEFAULT_SETTINGS);
      mockDatabase.saveUserSettings.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSettings(mockDatabase));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger validation error
      await act(async () => {
        await result.current.saveSettings({
          shortRest: 5,
          defaultRest: 90,
          longRest: 120,
        });
      });

      expect(result.current.validationErrors.length).toBeGreaterThan(0);

      // Save valid settings
      await act(async () => {
        await result.current.saveSettings(DEFAULT_SETTINGS);
      });

      expect(result.current.validationErrors).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });
});
