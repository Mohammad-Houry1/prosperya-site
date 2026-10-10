import { adaptExpertise, adaptCaseStudy } from "../../repositories/marketing.repository.js";
import { websiteApi } from "../../services/websiteApi.js";
import { useId, useState } from "react";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import Section from "../../components/common/Section.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import { Link } from "react-router-dom";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Testimonials from "../../components/company/Testimonials.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import WorkDeck from "./WorkDeck.jsx";
import styles from "./WorkPage.module.css";


function Filter({ label, value, options, onChange }) {
  const labelId = useId();
  return (
    <div className={styles.filter}>
      <span id={labelId}>{label}</span>
      <div role="group" aria-labelledby={labelId}>
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
  const capabilityNames = Object.fromEntries((capabilities ?? []).map((c) => [c.id, c.detailTitle || c.title]));
  const industries = [...new Map(data.filter((s) => s.industry).map((s) => [s.industry, s.industryName]))];
  const capabilityIds = [...new Set(data.flatMap((s) => s.expertiseIds))];
  const filtered = data.filter(
    (study) =>
      (industry === "all" || study.industry === industry) &&
      (capability === "all" || study.expertiseIds.includes(capability)),
  );
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: t("pages.work.work-page.home-ded702"), to: `/${locale}` },
          { label: t("pages.work.work-page.work-2af496") },
        ]}
        title={
          t("pages.work.work-page.transformation-stories-that-prove-the-impact-f01aa8")
        }
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
            options={[
              ["all", t("pages.work.work-page.all-industries-42b72e")],
              ...industries,
            ]}
          />
          <Filter
            label={t("pages.work.work-page.filter-by-capability-9f728f")}
            value={capability}
            onChange={setCapability}
            options={[
              ["all", t("pages.work.work-page.all-capabilities-3d897f")],
              ...capabilityIds.map((id) => [id, capabilityNames[id] ?? id]),
            ]}
          />
        </div>
        <p className={styles.count} role="status">
          {filtered.length === 1 ? t("work.count_one", { count: filtered.length }) : t("work.count_many", { count: filtered.length })}
        </p>
        {filtered.length ? (
          <div
            className={styles.projectGrid}
            aria-label={t("pages.work.work-page.work-2af496")}
          >
            {filtered.map((study, index) => (
              <article
                key={study.id}
                className={styles.project}
                data-reveal="card"
                style={{ "--i": index }}
              >
                <Link
                  to={`/${locale}/work/${study.slug}`}
                  className={styles.projectImage}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <CaseVisual
                    study={study}
                    sizes="(max-width: 700px) 100vw, 50vw"
                  />
                </Link>
                <div className={styles.projectCopy}>
                  {study.industryName && (
                    <span className={styles.industry}>
                      {study.industryName}
                    </span>
                  )}
                  <h2>
                    <Link to={`/${locale}/work/${study.slug}`}>
                      {study.name || study.title}
                    </Link>
                  </h2>
                  {study.description && <p>{study.description}</p>}
                  {study.case_study_client && (
                    <span className={styles.client}>{study.case_study_client}</span>
                  )}
                  <PrimaryLink
                    to={`/${locale}/work/${study.slug}`}
                    variant="text"
                  >
                    {t("pages.case-study.case-study-page.view-case-study-2050cc")}
                  </PrimaryLink>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </PageContainer>
      {(storiesIsLoading || storiesIsError) && <Testimonials data={stories} isLoading={storiesIsLoading} isError={storiesIsError} refetch={storiesRefetch} variant="rail" />}
      {!storiesIsLoading && !storiesIsError && stories.length > 0 && (
        <Section>
          <figure className={styles.testimonial}>
            <span>{t("components.company.testimonials.client-perspectives-457ff0")}</span>
            <blockquote>{stories[0].quote}</blockquote>
            <figcaption>
              {[stories[0].name, stories[0].role, stories[0].company]
                .filter(Boolean)
                .join(" · ")}
            </figcaption>
          </figure>
        </Section>
      )}
      <CTASection variant="split" showSecondButton={false}
        title={t("pages.work.work-page.facing-a-similar-challenge-bc32be")}
        description={t("pages.work.work-page.tell-us-where-you-are-we-will-cb70c5")}
      />
    </>
  );
}
