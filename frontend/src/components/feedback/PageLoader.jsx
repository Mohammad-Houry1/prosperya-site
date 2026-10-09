import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./PageLoader.module.css";
import Skeleton from "./Skeleton.jsx";
import SectionSkeleton from "./SectionSkeleton.jsx";
export default function PageLoader() {
  const {t } = useLocale();
  return (
    <div className={styles.loader} role="status" aria-label={t("components.feedback.page-loader.loading-page-59ae89", { en: "Loading page", fr: "Chargement de la page" })} aria-busy="true">
      <Skeleton width="30%" height={16} />
      <Skeleton width="65%" height={56} />
      <Skeleton width="85%" height={20} />
      <SectionSkeleton rows={3} label={t("components.feedback.page-loader.loading-content-9cfda7", { en: "Loading content", fr: "Chargement du contenu" })} />
    </div>
  );
}
