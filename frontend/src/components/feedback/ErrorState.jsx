import ConnectionIllustration from "./ConnectionIllustration.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./State.module.css";

const DEFAULT_COPY = {
  en: {
    title: "Something went wrong",
    description: "The content could not be loaded.",
    retry: "Try again",
  },
  fr: {
    title: "Une erreur est survenue",
    description: "Le contenu n’a pas pu être chargé.",
    retry: "Réessayer",
  },
};

export default function ErrorState({ title, description, onRetry }) {
  const { locale } = useLocale();
  const copy = DEFAULT_COPY[locale] ?? DEFAULT_COPY.en;

  return (
    <div className={styles.state} role="alert">
      <ConnectionIllustration compact />
      <h2>{title ?? copy.title}</h2>
      <p>{description ?? copy.description}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          {copy.retry}
        </button>
      ) : null}
    </div>
  );
}
