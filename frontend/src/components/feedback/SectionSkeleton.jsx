import styles from "./SectionSkeleton.module.css";
import Skeleton from "./Skeleton.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
export default function SectionSkeleton({ rows = 3, compact = false, inline = false, label }) {
  const { t } = useLocale();
  return (
    <div className={`${styles.wrap} ${inline ? styles.inline : ""}`} role="status" aria-label={label ?? t("components.feedback.section-skeleton.loading", { en: "Loading content", fr: "Chargement du contenu" })} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} width={compact ? 140 : "100%"} height={compact ? 16 : 84} />
      ))}
    </div>
  );
}
