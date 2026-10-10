import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import styles from "./WorkDeck.module.css";

export default function WorkDeck({ studies, locale }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = studies.find(study => study.id === selectedId) || studies[0];
  if (!selected) return null;
  const index = studies.indexOf(selected);
  return <div className={styles.deck}>
    <Link to={`/${locale}/work/${selected.slug}`} className={styles.feature}>
      <div className={styles.media} aria-hidden="true"><CaseVisual study={selected} priority sizes="(min-width: 900px) 50vw, 100vw" /></div>
      <div className={styles.caption} aria-live="polite">
        <span className={styles.kicker}>{locale === "fr" ? "Projet à découvrir" : "Project spotlight"}<span>{String(index + 1).padStart(2, "0")} / {String(studies.length).padStart(2, "0")}</span></span>
        <strong>{selected.name || selected.title}</strong>
        <span className={styles.bottom}>{selected.industryName || selected.category}<ArrowUpRight size={22} strokeWidth={1.3} aria-hidden="true" /></span>
      </div>
    </Link>
    <div className={styles.selector} role="group" aria-label={locale === "fr" ? "Choisir un projet" : "Choose a project"}>
      {studies.map((study, i) => <button type="button" key={study.id} aria-pressed={selected.id === study.id} onClick={() => setSelectedId(study.id)} aria-label={study.name || study.title}>
        <span>{String(i + 1).padStart(2, "0")}</span><span>{study.industryName || study.category}</span>
      </button>)}
    </div>
  </div>;
}
