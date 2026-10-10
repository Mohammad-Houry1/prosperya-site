import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import NetSuiteFoundation from "./NetSuiteFoundation.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./HomeSections.module.css";
import CmsRichHtml from '../../components/common/CmsRichHtml.jsx';
import SectionSkeleton from '../../components/feedback/SectionSkeleton.jsx';
import ErrorState from '../../components/feedback/ErrorState.jsx';
export default function PlatformStorySection({ page, isPending, isError, refetch }) {
  const {locale, t } = useLocale();
  if(isPending) return <Section><SectionSkeleton rows={4}/></Section>;
  if(isError) return <Section><ErrorState onRetry={refetch}/></Section>;
  if(!page || (!page.architecture_title && !page.architecture_description && ![1,2,3,4].some(i=>page[`architecture_column_${i}`]?.length))) return null;

  return (
    <Section>
      <div className={styles.platform}>
        <div className={styles.platformCopy}>
          <Eyebrow>{t("sections.home.platform-story-section.netsuite-at-the-core-1ead5e")}</Eyebrow>
          <h2>
            {page.architecture_title}
          </h2>
          <CmsRichHtml html={page.architecture_description}/>
          <PrimaryLink to={`/${locale}/expertise`} variant="ghost">
            {t("sections.home.platform-story-section.explore-netsuite-expertise-96a2da")}
          </PrimaryLink>
        </div>
        <NetSuiteFoundation columns={[1,2,3,4].map(i=>page[`architecture_column_${i}`] || [])} />
      </div>
    </Section>
  );
}
