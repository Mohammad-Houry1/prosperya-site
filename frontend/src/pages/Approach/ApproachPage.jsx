import { adaptMethodology } from "../../repositories/marketing.repository.js";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import CmsImage from "../../components/common/CmsImage.jsx";
import { websiteApi } from "../../services/websiteApi.js";
import { useRef } from "react";
import { CircleCheck, Infinity as Loop } from "lucide-react";
import PageHero from "../../components/common/PageHero.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import FrequentlyAskedQuestions from "../../components/company/FrequentlyAskedQuestions.jsx";
import SignalWave from "../../components/visuals/SignalWave.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import DeliverySequence from "./DeliverySequence.jsx";
import CollaborationVenn from "./CollaborationVenn.jsx";
import { useQuery } from "@tanstack/react-query";
import { useHeroProgress } from "../../motion/hooks/useHeroProgress.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./ApproachPage.module.css";

function ApproachHero({ locale, approach }) {
  const { t } = useLocale();

  const ref = useRef(null);
  const progress = useHeroProgress(ref);
  return (
    <div ref={ref} className={styles.heroWrap}>
      <div className={styles.field} aria-hidden="true">
        <SignalWave shape="rise" progressRef={progress} strands={44} particles={360} />
      </div>
      <PageHero
        eyebrow={t("pages.approach.approach-page.our-approach-9bce36")}
        title={approach.approach_title}
        titleClassName={styles.title}
        lead={
          <CmsRichHtml html={approach.approach_description} />
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/contact`}>{t("pages.approach.approach-page.start-a-conversation-607ba9")}</PrimaryLink>
            <PrimaryLink to={`/${locale}/expertise`} variant="ghost">
              {t("pages.approach.approach-page.explore-our-services-8dc8aa")}
            </PrimaryLink>
          </>
        }
      />
    </div>
  );
}

export default function ApproachPage() {
  const {locale, t } = useLocale();

  const { data: faqs = [], isPending: faqsIsPending, isError: faqsIsError, refetch: faqsRefetch } = useQuery({
    queryKey: ["faq", locale, "approach"],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.faqs({ locale, category: "approach" }, signal);
      return response.data || [];
    },
  });
  const { isLoading: processIsLoading, isError: processIsError, refetch: processRefetch, data: approach } = useQuery({
    queryKey: ["approach", locale],
    queryFn: async ({ signal }) => (await websiteApi.approach('approach', locale, signal)).data,
  });
  const process = adaptMethodology(approach?.methodology);
  const copy = {
    loop: t('pages.approach.approach.copy.copy.continuous-value-9a31bf'), howEyebrow: t('pages.approach.approach.copy.copy.how-we-work-b7ece1'), howTitle: t('pages.approach.approach.copy.copy.a-disciplined-process-measurable-outcomes-c511aa'),
    practices: (approach?.how_we_work ?? []).map(row=>[row.work_image,row.work_title,row.work_description,[]]),
    collabEyebrow: t('pages.approach.approach.copy.copy.collaboration-model-ad6c53'), collabTitle: approach?.collaboration_title, collabPoints: approach?.collaboration_items ?? [],
    collabNodes: ['client','shared','value','company'].map(key=>[approach?.[`diagram_${key}_title`],approach?.[`diagram_${key}_description`]]),
    principlesEyebrow: t('pages.approach.approach.copy.copy.delivery-principles-4ff02e'), principlesTitle: approach?.principles_title,
    principles: (approach?.principles ?? []).map(row=>[row.principle_image,row.principle_title,row.principle_description]),
  };
  useDocumentMeta({
    title: `${t("pages.approach.approach-page.our-approach-9bce36")} — Prosperya`,
    model: 'Approach',
    description: t("pages.approach.approach-page.a-structured-path-from-discovery-and-architecture-2b67d9"),
  });
  if (processIsLoading) return <PageLoader />;
  if (processIsError || !approach)
    return (
      <Section>
        <ErrorState onRetry={processRefetch} />
      </Section>
    );
  return (
    <>
      <ApproachHero locale={locale} approach={approach} />
      {process.length > 0 && <DeliverySequence steps={process} locale={locale} />}
      <div className={styles.loopWrap}>
        <p className={styles.loop}>
          <Loop size={34} strokeWidth={1.2} aria-hidden="true" />
          {copy.loop}
        </p>
      </div>
{copy.practices.length > 0 && (
      <Section>
        <SectionHeader eyebrow={copy.howEyebrow} title={copy.howTitle} />
        <div className={styles.practices}>
          {copy.practices.map(([icon, title, text, points], index) => (
            <article key={title} className={styles.practice} data-reveal="card" style={{ "--i": index }}>
              <CmsImage media={icon} />
              <div>
                <h3>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {title}
                </h3>
                <CmsRichHtml html={text} />
                <ul>
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>
      )}
{copy.collabTitle || copy.collabPoints.length > 0 || copy.collabNodes.some(([title, description]) => title || description) || copy.principles.length > 0 || copy.principlesTitle && (
      <Section>
        <div className={styles.split}>
          {(copy.collabTitle || copy.collabPoints.length > 0 || copy.collabNodes.some(([title, description]) => title || description)) && <div className={styles.collab}>
            <div>
              <Eyebrow>{copy.collabEyebrow}</Eyebrow>
              <h2>{copy.collabTitle}</h2>
              <ul>
                {copy.collabPoints.map((point) => (
                  <li key={point}>
                    <CircleCheck size={18} strokeWidth={1.4} aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <CollaborationVenn nodes={copy.collabNodes} />
          </div>}
          {(copy.principlesTitle || copy.principles.length > 0) && <div className={styles.principles}>
            <Eyebrow>{copy.principlesEyebrow}</Eyebrow>
            <h2>{copy.principlesTitle}</h2>
            <ul>
              {copy.principles.map(([icon, title, text]) => (
                <li key={title}>
                  <span>
                    <CmsImage media={icon} />
                  </span>
                  <strong>{title}</strong>
                  <CmsRichHtml html={text} />
                </li>
              ))}
            </ul>
          </div>}
        </div>
      </Section>
      )}
      <FrequentlyAskedQuestions data={faqs} isPending={faqsIsPending} isError={faqsIsError} refetch={faqsRefetch} layout="columns" />
      <CTASection
        variant="card"
        title={t("pages.approach.approach-page.map-your-path-with-us-0a8424")}
        description={
          t("pages.approach.approach-page.share-your-goals-and-we-ll-craft-bb713a")
        }
      />
    </>
  );
}
