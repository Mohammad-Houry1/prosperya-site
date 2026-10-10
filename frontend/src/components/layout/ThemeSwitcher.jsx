import { Moon, Sun } from "lucide-react";
import { useAppTheme } from "../../theme/ThemeContext.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./ThemeSwitcher.module.css";
export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useAppTheme();
  const {t } = useLocale();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={t("components.layout.theme-switcher.dark-mode-561d94")}
      className={styles.switch}
      onClick={toggleTheme}
    >
      <Moon size={13} strokeWidth={1.8} aria-hidden="true" />
      <Sun size={13} strokeWidth={1.8} aria-hidden="true" />
      <span className={styles.knob} aria-hidden="true" />
    </button>
  );
}
