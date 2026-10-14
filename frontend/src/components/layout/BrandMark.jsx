import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./BrandMark.module.css";
export default function BrandMark() {
  const {locale, t } = useLocale();
  return (
    <Link
      to={`/${locale}`}
      className={styles.brand}
      aria-label={t("components.layout.brand-mark.prosperya-home-233794")}
    >
      <svg className={styles.symbol} viewBox="0 0 50 50" aria-hidden="true">
        <path
          fill="currentColor"
          d="M3 5 47 18 21 24 8 46 13 22ZM23 25 47 18 23 40Z"
        />
      </svg>
      <strong>{t("site.name").toUpperCase()}</strong>
    </Link>
  );
}
