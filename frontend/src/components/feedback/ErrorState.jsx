import ConnectionIllustration from "./ConnectionIllustration.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./State.module.css";

const DEFAULT_COPY = (t) => ({ title: t("components.feedback.error-state.copy.something-went-wrong-6ccb92"), description: t("components.feedback.error-state.copy.the-content-could-not-be-loaded-c44d0a"), retry: t("components.feedback.error-state.copy.try-again-170551") });

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
