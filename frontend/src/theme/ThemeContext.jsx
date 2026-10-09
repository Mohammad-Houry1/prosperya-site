import { createContext, useContext } from "react";

export const ThemeContext = createContext(null);

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useAppTheme must be used inside ThemeProvider");
  return value;
}
