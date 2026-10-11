import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import InsightCard from "../../components/insight/InsightCard.jsx";
import SectionSkeleton from "../../components/feedback/SectionSkeleton.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { dragScroll } from "../../motion/gestures.js";
import styles from "./HomeSections.module.css";
export default function FeaturedWorkSection({ data = [], isLoading, isError, refetch }) {
  const {locale, t } = useLocale();

  return (
    <Section>
      <SectionHeader
        eyebrow={t("sections.home.featured-work-section.featured-work-bda526")}
        title={t("pages.insights.insights-page.ideas-and-perspectives-from-the-field-df7a44")}
        action={{
          to: `/${locale}/insights`,
          label: t("pages.insights.insights-page.all-insights-3e70ef"),
        }}
      />
      {isLoading ? (
        <SectionSkeleton rows={2} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !data.length ? (
        <EmptyState />
      ) : (
        <div ref={dragScroll} className={styles.workList}>
          {data.slice(0, 3).map((article, index) => (
            <InsightCard key={article.id} insight={article} locale={locale} index={index} />
          ))}
        </div>
      )}

    </Section>
  );
}
