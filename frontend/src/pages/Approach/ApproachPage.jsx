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
import { useProcess } from "../../queries/useContentQueries.js";
import { useHeroProgress } from "../../motion/hooks/useHeroProgress.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./ApproachPage.module.css";

function ApproachHero({ locale }) {
  const fr = locale === "fr";
  const ref = useRef(null);
  const progress = useHeroProgress(ref);
  return (
    <div ref={ref} className={styles.heroWrap}>
      <div className={styles.field} aria-hidden="true">
        <SignalWave shape="rise" progressRef={progress} strands={44} particles={360} />
      </div>
      <PageHero
        eyebrow={fr ? "Notre approche" : "Our approach"}
        title={fr ? "Transformer sans chaos" : "Transformation without chaos"}
        titleClassName={styles.title}
        lead={
          <p>
            {fr
              ? "Une approche éprouvée, guidée par les résultats, qui aligne personnes, processus et technologie pour un impact mesurable — dans les délais, dans le budget, et fait pour durer."
              : "A proven, outcome-driven approach that aligns people, process and technology to deliver measurable impact — on time, on budget and built to last."}
          </p>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/contact`}>{fr ? "Démarrer une conversation" : "Start a conversation"}</PrimaryLink>
            <PrimaryLink to={`/${locale}/expertise`} variant="ghost">
              {fr ? "Découvrir nos services" : "Explore our services"}
            </PrimaryLink>
          </>
        }
      />
    </div>
  );
}

export default function ApproachPage() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const process = useProcess(locale);
  const copy = approachCopy[locale] ?? approachCopy.en;
  useDocumentMeta({
    title: `${fr ? "Notre approche" : "Our approach"} — Prosperya`,
    description: fr
      ? "Un parcours structuré, de la découverte au lancement et à l’amélioration continue."
      : "A structured path from discovery and architecture to launch and continuous improvement.",
  });
  if (process.isLoading) return <PageLoader />;
  if (process.isError)
    return (
      <Section>
        <ErrorState onRetry={process.refetch} />
      </Section>
    );
  return (
    <>
      <ApproachHero locale={locale} />
      <DeliverySequence steps={process.data ?? []} locale={locale} />
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
      <FrequentlyAskedQuestions topic="approach" layout="columns" />
      <CTASection
        variant="card"
        title={fr ? "Traçons votre parcours ensemble." : "Map your path with us."}
        description={
          fr
            ? "Partagez vos objectifs : nous construirons une approche sur mesure pour un impact durable."
            : "Share your goals and we’ll craft a tailored approach to deliver lasting impact."
        }
      />
    </>
  );
}
