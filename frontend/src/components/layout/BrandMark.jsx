import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./BrandMark.module.css";
export default function BrandMark() {
  const { locale } = useLocale();
  return (
    <Link
      to={`/${locale}`}
      className={styles.brand}
      aria-label={locale === "fr" ? "Accueil Prosperya" : "Prosperya home"}
    >
      <svg className={styles.symbol} viewBox="0 0 50 50" aria-hidden="true">
        <path
          fill="currentColor"
          d="M3 5 47 18 21 24 8 46 13 22ZM23 25 47 18 23 40Z"
        />
      </svg>
      <strong>PROSPERYA</strong>
    </Link>
  );
}
