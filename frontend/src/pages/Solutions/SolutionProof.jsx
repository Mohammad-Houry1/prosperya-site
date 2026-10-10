import { adaptCaseStudy } from "../../repositories/marketing.repository.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
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
export default function SolutionProof({ solutions, locale }) {
  const { t } = useLocale();

  const carousel = useCarousel();
  const pairs = solutions.flatMap(solution => (solution.related_case_studies || []).map(record => ({ solution, study: adaptCaseStudy(record) })));
  if (!pairs.length) return null;
  return (
    <Section className={styles.section}>
      <div className={styles.head}>
        <SectionHeader
          eyebrow={t("pages.solutions.solution-proof.in-practice-bf2d3c")}
          title={t("pages.solutions.solution-proof.outcomes-function-by-function-4f7b75")}
        />
        <CarouselArrows
          carousel={carousel}
          labels={[t("pages.solutions.solution-proof.previous-function-0ed881"), t("pages.solutions.solution-proof.next-function-00b85a")]}
        />
      </div>
      <div
        ref={carousel.ref}
        className={styles.rail}
        tabIndex={0}
        role="region"
        aria-label={t("pages.solutions.solution-proof.outcomes-by-function-7e7e49")}
      >
        {pairs.map(({ solution, study }, index) => {
          const [lead] = study.metrics;
          return (
            <article key={solution.id + "-" + study.id} className={styles.card} data-reveal="card" style={{ "--i": index }}>
              <div className={styles.media} aria-hidden="true">
                <CaseVisual study={study} sizes="320px" />
              </div>
              <div className={styles.body}>
                <span className={styles.fn}>{solution.title}</span>
                <h3>{study.name}</h3>
                <p>{study.description}</p>
                {lead && (
                  <div className={styles.metric}>
                    <strong>
                      <AnimatedCounter value={lead.value} />
                    </strong>
                    <span>{lead.label}</span>
                  </div>
                )}
                <Link to={`/${locale}/work/${study.slug}`} className={styles.link}>
                  {t("pages.solutions.solution-proof.view-case-study-2050cc")}
                  <span className="visuallyHidden"> : {study.name}</span>
                  <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

    </Section>
  );
}
