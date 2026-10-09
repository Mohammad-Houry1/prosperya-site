export const THEME_STORAGE_KEY = "prosperya-theme";
export const THEMES = Object.freeze(["light", "dark"]);

export function isTheme(value) {
  return THEMES.includes(value);
}

export function resolveTheme(persistedTheme, prefersDark) {
  if (isTheme(persistedTheme)) {
    return persistedTheme;
  }

  return prefersDark ? "dark" : "light";
}
