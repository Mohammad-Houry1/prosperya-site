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
        eyebrow={t("sections.home.featured-work-section.featured-work-bda526")}
        title={
          <>
            {t("sections.home.featured-work-section.real-outcomes-260034")}
            <br />
            {t("sections.home.featured-work-section.measurable-impact-6dd1eb")}
          </>
        }
        action={{
          to: `/${locale}/work`,
          label: t("sections.home.featured-work-section.view-all-case-studies-81af03"),
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

    </Section>
  );
}
