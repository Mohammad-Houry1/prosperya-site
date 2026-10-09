import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./State.module.css";

const DEFAULT_COPY = (t) => ({ title: t("components.feedback.empty-state.copy.nothing-to-show-yet-c2b9a4", { en: "Nothing to show yet", fr: "Aucun contenu pour le moment" }), description: t("components.feedback.empty-state.copy.content-will-appear-here-when-it-becomes-fca038", { en: "Content will appear here when it becomes available.", fr: "Le contenu apparaîtra ici lorsqu’il sera disponible." }) });

export default function EmptyState({ title, description }) {
  const { t } = useLocale();
  const copy = DEFAULT_COPY(t);

  return (
    <div className={styles.state}>
      <h2>{title ?? copy.title}</h2>
      <p>{description ?? copy.description}</p>
    </div>
  );
}
