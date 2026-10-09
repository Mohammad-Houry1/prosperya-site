import { caseStudiesData } from "../../data/caseStudies.data.js";
import { caseStudyDetailsData, industries as industryLabels } from "../../data/caseStudyDetails.data.js";
import { expertiseData } from "../../data/expertise.data.js";
import { localizeEntity } from "../../repositories/localize.js";
import { websiteApi } from "../../services/websiteApi.js";
import { useState } from "react";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import Section from "../../components/common/Section.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import ProjectFeature from "../../components/case-study/ProjectFeature.jsx";
import Testimonials from "../../components/company/Testimonials.jsx";
import SystemIcon from "../../components/system/SystemIcon.jsx";
import AnimatedCounter from "../../motion/components/AnimatedCounter.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import WorkDeck from "./WorkDeck.jsx";
import styles from "./WorkPage.module.css";

const METRIC_ICONS = { markets: "network", flows: "link", entities: "building", manual: "zap", close: "refresh", handoffs: "refresh", issues: "search", priority: "target" };

function Filter({ label, value, options, onChange }) {
  return (
    <div className={styles.filter}>
      <span id={`filter-${label}`}>{label}</span>
      <div role="group" aria-labelledby={`filter-${label}`}>
        {options.map(([id, name]) => (
          <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WorkPage() {
  const {locale, t } = useLocale();
  const { data: stories = [], isLoading: storiesIsLoading, isError: storiesIsError, refetch: storiesRefetch } = useQuery({
    queryKey: ["company-stories", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.testimonials({ locale }, signal);
      return response.data || [];
    },
  });
  const { isLoading, isError, refetch, data = [] } = useQuery({
    queryKey: ["case-studies", locale],
    queryFn: async () => {
      return localizeEntity(caseStudiesData, locale).map((study) => {
        const industry = caseStudyDetailsData[study.id]?.industry;
        return industry
          ? { ...study, industry, industryName: industryLabels[industry][locale] ?? industryLabels[industry].en }
          : study;
      });
    },
  });
  const { data: capabilities = [] } = useQuery({
    queryKey: ["capabilities", locale],
    queryFn: async () => {
      return localizeEntity(expertiseData, locale);
    },
  });
  const { data: platformRows = [] } = useQuery({
    queryKey: ["platforms", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.platforms({ locale }, signal);
      return response.data || [];
    },
  });
  const platforms = platformRows.map((platform) => ({
    ...platform, id: platform.slug || platform.id, category: "",
  }));
  const [industry, setIndustry] = useState("all");
  const [capability, setCapability] = useState("all");
  useDocumentMeta({
    title: t("pages.work.work-page.work-prosperya-bb3774", { en: "Work — Prosperya", fr: "Projets — Prosperya" }),
    description: t("pages.work.work-page.erp-transformation-integration-and-connected-operations-through-732c8a", { en: "ERP transformation, integration and connected operations through illustrative engagements.", fr: "Des exemples de transformation ERP, d’intégration et d’opérations connectées." }),
  });
  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <Section>
        <ErrorState onRetry={() => refetch()} />
      </Section>
    );
  const capabilityNames = Object.fromEntries((capabilities ?? []).map((c) => [c.id, c.detailTitle]));
  const platformNames = Object.fromEntries(platforms.map((p) => [p.id, p.name]));
  const industries = [...new Map(data.filter((s) => s.industry).map((s) => [s.industry, s.industryName]))];
  const capabilityIds = [...new Set(data.flatMap((s) => s.expertiseIds))];
  const filtered = data.filter(
    (study) =>
      (industry === "all" || study.industry === industry) &&
      (capability === "all" || study.expertiseIds.includes(capability)),
  );
  const stats = data.flatMap((study) => study.metrics).filter((metric) => METRIC_ICONS[metric.id]).slice(0, 6);
  return (
    <>
      <PageHero
        breadcrumb={[{ label: t("pages.work.work-page.home-ded702", { en: "Home", fr: "Accueil" }), to: `/${locale}` }, { label: t("pages.work.work-page.work-2af496", { en: "Work", fr: "Projets" }) }]}
        title={t("pages.work.work-page.transformation-stories-that-prove-the-impact-f01aa8", { en: "Transformation stories that prove the impact", fr: "Des transformations qui prouvent l’impact" })}
        lead={
          <p>
            {t("pages.work.work-page.real-challenges-explicit-decisions-measured-outcomes-see-b93c0c", { en: "Real challenges, explicit decisions, measured outcomes. See how an architecture takes shape — illustrative engagements that show how we work.", fr: "Des défis réels, des décisions explicites, des résultats mesurés. Découvrez comment une architecture prend forme — des exemples illustratifs de notre façon de travailler." })}
          </p>
        }
        visual={<WorkDeck studies={data} locale={locale} />}
      />
      <PageContainer>
        <div className={styles.filters}>
          <Filter
            label={t("pages.work.work-page.filter-by-industry-3fbb2d", { en: "Filter by industry", fr: "Filtrer par secteur" })}
            value={industry}
            onChange={setIndustry}
            options={[["all", t("pages.work.work-page.all-industries-42b72e", { en: "All industries", fr: "Tous les secteurs" })], ...industries]}
          />
          <Filter
            label={t("pages.work.work-page.filter-by-capability-9f728f", { en: "Filter by capability", fr: "Filtrer par expertise" })}
            value={capability}
            onChange={setCapability}
            options={[["all", t("pages.work.work-page.all-capabilities-3d897f", { en: "All capabilities", fr: "Toutes les expertises" })], ...capabilityIds.map((id) => [id, capabilityNames[id] ?? id])]}
          />
        </div>
        <p className={styles.count} role="status">
          {filtered.length === 1 ? t("work.count_one", { en: "{count} engagement", fr: "{count} projet" }, { count: filtered.length }) : t("work.count_many", { en: "{count} engagements", fr: "{count} projets" }, { count: filtered.length })} ·{" "}
          {t("pages.work.work-page.illustrative-results-not-verified-ea3ab3", { en: "illustrative, results not verified", fr: "missions illustratives, résultats non vérifiés" })}
        </p>
        {filtered.length ? (
          <div className={styles.features2}>
            {filtered.map((study, index) => (
              <ProjectFeature
                key={study.id}
                study={study}
                index={index}
                locale={locale}
                capabilityNames={capabilityNames}
                platformNames={platformNames}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </PageContainer>
      <Section>
        <div className={styles.band}>
          <h2>{t("pages.work.work-page.across-these-engagements-measured-by-impact-042bbc", { en: "Across these engagements. Measured by impact.", fr: "Sur ces missions. Mesuré par l’impact." })}</h2>
          <ul>
            {stats.map((metric, index) => (
              <li key={`${metric.id}-${index}`}>
                <SystemIcon name={METRIC_ICONS[metric.id]} size={28} strokeWidth={1.2} />
                <strong>
                  <AnimatedCounter value={metric.value} />
                </strong>
                <span>{metric.label}</span>
              </li>
            ))}
          </ul>
          <p>{t("pages.work.work-page.illustrative-figures-from-the-engagements-above-9e82b7", { en: "Illustrative figures from the engagements above.", fr: "Chiffres illustratifs issus des missions présentées." })}</p>
        </div>
      </Section>
      <Testimonials data={stories} isLoading={storiesIsLoading} isError={storiesIsError} refetch={storiesRefetch} variant="rail" />
      <CTASection
        variant="band"
        title={t("pages.work.work-page.facing-a-similar-challenge-bc32be", { en: "Facing a similar challenge?", fr: "Un défi comparable ?" })}
        description={
          t("pages.work.work-page.tell-us-where-you-are-we-will-cb70c5", { en: "Tell us where you are. We will tell you what a first step could look like.", fr: "Dites-nous où vous en êtes : nous vous dirons à quoi pourrait ressembler un premier pas." })
        }
      />
    </>
  );
}
