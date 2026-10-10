import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import styles from "./WorkDeck.module.css";

export default function WorkDeck({ studies, locale }) {
  const { t } = useLocale();
  const [selectedId, setSelectedId] = useState(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const selected = studies.find(study => study.id === selectedId) || studies[0];
  const index = studies.indexOf(selected);
  const rotating = studies.length > 1 && !paused && !hovered && !focused && !reducedMotion;

  useEffect(() => {
    if (!rotating) return undefined;
    const timer = window.setTimeout(() => setSelectedId(studies[(index + 1) % studies.length].id), 5000);
    return () => window.clearTimeout(timer);
  }, [rotating, index, studies]);

  if (!selected) return null;
  return <div className={styles.deck}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className={styles.slides}>
      {studies.map((study, i) => <Link key={study.id} to={`/${locale}/work/${study.slug}`} className={styles.feature}
        data-active={selected.id === study.id} aria-hidden={selected.id !== study.id} tabIndex={selected.id === study.id ? 0 : -1}>
        <div className={styles.media} aria-hidden="true"><CaseVisual study={study} priority={i === 0} sizes="(min-width: 900px) 50vw, 100vw" /></div>
        <div className={styles.caption}>
          <span className={styles.kicker}>{t("pages.case-study.case-study-page.case-studies-262284")}<span>{String(i + 1).padStart(2, "0")} / {String(studies.length).padStart(2, "0")}</span></span>
          <strong>{study.name || study.title}</strong>
          <span className={styles.bottom}>{study.industryName || study.category}<ArrowUpRight size={22} strokeWidth={1.3} aria-hidden="true" /></span>
        </div>
      </Link>)}
    </div>
    <div className={styles.selector} role="group" aria-label={t("pages.case-study.case-study-page.all-case-studies-0baf60")}>
      {studies.map((study, i) => <button type="button" key={study.id} aria-pressed={selected.id === study.id} onClick={() => setSelectedId(study.id)} aria-label={study.name || study.title}>
        <span>{String(i + 1).padStart(2, "0")}</span><span>{study.industryName || study.category}</span>
      </button>)}
    </div>
    {studies.length > 1 && !reducedMotion && <button type="button" className={styles.playback} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
      {paused ? (t("components.company.client-companies.play-48234e")) : (t("components.company.client-companies.pause"))}
    </button>}
  </div>;
}
