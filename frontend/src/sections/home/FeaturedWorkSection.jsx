import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import CaseStudyCard from "../../components/case-study/CaseStudyCard.jsx";
import SectionSkeleton from "../../components/feedback/SectionSkeleton.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import { useCaseStudies } from "../../queries/useContentQueries.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { dragScroll } from "../../motion/gestures.js";
import styles from "./HomeSections.module.css";
export default function FeaturedWorkSection() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { data = [], isLoading, isError, refetch } = useCaseStudies(locale);
  return (
    <Section>
      <SectionHeader
        eyebrow={fr ? "Projets" : "Featured work"}
        title={
          <>
            {fr ? "Des résultats concrets." : "Real outcomes."}
            <br />
            {fr ? "Un impact mesurable." : "Measurable impact."}
          </>
        }
        action={{
          to: `/${locale}/work`,
          label: fr ? "Tous les cas clients" : "View all case studies",
        }}
      />
      {isLoading ? (
        <SectionSkeleton rows={2} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div ref={dragScroll} className={styles.workList}>
          {data.slice(0, 3).map((study, index) => (
            <CaseStudyCard key={study.id} study={study} locale={locale} index={index} />
          ))}
        </div>
      )}
      <p className={styles.note}>
        {fr
          ? "Missions illustratives — résultats non vérifiés."
          : "Illustrative engagements — results are not verified client references."}
      </p>
    </Section>
  );
}
