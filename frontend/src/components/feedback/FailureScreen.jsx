import { useEffect, useRef } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import ConnectionIllustration from "./ConnectionIllustration.jsx";
import styles from "./FailureScreen.module.css";

export default function FailureScreen({ locale = "en", onRetry }) {
  const fr = locale === "fr";
  const title = fr ? "Un petit contretemps." : "One small hiccup.";
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
      <a className={styles.brand} href={`/${fr ? "fr" : "en"}`} aria-label={fr ? "Accueil Prosperya" : "Prosperya home"}>
        <span aria-hidden="true" className={styles.brandDot} /> Prosperya
      </a>
      <div className={styles.content}>
        <ConnectionIllustration />
        <p className={styles.eyebrow}>{fr ? "La connexion fait une pause" : "A moment to reconnect"}</p>
        <h1 ref={heading} tabIndex={-1}>{title}</h1>
        <p className={styles.description}>
          {fr ? "Cette page n’a pas pu s’ouvrir. Réessayez, ou retrouvez votre chemin depuis l’accueil." : "This page couldn’t open. Give it another try, or find your way back from home."}
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={onRetry} className={styles.retry}>
            <RotateCcw size={17} aria-hidden="true" /> {fr ? "Réessayer" : "Try again"}
          </button>
          <a href={`/${fr ? "fr" : "en"}`} className={styles.home}>
            {fr ? "Retour à l’accueil" : "Back home"} <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
      <p className={styles.note}>{fr ? "Les petits détours font aussi partie du chemin." : "Even good connections need a little reset."}</p>
    </main>
  );
}
