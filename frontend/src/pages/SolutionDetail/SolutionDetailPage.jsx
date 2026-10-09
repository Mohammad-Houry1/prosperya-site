import { useRef } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import CapabilityCard from "../../components/expertise/CapabilityCard.jsx";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import SolutionMetaphor from "../../components/visuals/SolutionMetaphor.jsx";
import SystemIcon from "../../components/system/SystemIcon.jsx";
import AnimatedCounter from "../../motion/components/AnimatedCounter.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import { useCapabilities, useCaseStudies, useSolution } from "../../queries/useContentQueries.js";
import { useHeroProgress } from "../../motion/hooks/useHeroProgress.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./SolutionDetailPage.module.css";

function SolutionHero({ item, locale }) {
  const fr = locale === "fr";
  const ref = useRef(null);
  const progress = useHeroProgress(ref, { intro: 0.7 });
  return (
    <div ref={ref}>
      <PageHero
        breadcrumb={[
          { label: fr ? "Accueil" : "Home", to: `/${locale}` },
          { label: "Solutions", to: `/${locale}/solutions` },
          { label: item.title },
        ]}
        title={item.title}
        titleClassName={styles.title}
        lead={
          <>
            <p className={styles.tagline}>{item.tagline}</p>
            <p>{item.description}</p>
          </>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/contact`}>{fr ? "Parlons de votre projet" : "Start a conversation"}</PrimaryLink>
            <PrimaryLink to={`/${locale}/solutions`} variant="ghost">
              {fr ? "Toutes les solutions" : "All solutions"}
            </PrimaryLink>
          </>
        }
        visual={<SolutionMetaphor variant={item.metaphor} progressRef={progress} label={item.story.statement} />}
      />
    </div>
  );
}

export default function SolutionDetailPage() {
  const { slug } = useParams();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const solution = useSolution(locale, slug);
  const capabilities = useCapabilities(locale);
  const studies = useCaseStudies(locale);
  useDocumentMeta({
    title: solution.data ? `${solution.data.title} — Prosperya` : "Prosperya — Solutions",
    description: solution.data?.description,
  });
  if (solution.isLoading) return <PageLoader />;
  if (solution.isError)
    return (
      <Section>
        <ErrorState onRetry={() => solution.refetch()} />
      </Section>
    );
  if (!solution.data)
    return (
      <Section>
        <EmptyState title={fr ? "Solution introuvable" : "Solution not found"} />
      </Section>
    );
  const item = solution.data;
  const story = item.story;
  const related = (capabilities.data ?? []).filter((cap) => item.expertiseIds.includes(cap.id));
  const proof = (studies.data ?? []).find((study) => study.id === item.caseStudyId);
  return (
    <>
      <SolutionHero item={item} locale={locale} />
      <section className={styles.statement}>
        <PageContainer>
          <Eyebrow>{item.title}</Eyebrow>
          <h2 className={styles.statementTitle}>
            {story.statement}
          </h2>
          <p>{story.lead}</p>
        </PageContainer>
      </section>
      <Section>
        <div className={styles.friction}>
          <h2>{story.frictionTitle}</h2>
          <ol>
            {story.friction.map((line, index) => (
              <li key={line}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {line}
              </li>
            ))}
          </ol>
        </div>
      </Section>
      <Section className={styles.change}>
        <SectionHeader
          eyebrow={fr ? "Ce qui change" : "What changes"}
          title={fr ? "Des capacités concrètes. Des résultats visibles." : "Concrete capabilities. Visible outcomes."}
        />
        <div className={styles.changeGrid}>
          <div className={styles.changeColumn} data-reveal="card">
            <span>{fr ? "Ce que nous mettons en place" : "What we put in place"}</span>
            <ul className={styles.checks}>
              {item.capabilities.map((capability) => (
                <li key={capability}>
                  <CircleCheck size={18} strokeWidth={1.4} aria-hidden="true" />
                  {capability}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.changeColumn} data-reveal="card" style={{ "--i": 2 }}>
            <span>{fr ? "Ce que vous obtenez" : "What you can expect"}</span>
            <ul className={styles.outcomes}>
              {item.outcomes.map(([icon, text]) => (
                <li key={text}>
                  <i>
                    <SystemIcon name={icon} size={18} strokeWidth={1.4} />
                  </i>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      {proof && (
        <Section>
          <article className={styles.proof}>
            <div className={styles.proofMedia} data-reveal="image" aria-hidden="true">
              <CaseVisual study={proof} />
            </div>
            <div className={styles.proofCopy}>
              <Eyebrow>{fr ? "En pratique" : "In practice"}</Eyebrow>
              <h2>{proof.name}</h2>
              <p>{proof.title}</p>
              <dl className={styles.proofMetrics}>
                {story.metrics.map(([value, label]) => (
                  <div key={label}>
                    <dd>
                      <AnimatedCounter value={value} />
                    </dd>
                    <dt>{label}</dt>
                  </div>
                ))}
              </dl>
              <p className={styles.note}>{story.metricsNote}</p>
              <Link className={styles.proofLink} to={`/${locale}/work/${proof.slug}`}>
                {fr ? "Lire le cas client" : "Read the case study"}
                <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </Section>
      )}
      {related.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow={fr ? "Expertises mobilisées" : "Capabilities behind the solution"}
            title={fr ? "Ce qui rend la solution possible." : "What makes it work."}
          />
          <div className={styles.cards}>
            {related.map((cap, index) => (
              <CapabilityCard key={cap.id} capability={cap} locale={locale} index={index} heading="detail" />
            ))}
          </div>
        </Section>
      )}
      <CTASection
        variant="band"
        title={fr ? `Parlons de votre ${item.title.toLowerCase()}.` : `Let’s talk about your ${item.title.toLowerCase()}.`}
        description={fr ? "Commencez par la friction qui vous coûte le plus." : "Start with the friction that costs you most."}
        secondary={{ path: "solutions", label: fr ? "Toutes les solutions" : "All solutions" }}
      />
    </>
  );
}
