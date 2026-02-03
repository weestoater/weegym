import { describe, it, expect } from "vitest";
import {
  DEFAULT_SETTINGS,
  isValidRestTime,
  validateSettings,
  formatSettingsForDisplay,
  getRecommendedRestTime,
} from "../utils/settingsValidation";

describe("settingsValidation Utils", () => {
  describe("isValidRestTime", () => {
    it("accepts valid rest times", () => {
      expect(isValidRestTime(60)).toBe(true);
      expect(isValidRestTime(90)).toBe(true);
      expect(isValidRestTime(120)).toBe(true);
    });

    it("rejects times below minimum", () => {
      expect(isValidRestTime(5)).toBe(false);
      expect(isValidRestTime(0)).toBe(false);
      expect(isValidRestTime(-10)).toBe(false);
    });

    it("rejects times above maximum", () => {
      expect(isValidRestTime(301)).toBe(false);
      expect(isValidRestTime(500)).toBe(false);
    });

    it("accepts boundary values", () => {
      expect(isValidRestTime(10)).toBe(true);
      expect(isValidRestTime(300)).toBe(true);
    });

    it("handles string numbers", () => {
      expect(isValidRestTime("60")).toBe(true);
      expect(isValidRestTime("90")).toBe(true);
    });

    it("rejects non-numeric values", () => {
      expect(isValidRestTime("abc")).toBe(false);
      expect(isValidRestTime(NaN)).toBe(false);
      expect(isValidRestTime(null)).toBe(false);
      expect(isValidRestTime(undefined)).toBe(false);
    });
  });

  describe("validateSettings", () => {
    it("validates correct settings", () => {
      const result = validateSettings({
        shortRest: 60,
        defaultRest: 90,
        longRest: 120,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects invalid shortRest", () => {
      const result = validateSettings({
        shortRest: 5,
        defaultRest: 90,
        longRest: 120,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("rejects shortRest >= defaultRest", () => {
      const result = validateSettings({
        shortRest: 100,
        defaultRest: 90,
        longRest: 120,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Short rest must be less than default rest",
      );
    });

    it("rejects defaultRest >= longRest", () => {
      const result = validateSettings({
        shortRest: 60,
        defaultRest: 130,
        longRest: 120,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Default rest must be less than long rest",
      );
    });

    it("returns multiple errors for multiple issues", () => {
      const result = validateSettings({
        shortRest: 5,
        defaultRest: 500,
        longRest: 5,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it("validates DEFAULT_SETTINGS", () => {
      const result = validateSettings(DEFAULT_SETTINGS);
      expect(result.valid).toBe(true);
    });
  });

  describe("formatSettingsForDisplay", () => {
    it("formats settings correctly", () => {
      const settings = {
        shortRest: 60,
        defaultRest: 90,
        longRest: 120,
      };

      const formatted = formatSettingsForDisplay(settings);

      expect(formatted.shortRest.value).toBe(60);
      expect(formatted.shortRest.label).toBe("Short Rest");
      expect(formatted.shortRest.description).toBeDefined();

      expect(formatted.defaultRest.value).toBe(90);
      expect(formatted.longRest.value).toBe(120);
    });

    it("includes all three rest types", () => {
      const formatted = formatSettingsForDisplay(DEFAULT_SETTINGS);

      expect(formatted).toHaveProperty("shortRest");
      expect(formatted).toHaveProperty("defaultRest");
      expect(formatted).toHaveProperty("longRest");
    });
  });

  describe("getRecommendedRestTime", () => {
    const settings = {
      shortRest: 60,
      defaultRest: 90,
      longRest: 120,
    };

    it("returns shortRest for isolation exercises", () => {
      expect(getRecommendedRestTime("isolation", settings)).toBe(60);
    });

    it("returns longRest for compound exercises", () => {
      expect(getRecommendedRestTime("compound", settings)).toBe(120);
    });

    it("returns defaultRest for standard exercises", () => {
      expect(getRecommendedRestTime("standard", settings)).toBe(90);
    });

    it("returns defaultRest for unknown exercise types", () => {
      expect(getRecommendedRestTime("unknown", settings)).toBe(90);
      expect(getRecommendedRestTime("", settings)).toBe(90);
      expect(getRecommendedRestTime(null, settings)).toBe(90);
    });
  });
});
