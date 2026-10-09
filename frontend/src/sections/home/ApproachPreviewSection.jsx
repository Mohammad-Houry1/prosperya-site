import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import ProcessPath from "../../components/company/ProcessPath.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import SectionSkeleton from "../../components/feedback/SectionSkeleton.jsx";
import { useProcess } from "../../queries/useContentQueries.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./HomeSections.module.css";
export default function ApproachPreviewSection() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { data = [], isPending, isError, refetch } = useProcess(locale);
  return (
    <Section>
      <div className={styles.approach}>
        <div className={styles.approachCopy}>
          <Eyebrow>{fr ? "Notre approche" : "Our approach"}</Eyebrow>
          <h2>{fr ? "Un chemin éprouvé vers la transformation." : "A proven path to transformation."}</h2>
          <PrimaryLink to={`/${locale}/approach`} variant="text">
            {fr ? "Explorer l’approche" : "Explore the approach"}
          </PrimaryLink>
        </div>
        {isPending ? (
          <SectionSkeleton rows={1} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <ProcessPath steps={data} />
        )}
      </div>
    </Section>
  );
}
