import { createTranslator } from "../../i18n/labels.js";
import { useContext, useEffect, useRef } from "react";
import { LocaleContext } from "../../i18n/LocaleContext.jsx";
import { ArrowRight, RotateCcw } from "lucide-react";
import ConnectionIllustration from "./ConnectionIllustration.jsx";
import styles from "./FailureScreen.module.css";

export default function FailureScreen({ locale = "en", onRetry }) {
  const context = useContext(LocaleContext);
  const t = context?.t ?? createTranslator(locale);
  const fr = locale === "fr";
  const title = t("components.feedback.failure-screen.one-small-hiccup-6c862a", { en: "One small hiccup.", fr: "Un petit contretemps." });
  const heading = useRef(null);
  useEffect(() => {
    heading.current?.focus();
    document.title = `${title} — Prosperya`;
    document.documentElement.lang = fr ? "fr" : "en";
    document.head.querySelectorAll('meta[name="robots"], meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], link[rel="alternate"][hreflang], #website-seo, #website-schema').forEach((node) => node.remove());
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, follow";
    document.head.append(robots);
    return () => robots.remove();
  }, [fr, title]);

  return (
    <main className={styles.page}>
      <a className={styles.brand} href={`/${fr ? "fr" : "en"}`} aria-label={t("components.feedback.failure-screen.prosperya-home-233794", { en: "Prosperya home", fr: "Accueil Prosperya" })}>
        <span aria-hidden="true" className={styles.brandDot} /> Prosperya
      </a>
      <div className={styles.content}>
        <ConnectionIllustration />
        <p className={styles.eyebrow}>{t("components.feedback.failure-screen.a-moment-to-reconnect-fbc5d4", { en: "A moment to reconnect", fr: "La connexion fait une pause" })}</p>
        <h1 ref={heading} tabIndex={-1}>{title}</h1>
        <p className={styles.description}>
          {t("components.feedback.failure-screen.this-page-couldn-t-open-give-it-042d8a", { en: "This page couldn’t open. Give it another try, or find your way back from home.", fr: "Cette page n’a pas pu s’ouvrir. Réessayez, ou retrouvez votre chemin depuis l’accueil." })}
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={onRetry} className={styles.retry}>
            <RotateCcw size={17} aria-hidden="true" /> {t("components.feedback.failure-screen.try-again-170551", { en: "Try again", fr: "Réessayer" })}
          </button>
          <a href={`/${fr ? "fr" : "en"}`} className={styles.home}>
            {t("components.feedback.failure-screen.back-home-b335e9", { en: "Back home", fr: "Retour à l’accueil" })} <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
      <p className={styles.note}>{t("components.feedback.failure-screen.even-good-connections-need-a-little-reset-66e74d", { en: "Even good connections need a little reset.", fr: "Les petits détours font aussi partie du chemin." })}</p>
    </main>
  );
}
