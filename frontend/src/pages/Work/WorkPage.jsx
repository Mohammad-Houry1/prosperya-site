import { caseStudiesData } from "../../data/caseStudies.data.js";
import { caseStudyDetailsData, industries as industryLabels } from "../../data/caseStudyDetails.data.js";
import { expertiseData } from "../../data/expertise.data.js";
import { localizeEntity } from "../../repositories/localize.js";
import { stagingContent } from "../../services/stagingContent.js";
import { useState } from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "../../components/common/ResponsiveImage.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import Section from "../../components/common/Section.jsx";
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
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { data: stories = [], isLoading: storiesIsLoading, isError: storiesIsError, refetch: storiesRefetch } = useQuery({
    queryKey: ["company-stories", locale],
    queryFn: async ({ signal }) => {
      const response = await stagingContent.testimonials({ locale }, signal);
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
  const [industry, setIndustry] = useState("all");
  const [capability, setCapability] = useState("all");
  useDocumentMeta({
    title: fr ? "Projets — Prosperya" : "Work — Prosperya",
    description: fr
      ? "Des exemples de transformation ERP, d’intégration et d’opérations connectées."
      : "ERP transformation, integration and connected operations through illustrative engagements.",
  });
  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <Section>
        <ErrorState onRetry={() => refetch()} />
      </Section>
    );
  const capabilityNames = Object.fromEntries((capabilities ?? []).map((c) => [c.id, c.detailTitle]));
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
        breadcrumb={[{ label: fr ? "Accueil" : "Home", to: `/${locale}` }, { label: fr ? "Projets" : "Work" }]}
        title={fr ? "Des transformations qui prouvent l’impact" : "Transformation stories that prove the impact"}
        lead={
          <p>
            {fr
              ? "Découvrez nos exemples de transformation ERP et d’opérations connectées — des missions illustratives de notre façon de travailler."
              : "Explore ERP transformation and connected operations through illustrative engagements that show how we work."}
          </p>
        }
        visual={<WorkDeck studies={data} locale={locale} />}
      />
      <PageContainer>
        <div className={styles.filters}>
          <Filter
            label={fr ? "Filtrer par secteur" : "Filter by industry"}
            value={industry}
            onChange={setIndustry}
            options={[["all", fr ? "Tous les secteurs" : "All industries"], ...industries]}
          />
          <Filter
            label={fr ? "Filtrer par expertise" : "Filter by capability"}
            value={capability}
            onChange={setCapability}
            options={[["all", fr ? "Toutes les expertises" : "All capabilities"], ...capabilityIds.map((id) => [id, capabilityNames[id] ?? id])]}
          />
        </div>
        <p className={styles.count} role="status">
          {filtered.length} {fr ? "projet(s)" : filtered.length === 1 ? "engagement" : "engagements"} ·{" "}
          {fr ? "missions illustratives, résultats non vérifiés" : "illustrative, results not verified"}
        </p>
        {filtered.length ? (
          <div className={styles.projectGrid} aria-label={fr ? "Projets" : "Projects"}>
            {filtered.map((study, index) => (
              <article key={study.id} className={styles.project} data-reveal="card" style={{ "--i": index }}>
                {study.image?.src && <Link to={`/${locale}/work/${study.slug}`} className={styles.projectImage} tabIndex={-1} aria-hidden="true">
                  <ResponsiveImage src={study.image.src} alt="" width={study.image.width} height={study.image.height} sizes="(max-width: 700px) 100vw, 50vw" />
                </Link>}
                <div className={styles.projectCopy}>
                  {study.industryName && <span className={styles.industry}>{study.industryName}</span>}
                  <h2><Link to={`/${locale}/work/${study.slug}`}>{study.name || study.title}</Link></h2>
                  {study.description && <p>{study.description}</p>}
                  {study.client && <span className={styles.client}>{study.client}</span>}
                  <PrimaryLink to={`/${locale}/work/${study.slug}`} variant="text">{fr ? "Voir le cas client" : "View case study"}</PrimaryLink>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </PageContainer>
      <Testimonials data={stories} isLoading={storiesIsLoading} isError={storiesIsError} refetch={storiesRefetch} variant="rail" />
      <Section className={styles.contactSection}>
        <div className={styles.contact}>
          <p>{fr ? "Un défi comparable ?" : "Facing a similar challenge?"}</p>
          <PrimaryLink to={`/${locale}/contact`} variant="text">{fr ? "Parlons de votre projet" : "Let’s talk about your project"}</PrimaryLink>
        </div>
      </Section>
    </>
  );
}
