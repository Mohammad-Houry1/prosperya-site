import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CaseVisual from "./CaseVisual.jsx";
import AnimatedCounter from "../../motion/components/AnimatedCounter.jsx";
import { useGsapContext } from "../../motion/hooks/useGsapContext.js";
import styles from "./ProjectFeature.module.css";

const LAYOUTS = ["left", "right", "wide"];

/*
  One engagement as an editorial spread. Layouts rotate (image left, image
  right, full-width) so the portfolio reads as a sequence of chapters rather
  than a grid. Only the full-width spread carries a slow parallax.
*/
export default function ProjectFeature({ study, index, locale, capabilityNames = {}, platformNames = {} }) {
  const fr = locale === "fr";
  const layout = LAYOUTS[index % LAYOUTS.length];
  const ref = useRef(null);
  useGsapContext(
    ref,
    ({ gsap }) => {
      if (layout !== "wide") return;
      gsap.fromTo(
        ref.current.querySelector("[data-parallax]"),
        { yPercent: -5 },
        { yPercent: 5, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    [layout],
  );
  const [lead, ...rest] = study.metrics;
  return (
    <article ref={ref} className={`${styles.feature} ${styles[layout]}`}>
      <div className={styles.media} data-reveal="image" aria-hidden="true">
        <div data-parallax className={styles.mediaInner}>
          <CaseVisual study={study} sizes="(min-width: 900px) 60vw, 100vw" />
        </div>
        <span className={styles.bigIndex}>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.index}>
          <b>{String(index + 1).padStart(2, "0")}</b> / {study.category}
        </span>
        <h3>{study.name}</h3>
        <p className={styles.statement}>
          {study.title}
        </p>
        <p className={styles.description}>
          {study.description}
        </p>
        <dl className={styles.meta}>
          {study.industryName && (
            <div>
              <dt>{fr ? "Secteur" : "Industry"}</dt>
              <dd>{study.industryName}</dd>
            </div>
          )}
          <div>
            <dt>{fr ? "Expertises" : "Capabilities"}</dt>
            <dd>{study.expertiseIds.map((id) => capabilityNames[id]).filter(Boolean).join(" · ")}</dd>
          </div>
          <div>
            <dt>{fr ? "Plateformes" : "Platforms"}</dt>
            <dd>{study.platformIds.map((id) => platformNames[id]).filter(Boolean).join(" · ")}</dd>
          </div>
        </dl>
        <div className={styles.metrics}>
          <div className={styles.lead}>
            <strong>
              <AnimatedCounter value={lead.value} />
            </strong>
            <span>{lead.label}</span>
          </div>
          {rest.map((metric) => (
            <div key={metric.id} className={styles.minor}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
        <Link to={`/${locale}/work/${study.slug}`} className={styles.link}>
          {fr ? "Voir le cas client" : "View case study"}
          <span className="visuallyHidden"> : {study.name}</span>
          <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
