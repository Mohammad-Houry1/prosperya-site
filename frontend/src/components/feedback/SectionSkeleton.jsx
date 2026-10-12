import styles from "./SectionSkeleton.module.css";
import Skeleton from "./Skeleton.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
export default function SectionSkeleton({ rows = 3, compact = false, inline = false, label }) {
  const { t } = useLocale();
  return (
    <div className={`${styles.wrap} ${inline ? styles.inline : ""}`} role="status" aria-label={label ?? t("components.feedback.section-skeleton.loading")} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        compact ? <Skeleton key={i} width={140} height={16} /> : <div key={i} className={styles.row}><Skeleton width="38%" height={22} /><Skeleton height={14} /><Skeleton width="76%" height={14} /></div>
      ))}
    </div>
  );
}
