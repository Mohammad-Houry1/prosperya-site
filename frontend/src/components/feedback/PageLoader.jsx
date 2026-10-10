import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./PageLoader.module.css";
import Skeleton from "./Skeleton.jsx";
import SectionSkeleton from "./SectionSkeleton.jsx";
export default function PageLoader() {
  const { locale } = useLocale();
  return (
    <div className={styles.loader} role="status" aria-label={locale === "fr" ? "Chargement de la page" : "Loading page"} aria-busy="true">
      <Skeleton width="30%" height={16} />
      <Skeleton width="65%" height={56} />
      <Skeleton width="85%" height={20} />
      <SectionSkeleton rows={3} label={locale === "fr" ? "Chargement du contenu" : "Loading content"} />
    </div>
  );
}
