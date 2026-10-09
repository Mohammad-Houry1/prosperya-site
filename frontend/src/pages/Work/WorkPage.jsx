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
import { useCapabilities, useCaseStudies, usePlatforms } from "../../queries/useContentQueries.js";
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
  const { locale } = useLocale();
  const fr = locale === "fr";
  const query = useCaseStudies(locale);
  const capabilities = useCapabilities(locale);
  const platforms = usePlatforms(locale);
  const [industry, setIndustry] = useState("all");
  const [capability, setCapability] = useState("all");
  useDocumentMeta({
    title: fr ? "Projets — Prosperya" : "Work — Prosperya",
    description: fr
      ? "Des exemples de transformation ERP, d’intégration et d’opérations connectées."
      : "ERP transformation, integration and connected operations through illustrative engagements.",
  });
  if (query.isLoading) return <PageLoader />;
  if (query.isError)
    return (
      <Section>
        <ErrorState onRetry={() => query.refetch()} />
      </Section>
    );
  const data = query.data ?? [];
  const capabilityNames = Object.fromEntries((capabilities.data ?? []).map((c) => [c.id, c.detailTitle]));
  const platformNames = Object.fromEntries((platforms.data ?? []).map((p) => [p.id, p.name]));
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
        breadcrumb={[{ label: fr ? "Accueil" : "Home", to: `/${locale}` }, { label: fr ? "Projets" : "Work" }]}
        title={fr ? "Des transformations qui prouvent l’impact" : "Transformation stories that prove the impact"}
        lead={
          <p>
            {fr
              ? "Des défis réels, des décisions explicites, des résultats mesurés. Découvrez comment une architecture prend forme — des exemples illustratifs de notre façon de travailler."
              : "Real challenges, explicit decisions, measured outcomes. See how an architecture takes shape — illustrative engagements that show how we work."}
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
          <h2>{fr ? "Sur ces missions. Mesuré par l’impact." : "Across these engagements. Measured by impact."}</h2>
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
          <p>{fr ? "Chiffres illustratifs issus des missions présentées." : "Illustrative figures from the engagements above."}</p>
        </div>
      </Section>
      <Testimonials variant="rail" />
      <CTASection
        variant="band"
        title={fr ? "Un défi comparable ?" : "Facing a similar challenge?"}
        description={
          fr
            ? "Dites-nous où vous en êtes : nous vous dirons à quoi pourrait ressembler un premier pas."
            : "Tell us where you are. We will tell you what a first step could look like."
        }
      />
    </>
  );
}
