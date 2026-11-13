import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  THEME_STYLE_ID,
  getStoredTheme,
  isValidTheme,
  setTheme,
} from "../utils/themes";

describe("themes", () => {
  beforeEach(() => {
    localStorage.clear();
    document.getElementById(THEME_STYLE_ID)?.remove();
    document.documentElement.removeAttribute("data-theme");
  });

  it("exposes every Bootswatch theme including the default", () => {
    expect(THEMES).toHaveLength(26);
    expect(isValidTheme(DEFAULT_THEME)).toBe(true);
    expect(isValidTheme("not-a-theme")).toBe(false);
  });

  it("falls back to the default theme for unknown stored values", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "not-a-theme");
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
  });

  it("applies and persists the selected theme", async () => {
    const applied = await setTheme("cerulean");

    expect(applied).toBe("cerulean");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("cerulean");
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "cerulean",
    );
    expect(document.getElementById(THEME_STYLE_ID)).not.toBeNull();
  }, 30000);
});
