import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import ProcessPath from "../../components/company/ProcessPath.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import SectionSkeleton from "../../components/feedback/SectionSkeleton.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./HomeSections.module.css";
export default function ApproachPreviewSection({ data = [], isPending, isError, refetch }) {
  const {locale, t } = useLocale();

  return (
    <Section>
      <div className={styles.approach}>
        <div className={styles.approachCopy}>
          <Eyebrow>{t("sections.home.approach-preview-section.our-approach-9bce36", { en: "Our approach", fr: "Notre approche" })}</Eyebrow>
          <h2>{t("sections.home.approach-preview-section.a-proven-path-to-transformation-b25b8e", { en: "A proven path to transformation.", fr: "Un chemin éprouvé vers la transformation." })}</h2>
          <PrimaryLink to={`/${locale}/approach`} variant="text">
            {t("sections.home.approach-preview-section.explore-the-approach-dd8b38", { en: "Explore the approach", fr: "Explorer l’approche" })}
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
