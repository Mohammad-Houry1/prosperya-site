import { companyData } from "../../data/company.data.js";
import { localizeEntity } from "../../repositories/localize.js";
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
import SystemIcon from "../../components/system/SystemIcon.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import DeliverySequence from "./DeliverySequence.jsx";
import CollaborationVenn from "./CollaborationVenn.jsx";
import { approachCopy } from "./approach.copy.js";
import { useQuery } from "@tanstack/react-query";
import { useHeroProgress } from "../../motion/hooks/useHeroProgress.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./ApproachPage.module.css";

function ApproachHero({ locale }) {
  const { t } = useLocale();

  const ref = useRef(null);
  const progress = useHeroProgress(ref);
  return (
    <div ref={ref} className={styles.heroWrap}>
      <div className={styles.field} aria-hidden="true">
        <SignalWave shape="rise" progressRef={progress} strands={44} particles={360} />
      </div>
      <PageHero
        eyebrow={t("pages.approach.approach-page.our-approach-9bce36", { en: "Our approach", fr: "Notre approche" })}
        title={t("pages.approach.approach-page.transformation-without-chaos-6c4c95", { en: "Transformation without chaos", fr: "Transformer sans chaos" })}
        titleClassName={styles.title}
        lead={
          <p>
            {t("pages.approach.approach-page.a-proven-outcome-driven-approach-that-aligns-f10b9f", { en: "A proven, outcome-driven approach that aligns people, process and technology to deliver measurable impact — on time, on budget and built to last.", fr: "Une approche éprouvée, guidée par les résultats, qui aligne personnes, processus et technologie pour un impact mesurable — dans les délais, dans le budget, et fait pour durer." })}
          </p>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/contact`}>{t("pages.approach.approach-page.start-a-conversation-607ba9", { en: "Start a conversation", fr: "Démarrer une conversation" })}</PrimaryLink>
            <PrimaryLink to={`/${locale}/expertise`} variant="ghost">
              {t("pages.approach.approach-page.explore-our-services-8dc8aa", { en: "Explore our services", fr: "Découvrir nos services" })}
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
  const { isLoading: processIsLoading, isError: processIsError, refetch: processRefetch, data: process = [] } = useQuery({
    queryKey: ["process", locale],
    queryFn: async () => {
      return localizeEntity(companyData.process, locale);
    },
  });
  const copy = approachCopy(t);
  useDocumentMeta({
    title: `${t("pages.approach.approach-page.our-approach-9bce36", { en: "Our approach", fr: "Notre approche" })} — Prosperya`,
    description: t("pages.approach.approach-page.a-structured-path-from-discovery-and-architecture-2b67d9", { en: "A structured path from discovery and architecture to launch and continuous improvement.", fr: "Un parcours structuré, de la découverte au lancement et à l’amélioration continue." }),
  });
  if (processIsLoading) return <PageLoader />;
  if (processIsError)
    return (
      <Section>
        <ErrorState onRetry={processRefetch} />
      </Section>
    );
  return (
    <>
      <ApproachHero locale={locale} />
      <DeliverySequence steps={process ?? []} locale={locale} />
      <div className={styles.loopWrap}>
        <p className={styles.loop}>
          <Loop size={34} strokeWidth={1.2} aria-hidden="true" />
          {copy.loop}
        </p>
      </div>
      <Section>
        <SectionHeader eyebrow={copy.howEyebrow} title={copy.howTitle} />
        <div className={styles.practices}>
          {copy.practices.map(([icon, title, text, points], index) => (
            <article key={title} className={styles.practice} data-reveal="card" style={{ "--i": index }}>
              <SystemIcon name={icon} size={26} strokeWidth={1.2} />
              <div>
                <h3>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {title}
                </h3>
                <p>{text}</p>
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
      <Section>
        <div className={styles.split}>
          <div className={styles.collab}>
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
          </div>
          <div className={styles.principles}>
            <Eyebrow>{copy.principlesEyebrow}</Eyebrow>
            <h2>{copy.principlesTitle}</h2>
            <ul>
              {copy.principles.map(([icon, title, text]) => (
                <li key={title}>
                  <span>
                    <SystemIcon name={icon} size={18} strokeWidth={1.4} />
                  </span>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <FrequentlyAskedQuestions data={faqs} isPending={faqsIsPending} isError={faqsIsError} refetch={faqsRefetch} layout="columns" />
      <CTASection
        variant="card"
        title={t("pages.approach.approach-page.map-your-path-with-us-0a8424", { en: "Map your path with us.", fr: "Traçons votre parcours ensemble." })}
        description={
          t("pages.approach.approach-page.share-your-goals-and-we-ll-craft-bb713a", { en: "Share your goals and we’ll craft a tailored approach to deliver lasting impact.", fr: "Partagez vos objectifs : nous construirons une approche sur mesure pour un impact durable." })
        }
      />
    </>
  );
}
