import { Link, useLocation } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { replaceLocaleInPath, SUPPORTED_LOCALES } from "../../i18n/locale.js";
import styles from "./LocaleSwitcher.module.css";
export default function LocaleSwitcher({ onNavigate }) {
  const {locale, t } = useLocale();
  const location = useLocation();
  return (
    <nav
      className={styles.switcher}
      aria-label={t("components.layout.locale-switcher.language-cff648")}
    >
      {SUPPORTED_LOCALES.map((item) => (
        <Link
          key={item}
          lang={item}
          hrefLang={item}
          aria-current={item === locale ? "true" : undefined}
          aria-label={item === "en" ? t("locale.english") : t("locale.french")}
          onClick={onNavigate}
          to={`${replaceLocaleInPath(location.pathname, item)}${location.search}${location.hash}`}
        >
          {item.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
