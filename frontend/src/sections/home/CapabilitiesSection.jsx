import Section from "../../components/common/Section.jsx";
import CapabilityCard from "../../components/expertise/CapabilityCard.jsx";
import SectionSkeleton from "../../components/feedback/SectionSkeleton.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import { useCapabilities } from "../../queries/useContentQueries.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./HomeSections.module.css";
export default function CapabilitiesSection() {
  const { locale } = useLocale();
  const { data = [], isLoading, isError, refetch } = useCapabilities(locale);
  return (
    <Section className={styles.whatWeDo}>
      <h2 className={styles.kicker}>
        {locale === "fr" ? "Ce que nous faisons" : "What we do"}
      </h2>
      {isLoading ? (
        <SectionSkeleton rows={1} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className={styles.cards}>
          {data.slice(0, 4).map((item, index) => (
            <CapabilityCard key={item.id} capability={item} locale={locale} index={index} />
          ))}
        </div>
      )}
    </Section>
  );
}
