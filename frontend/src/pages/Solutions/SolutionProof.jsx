import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import CarouselArrows from "../../components/common/CarouselArrows.jsx";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import AnimatedCounter from "../../motion/components/AnimatedCounter.jsx";
import { useCarousel } from "../../motion/gestures.js";
import styles from "./SolutionProof.module.css";

/*
  Each business function paired with the engagement that proves it, as one
  draggable rail of wide cards. Home shows the work as a grid; this page
  reads it function by function.
*/
export default function SolutionProof({ solutions, studies, locale }) {
  const fr = locale === "fr";
  const carousel = useCarousel();
  const byId = Object.fromEntries(studies.map((study) => [study.id, study]));
  const pairs = solutions.filter((solution) => byId[solution.caseStudyId]);
  if (!pairs.length) return null;
  return (
    <Section>
      <div className={styles.head}>
        <SectionHeader
          eyebrow={fr ? "En pratique" : "In practice"}
          title={fr ? "Des résultats, fonction par fonction." : "Outcomes, function by function."}
        />
        <CarouselArrows
          carousel={carousel}
          labels={fr ? ["Fonction précédente", "Fonction suivante"] : ["Previous function", "Next function"]}
        />
      </div>
      <div
        ref={carousel.ref}
        className={styles.rail}
        tabIndex={0}
        role="region"
        aria-label={fr ? "Résultats par fonction" : "Outcomes by function"}
      >
        {pairs.map((solution, index) => {
          const study = byId[solution.caseStudyId];
          const [lead] = study.metrics;
          return (
            <article key={solution.id} className={styles.card} data-reveal="card" style={{ "--i": index }}>
              <div className={styles.media} aria-hidden="true">
                <CaseVisual study={study} sizes="320px" />
              </div>
              <div className={styles.body}>
                <span className={styles.fn}>{solution.title}</span>
                <h3>{study.name}</h3>
                <p>{study.title}</p>
                {lead && (
                  <div className={styles.metric}>
                    <strong>
                      <AnimatedCounter value={lead.value} />
                    </strong>
                    <span>{lead.label}</span>
                  </div>
                )}
                <Link to={`/${locale}/work/${study.slug}`} className={styles.link}>
                  {fr ? "Voir le cas client" : "View case study"}
                  <span className="visuallyHidden"> : {study.name}</span>
                  <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <p className={styles.note}>
        {fr ? "Missions illustratives, résultats non vérifiés." : "Illustrative engagements. Results are not verified client references."}
      </p>
    </Section>
  );
}
