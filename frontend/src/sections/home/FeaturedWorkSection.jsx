import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import CaseStudyCard from "../../components/case-study/CaseStudyCard.jsx";
import SectionSkeleton from "../../components/feedback/SectionSkeleton.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { dragScroll } from "../../motion/gestures.js";
import styles from "./HomeSections.module.css";
export default function FeaturedWorkSection({ data = [], isLoading, isError, refetch }) {
  const {locale, t } = useLocale();

  return (
    <Section>
      <SectionHeader
        eyebrow={t("sections.home.featured-work-section.featured-work-bda526", { en: "Featured work", fr: "Projets" })}
        title={
          <>
            {t("sections.home.featured-work-section.real-outcomes-260034", { en: "Real outcomes.", fr: "Des résultats concrets." })}
            <br />
            {t("sections.home.featured-work-section.measurable-impact-6dd1eb", { en: "Measurable impact.", fr: "Un impact mesurable." })}
          </>
        }
        action={{
          to: `/${locale}/work`,
          label: t("sections.home.featured-work-section.view-all-case-studies-81af03", { en: "View all case studies", fr: "Tous les cas clients" }),
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
        {t("sections.home.featured-work-section.illustrative-engagements-results-are-not-verified-client-3798b9", { en: "Illustrative engagements — results are not verified client references.", fr: "Missions illustratives — résultats non vérifiés." })}
      </p>
    </Section>
  );
}
