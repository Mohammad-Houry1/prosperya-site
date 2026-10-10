import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CaseVisual from "./CaseVisual.jsx";
import AnimatedCounter from "../../motion/components/AnimatedCounter.jsx";
import styles from "./CaseStudyCard.module.css";
export default function CaseStudyCard({ study, locale, index = 0 }) {
  return (
    <article className={styles.card} data-reveal="card" style={{ "--i": index }}>
      <div className={styles.media} aria-hidden="true">
        <CaseVisual study={study} />
      </div>
      <div className={styles.content}>
        <span className={styles.category}>{study.category}</span>
        <h3>{study.name ?? study.title}</h3>
        <p>{study.description}</p>
        <dl className={styles.metrics}>
          {study.metrics.slice(0, 3).map((metric) => (
            <div key={metric.id}>
              <dt>{metric.label}</dt>
              <dd>
                <AnimatedCounter value={metric.value} />
              </dd>
            </div>
          ))}
        </dl>
        <Link className={styles.link} to={`/${locale}/work/${study.slug}`}>
          {locale === "fr" ? "Voir le cas client" : "View case study"}
          <span className="visuallyHidden"> : {study.name ?? study.title}</span>
          <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
