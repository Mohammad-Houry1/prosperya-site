import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./State.module.css";

const DEFAULT_COPY = {
  en: {
    title: "Nothing to show yet",
    description: "Content will appear here when it becomes available.",
  },
  fr: {
    title: "Aucun contenu pour le moment",
    description: "Le contenu apparaîtra ici lorsqu’il sera disponible.",
  },
};

export default function EmptyState({ title, description }) {
  const { locale } = useLocale();
  const copy = DEFAULT_COPY[locale] ?? DEFAULT_COPY.en;

  return (
    <div className={styles.state}>
      <h2>{title ?? copy.title}</h2>
      <p>{description ?? copy.description}</p>
    </div>
  );
}
