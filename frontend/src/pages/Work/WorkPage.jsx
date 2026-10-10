import { adaptExpertise, adaptCaseStudy } from "../../repositories/marketing.repository.js";
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
    queryFn: async ({ signal }) => {
      const response = await websiteApi.caseStudies({ locale }, signal);
      return (response.data || []).map(adaptCaseStudy);
    },
  });
  const { data: capabilities = [] } = useQuery({
    queryKey: ["capabilities", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.expertise({ locale }, signal);
      return (response.data || []).map(adaptExpertise);
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
    ...platform, id: platform.id, category: "",
  }));
  const [industry, setIndustry] = useState("all");
  const [capability, setCapability] = useState("all");
  useDocumentMeta({
    title: t("pages.work.work-page.work-prosperya-bb3774"),
    description: t("pages.work.work-page.erp-transformation-integration-and-connected-operations-through-732c8a"),
  });
  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <Section>
        <ErrorState onRetry={() => refetch()} />
      </Section>
    );
  const capabilityNames = Object.fromEntries((capabilities ?? []).map((c) => [c.id, c.detailTitle]));
  const platformNames = Object.fromEntries([...platforms, ...data.flatMap(study => study.platforms || [])].map((p) => [p.id, p.name]));
  const industries = [...new Map(data.filter((s) => s.industry).map((s) => [s.industry, s.industryName]))];
  const capabilityIds = [...new Set(data.flatMap((s) => s.expertiseIds))];
  const filtered = data.filter(
    (study) =>
      (industry === "all" || study.industry === industry) &&
      (capability === "all" || study.expertiseIds.includes(capability)),
  );
  const stats = data.flatMap((study) => study.metrics).slice(0, 6);
  return (
    <>
      <PageHero
        breadcrumb={[{ label: t("pages.work.work-page.home-ded702"), to: `/${locale}` }, { label: t("pages.work.work-page.work-2af496") }]}
        title={t("pages.work.work-page.transformation-stories-that-prove-the-impact-f01aa8")}
        lead={
          <p>
            {t("pages.work.work-page.real-challenges-explicit-decisions-measured-outcomes-see-b93c0c")}
          </p>
        }
        visual={<WorkDeck studies={data} locale={locale} />}
      />
      <PageContainer>
        <div className={styles.filters}>
          <Filter
            label={t("pages.work.work-page.filter-by-industry-3fbb2d")}
            value={industry}
            onChange={setIndustry}
            options={[["all", t("pages.work.work-page.all-industries-42b72e")], ...industries]}
          />
          <Filter
            label={t("pages.work.work-page.filter-by-capability-9f728f")}
            value={capability}
            onChange={setCapability}
            options={[["all", t("pages.work.work-page.all-capabilities-3d897f")], ...capabilityIds.map((id) => [id, capabilityNames[id]])]}
          />
        </div>
        <p className={styles.count} role="status">
          {filtered.length === 1 ? t("work.count_one", { count: filtered.length }) : t("work.count_many", { count: filtered.length })}
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
          <h2>{t("pages.work.work-page.across-these-engagements-measured-by-impact-042bbc")}</h2>
          <ul>
            {stats.map((metric, index) => (
              <li key={`${metric.id}-${index}`}>
                <SystemIcon name={"chart"} size={28} strokeWidth={1.2} />
                <strong>
                  <AnimatedCounter value={metric.value} />
                </strong>
                <span>{metric.label}</span>
              </li>
            ))}
          </ul>
          <p>{t("pages.work.work-page.illustrative-figures-from-the-engagements-above-9e82b7")}</p>
        </div>
      </Section>
      <Testimonials data={stories} isLoading={storiesIsLoading} isError={storiesIsError} refetch={storiesRefetch} variant="rail" />
      <CTASection
        variant="band"
        title={t("pages.work.work-page.facing-a-similar-challenge-bc32be")}
        description={
          t("pages.work.work-page.tell-us-where-you-are-we-will-cb70c5")
        }
      />
    </>
  );
}
