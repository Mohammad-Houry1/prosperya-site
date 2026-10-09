import { useCallback, useEffect, useMemo, useState } from "react";
import { THEME_STORAGE_KEY, resolveTheme, isTheme } from "./theme.js";

import { ThemeContext } from "./ThemeContext.jsx";

function readSavedTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}
function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const persisted = readSavedTheme();
  const prefersDark =
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  return resolveTheme(persisted, prefersDark);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  const setTheme = useCallback((nextTheme) => {
    if (!isTheme(nextTheme)) return;
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      /* Theme remains usable when storage is unavailable. */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "dark" ? "#030b10" : "#f8faf9");
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const sync = () =>
      setThemeState(resolveTheme(readSavedTheme(), media?.matches ?? true));
    media?.addEventListener?.("change", sync);
    const storage = (event) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) sync();
    };
    window.addEventListener("storage", storage);
    return () => {
      media?.removeEventListener?.("change", sync);
      window.removeEventListener("storage", storage);
    };
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
