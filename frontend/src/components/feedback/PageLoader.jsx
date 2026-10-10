import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./PageLoader.module.css";
import { useLocation } from "react-router-dom";
import PageSkeletons, { skeletonKind } from './PageSkeletons.jsx';
export default function PageLoader() {
  const {t } = useLocale();
  const { pathname } = useLocation();
  const kind = skeletonKind(pathname);
  return (
    <div className={styles.loader} role="status" data-skeleton={kind} aria-label={t("components.feedback.page-loader.loading-page-59ae89")} aria-busy="true">
      <PageSkeletons kind={kind} />
    </div>
  );
}
