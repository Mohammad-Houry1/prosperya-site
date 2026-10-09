import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/common/PageHero.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import CaseStudyCard from "../../components/case-study/CaseStudyCard.jsx";
import DetailSections from "../../components/sections/DetailSections.jsx";
import SystemIcon from "../../components/system/SystemIcon.jsx";
import SignalWave from "../../components/visuals/SignalWave.jsx";
import ConnectionMesh from "../../components/visuals/ConnectionMesh.jsx";
import AutomationLanes from "../../components/visuals/AutomationLanes.jsx";
import NetSuiteCoreDiagram from "../../components/visuals/NetSuiteCoreDiagram.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import { useCapabilities, useCapability, useCaseStudies } from "../../queries/useContentQueries.js";
import { useHeroProgress } from "../../motion/hooks/useHeroProgress.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./ExpertiseDetailPage.module.css";

// Each capability tells its own hero story (see expertiseDetails.data.js → scene).
function HeroScene({ scene, progress }) {
  if (scene === "connect") return <ConnectionMesh progressRef={progress} />;
  if (scene === "automate") return <AutomationLanes progressRef={progress} />;
  if (scene === "netsuite") return <NetSuiteCoreDiagram autoplay />;
  return <SignalWave shape={scene} progressRef={progress} strands={42} particles={300} />;
}
const FIELD_SCENES = ["structure", "audit", "rescue"];

function DetailHero({ item, detail, locale }) {
  const fr = locale === "fr";
  const heroRef = useRef(null);
  const progress = useHeroProgress(heroRef);
  const scene = detail.scene ?? "structure";
  const field = FIELD_SCENES.includes(scene);
  return (
    <div ref={heroRef} className={styles.heroWrap} data-scene={scene}>
      {field && (
        <div className={styles.field}>
          <HeroScene scene={scene} progress={progress} />
        </div>
      )}
      <PageHero
        className={styles.hero}
        breadcrumb={[
          { label: fr ? "Accueil" : "Home", to: `/${locale}` },
          { label: "Expertise", to: `/${locale}/expertise` },
          { label: item.detailTitle },
        ]}
        title={item.detailTitle}
        titleClassName={`${styles.title} ${item.detailTitle.length > 24 ? styles.long : ""}`}
        lead={
          <>
            <p className={styles.tagline}>{detail.tagline}</p>
            <p>{detail.lead ?? item.longDescription}</p>
          </>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/contact`}>
              {fr ? "Démarrer votre projet" : "Start your transformation"}
            </PrimaryLink>
            <PrimaryLink to={`/${locale}/approach`} variant="ghost">
              {fr ? "Découvrir notre approche" : "Explore our approach"}
            </PrimaryLink>
          </>
        }
        visual={
          field ? null : (
            <div className={styles.sceneFrame}>
              <HeroScene scene={scene} progress={progress} />
            </div>
          )
        }
        below={
          detail.keyOutcomes && (
            <div className={styles.keyOutcomesWrap}>
              <div className={styles.keyOutcomes} data-reveal="card" style={{ "--i": 6 }}>
                <span>{detail.keyOutcomesLabel}</span>
                <ul>
                  {detail.keyOutcomes.map(([icon, label]) => (
                    <li key={label}>
                      <SystemIcon name={icon} size={22} strokeWidth={1.3} />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}

export default function ExpertiseDetailPage() {
  const { slug } = useParams();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const capability = useCapability(locale, slug);
  const capabilities = useCapabilities(locale);
  const studies = useCaseStudies(locale);
  const item = capability.data;
  useDocumentMeta({
    title: item ? `${item.detailTitle} — Prosperya` : "Prosperya — Expertise",
    description: item?.detail?.lead ?? item?.description,
  });
  if (capability.isLoading) return <PageLoader />;
  if (capability.isError)
    return (
      <Section>
        <ErrorState onRetry={() => capability.refetch()} />
      </Section>
    );
  if (!item)
    return (
      <Section>
        <EmptyState
          title={fr ? "Expertise introuvable" : "Expertise not found"}
          description={fr ? "Cette expertise n’existe pas ou n’est pas encore disponible." : "This capability does not exist or is not available yet."}
        />
      </Section>
    );
  const detail = item.detail ?? {};
  const related = (capabilities.data ?? []).filter((other) => other.id !== item.id);
  const work = (studies.data ?? []).filter((study) => item.relatedCaseStudyIds.includes(study.id));
  return (
    <>
      <DetailHero item={item} detail={detail} locale={locale} />
      <DetailSections sections={detail.sections} locale={locale} />
      {work.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow={fr ? "En contexte" : "In context"}
            title={fr ? "Voir l’architecture en situation." : "See the architecture in context."}
            action={{ to: `/${locale}/work`, label: fr ? "Tous les cas clients" : "All case studies" }}
          />
          <div className={styles.work}>
            {work.map((study, index) => (
              <CaseStudyCard key={study.id} study={study} locale={locale} index={index} />
            ))}
          </div>
        </Section>
      )}
      <Section>
        <SectionHeader
          eyebrow={fr ? "Expertises associées" : "Related expertise"}
          title={fr ? "Des capacités complémentaires." : "Explore complementary capabilities."}
        />
        <ul className={styles.related}>
          {related.map((other, index) => (
            <li key={other.id} data-reveal="card" style={{ "--i": index }}>
              <Link to={`/${locale}/expertise/${other.slug}`}>
                <SystemIcon name={other.icon} size={20} strokeWidth={1.4} />
                <strong>{other.detailTitle}</strong>
                <span>{other.summary}</span>
                <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <CTASection
        variant={detail.cta ?? "card"}
        title={detail.ctaTitle}
        description={detail.ctaText}
        secondary={{ path: "contact", label: fr ? "Parler à un expert" : "Talk to an expert" }}
      />
    </>
  );
}
