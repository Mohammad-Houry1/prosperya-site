import { ArrowRight, CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";
import CoverArt from "../visuals/CoverArt.jsx";
import SystemIcon from "../system/SystemIcon.jsx";
import styles from "./SolutionRow.module.css";

// One business function as an editorial row: identity, friction, capabilities, outcomes.
export default function SolutionRow({ solution, locale, index = 0 }) {
  const fr = locale === "fr";
  const to = `/${locale}/solutions/${solution.slug}`;
  return (
    <article className={styles.row} data-reveal="card" style={{ "--i": index }}>
      <div className={styles.identity}>
        <div className={styles.cover} aria-hidden="true">
          <CoverArt variant={solution.cover} seed={index * 11 + 5} />
        </div>
        <span className={styles.icon}>
          <SystemIcon name={solution.icon} size={24} strokeWidth={1.3} />
        </span>
        <h3>{solution.title}</h3>
        <p>{solution.tagline}</p>
        <Link to={to} className={styles.more}>
          {fr ? "En savoir plus" : "Learn more"}
          <span className="visuallyHidden"> : {solution.title}</span>
          <ArrowRight size={14} strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.column}>
        <span className={styles.label}>{fr ? "Difficultés" : "Pains"}</span>
        <ul className={styles.pains}>
          {solution.pains.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.column}>
        <span className={styles.label}>{fr ? "Capacités" : "Capabilities"}</span>
        <ul className={styles.checks}>
          {solution.capabilities.map((item) => (
            <li key={item}>
              <CircleCheck size={15} strokeWidth={1.5} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.column}>
        <span className={styles.label}>{fr ? "Résultats" : "Outcomes"}</span>
        <ul className={styles.outcomes}>
          {solution.outcomes.map(([icon, text]) => (
            <li key={text}>
              <span>
                <SystemIcon name={icon} size={16} strokeWidth={1.5} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <Link to={to} className={styles.arrow} aria-label={`${fr ? "Découvrir" : "Explore"} ${solution.title}`}>
        <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </article>
  );
}
