import ConnectionIllustration from "./ConnectionIllustration.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./State.module.css";

const DEFAULT_COPY = (t) => ({ title: t("components.feedback.error-state.copy.something-went-wrong-6ccb92", { en: "Something went wrong", fr: "Une erreur est survenue" }), description: t("components.feedback.error-state.copy.the-content-could-not-be-loaded-c44d0a", { en: "The content could not be loaded.", fr: "Le contenu n’a pas pu être chargé." }), retry: t("components.feedback.error-state.copy.try-again-170551", { en: "Try again", fr: "Réessayer" }) });

export default function ErrorState({ title, description, onRetry }) {
  const { t } = useLocale();
  const copy = DEFAULT_COPY(t);

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
