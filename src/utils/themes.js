export const DEFAULT_THEME = "darkly";
export const THEME_STORAGE_KEY = "weegym-theme";
export const THEME_STYLE_ID = "weegym-theme-style";
export const THEME_CHANGE_EVENT = "weegym-theme-change";

// Each theme is compiled lazily and loaded as a CSS string
const themeLoaders = import.meta.glob("../themes/*.scss", {
  query: "?inline",
  import: "default",
});

const themeNameFromPath = (themePath) =>
  themePath.split("/").pop().replace(".scss", "");

const toLabel = (name) => name.charAt(0).toUpperCase() + name.slice(1);

export const THEMES = Object.keys(themeLoaders)
  .map((themePath) => {
    const name = themeNameFromPath(themePath);
    return { name, label: toLabel(name) };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

export function isValidTheme(name) {
  return THEMES.some((theme) => theme.name === name);
}

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Load a theme's compiled CSS and swap it into the page.
 * Falls back to the default theme when the name is unknown.
 *
 * @param {string} name - Theme name (e.g. "darkly")
 * @returns {Promise<string>} The theme that was applied
 */
export async function applyTheme(name) {
  const themeName = isValidTheme(name) ? name : DEFAULT_THEME;
  const loader = themeLoaders[`../themes/${themeName}.scss`];
  const css = await loader();

  let style = document.getElementById(THEME_STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = THEME_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
  document.documentElement.setAttribute("data-theme", themeName);

  return themeName;
}

/**
 * Apply a theme and remember it for future visits.
 *
 * @param {string} name - Theme name
 * @returns {Promise<string>} The theme that was applied
 */
export async function setTheme(name) {
  const applied = await applyTheme(name);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, applied);
  } catch {
    // Storage unavailable (e.g. private mode); theme still applies this session
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: applied }));
  return applied;
}
