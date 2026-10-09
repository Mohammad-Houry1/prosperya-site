import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./PageLoader.module.css";
export default function PageLoader() {
  const { locale } = useLocale();
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.mark}>P</span>
      <span>
        {locale === "fr" ? "Chargement de Prosperya" : "Loading Prosperya"}
      </span>
    </div>
  );
}
