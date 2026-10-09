import { caseStudiesData } from "../../data/caseStudies.data.js";
import { caseStudyDetailsData, industries } from "../../data/caseStudyDetails.data.js";
import { expertiseData } from "../../data/expertise.data.js";
import { localizeEntity } from "../../repositories/localize.js";
import { solutionsData } from "../../data/solutions.data.js";
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
import { useQuery } from "@tanstack/react-query";
import { useHeroProgress } from "../../motion/hooks/useHeroProgress.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./SolutionDetailPage.module.css";

function SolutionHero({ item, locale }) {
  const { t } = useLocale();

  const ref = useRef(null);
  const progress = useHeroProgress(ref, { intro: 0.7 });
  return (
    <div ref={ref}>
      <PageHero
        breadcrumb={[
          { label: t("pages.solution-detail.solution-detail-page.home-ded702", { en: "Home", fr: "Accueil" }), to: `/${locale}` },
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
            <PrimaryLink to={`/${locale}/contact`}>{t("pages.solution-detail.solution-detail-page.start-a-conversation-345cd0", { en: "Start a conversation", fr: "Parlons de votre projet" })}</PrimaryLink>
            <PrimaryLink to={`/${locale}/solutions`} variant="ghost">
              {t("pages.solution-detail.solution-detail-page.all-solutions-731f69", { en: "All solutions", fr: "Toutes les solutions" })}
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
  const {locale, t } = useLocale();
  const { data: solution = null, isLoading: solutionIsLoading, isError: solutionIsError, refetch: solutionRefetch } = useQuery({
    queryKey: ["solution", locale, slug],
    queryFn: async () => {
      const solutions = localizeEntity(solutionsData, locale);
      return solutions.find((solution) => solution.slug === slug) || null;
    },
    enabled: Boolean(slug),
  });
  const { data: capabilities = [] } = useQuery({
    queryKey: ["capabilities", locale],
    queryFn: async () => {
      return localizeEntity(expertiseData, locale);
    },
  });
  const { data: studies = [] } = useQuery({
    queryKey: ["case-studies", locale],
    queryFn: async () => {
      return localizeEntity(caseStudiesData, locale).map((study) => {
        const industry = caseStudyDetailsData[study.id]?.industry;
        return industry
          ? { ...study, industry, industryName: industries[industry][locale] ?? industries[industry].en }
          : study;
      });
    },
  });
  useDocumentMeta({
    title: solution ? `${solution.title} — Prosperya` : "Prosperya — Solutions",
    description: solution?.description,
  });
  if (solutionIsLoading) return <PageLoader />;
  if (solutionIsError)
    return (
      <Section>
        <ErrorState onRetry={() => solutionRefetch()} />
      </Section>
    );
  if (!solution)
    return (
      <Section>
        <EmptyState title={t("pages.solution-detail.solution-detail-page.solution-not-found-0f1206", { en: "Solution not found", fr: "Solution introuvable" })} />
      </Section>
    );
  const item = solution;
  const story = item.story;
  const related = (capabilities ?? []).filter((cap) => item.expertiseIds.includes(cap.id));
  const proof = (studies ?? []).find((study) => study.id === item.caseStudyId);
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
          eyebrow={t("pages.solution-detail.solution-detail-page.what-changes-dd20b5", { en: "What changes", fr: "Ce qui change" })}
          title={t("pages.solution-detail.solution-detail-page.concrete-capabilities-visible-outcomes-72f078", { en: "Concrete capabilities. Visible outcomes.", fr: "Des capacités concrètes. Des résultats visibles." })}
        />
        <div className={styles.changeGrid}>
          <div className={styles.changeColumn} data-reveal="card">
            <span>{t("pages.solution-detail.solution-detail-page.what-we-put-in-place-370fb3", { en: "What we put in place", fr: "Ce que nous mettons en place" })}</span>
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
            <span>{t("pages.solution-detail.solution-detail-page.what-you-can-expect-508821", { en: "What you can expect", fr: "Ce que vous obtenez" })}</span>
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
              <Eyebrow>{t("pages.solution-detail.solution-detail-page.in-practice-bf2d3c", { en: "In practice", fr: "En pratique" })}</Eyebrow>
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
                {t("pages.solution-detail.solution-detail-page.read-the-case-study-c265da", { en: "Read the case study", fr: "Lire le cas client" })}
                <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </Section>
      )}
      {related.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow={t("pages.solution-detail.solution-detail-page.capabilities-behind-the-solution-a492e7", { en: "Capabilities behind the solution", fr: "Expertises mobilisées" })}
            title={t("pages.solution-detail.solution-detail-page.what-makes-it-work-f49d2d", { en: "What makes it work.", fr: "Ce qui rend la solution possible." })}
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
        title={t("solutions.detail_cta_title", { en: "Let’s talk about your {solution}.", fr: "Parlons de votre {solution}." }, { solution: item.title.toLowerCase() })}
        description={t("pages.solution-detail.solution-detail-page.start-with-the-friction-that-costs-you-df2223", { en: "Start with the friction that costs you most.", fr: "Commencez par la friction qui vous coûte le plus." })}
        secondary={{ path: "solutions", label: t("pages.solution-detail.solution-detail-page.all-solutions-731f69", { en: "All solutions", fr: "Toutes les solutions" }) }}
      />
    </>
  );
}
