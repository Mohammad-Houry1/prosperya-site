import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import SignalWave from "../../components/visuals/SignalWave.jsx";
import ConnectionMesh from "../../components/visuals/ConnectionMesh.jsx";
import AutomationLanes from "../../components/visuals/AutomationLanes.jsx";
import NetSuiteCoreDiagram from "../../components/visuals/NetSuiteCoreDiagram.jsx";
import { useHeroProgress } from "../../motion/hooks/useHeroProgress.js";
import { useGsapContext } from "../../motion/hooks/useGsapContext.js";
import styles from "./ExpertiseDetailPage.module.css";

const SCENES = {
  "erp-transformation": "structure", "systems-integration": "connect",
  "automation-custom-development": "automate", "erp-optimization": "audit",
  "netsuite-implementation": "netsuite", "erp-rescue": "rescue",
};
function HeroAnimation({ slug, progress }) {
  const scene = SCENES[slug] || "structure";
  if (scene === "connect") return <ConnectionMesh progressRef={progress} />;
  if (scene === "automate") return <AutomationLanes progressRef={progress} />;
  if (scene === "netsuite") return <NetSuiteCoreDiagram autoplay />;
  return <SignalWave shape={scene} progressRef={progress} strands={42} particles={300} />;
}
export default function ExpertisePageContent({ page, related = [], locale }) {
  const { t } = useLocale();

  const pageRef = useRef(null);
  const readingRef = useRef(null);
  const heroRef = useRef(null);
  const progress = useHeroProgress(heroRef);
  const [activeSection, setActiveSection] = useState(0);
  const sections = page.sections || [];
  useEffect(() => {
    setActiveSection(0);
    if (typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveSection(Number(entry.target.dataset.expertiseSection));
      }
    }, { rootMargin: "-25% 0px -50% 0px" });
    pageRef.current.querySelectorAll("[data-expertise-section]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [page.slug, page.sections]);
  useGsapContext(pageRef, ({ gsap }) => {
    if (!readingRef.current) return;
    gsap.fromTo(readingRef.current, { scaleX: 0 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: pageRef.current, start: "top top", end: "bottom bottom", scrub: 0.3 },
    });
  }, [page.slug, page.sections]);
  return (
    <div ref={pageRef} className={styles.page}>
      <div ref={heroRef} className={styles.heroWrap}>
        <PageHero className={styles.hero} title={page.title} titleClassName={styles.title}
          breadcrumb={[
            { label: t("pages.expertise-detail.expertise-page-content.home-ded702", { en: "Home", fr: "Accueil" }), to: `/${locale}` },
            { label: t("nav.expertise"), to: `/${locale}/expertise` }, { label: page.title },
          ]}
          lead={<CmsRichHtml html={page.description} imageAlt={page.title} />}
          actions={<>
            <PrimaryLink to={`/${locale}/contact`}>{t("pages.expertise-detail.expertise-page-content.start-your-transformation-6e62e2", { en: "Start your transformation", fr: "Démarrer votre projet" })}</PrimaryLink>
            <PrimaryLink to={`/${locale}/approach`} variant="ghost">{t("pages.expertise-detail.expertise-page-content.explore-our-approach-de10c8", { en: "Explore our approach", fr: "Découvrir notre approche" })}</PrimaryLink>
          </>}
          visual={<div className={styles.sceneFrame} aria-hidden="true" data-reveal="scale" data-animation={SCENES[page.slug] || "structure"}>
            <span className={styles.frameLabel}>{t("pages.expertise-detail.expertise-page-content.systems-in-motion-f02084", { en: "Systems in motion", fr: "Systèmes en mouvement" })}</span>
            <div className={styles.sceneVisual}><HeroAnimation slug={page.slug} progress={progress} /></div>
            <span className={styles.frameCaption}>Prosperya <span>/</span> {t("nav.expertise")}</span>
          </div>}
        />
      </div>
      {sections.length > 0 && <nav className={styles.sectionNav} aria-label={t("pages.expertise-detail.expertise-page-content.on-this-page-765502", { en: "On this page", fr: "Dans cette page" })}>
        <PageContainer className={styles.navInner}>
          <span className={styles.navLabel}>{t("pages.expertise-detail.expertise-page-content.on-this-page-765502", { en: "On this page", fr: "Dans cette page" })}</span>
          <ol className={styles.navLinks}>{sections.map((section, index) => <li key={section.id || index}>
            <a href={`#expertise-section-${index + 1}`} aria-current={activeSection === index ? "location" : undefined} onClick={() => setActiveSection(index)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.title || `Section ${index + 1}`}
            </a>
          </li>)}</ol>
        </PageContainer>
        <span className={styles.readingTrack} aria-hidden="true"><span ref={readingRef} className={styles.readingFill} /></span>
      </nav>}
      {sections.map((section, index) => (
        <Section key={section.id || index} id={`expertise-section-${index + 1}`} className={styles.contentSection}>
          <div className={styles.contentGrid} data-expertise-section={index}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionRule} aria-hidden="true" data-reveal="line" />
              <span className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</span>
              {section.title && <h2>{section.title}</h2>}
            </div>
            <CmsRichHtml html={section.description} imageAlt={section.title || page.title} className={styles.sectionBody} />
          </div>
        </Section>
      ))}
      {related.length > 0 && <Section>
        <SectionHeader eyebrow={t("pages.expertise-detail.expertise-page-content.related-expertise-d6a7c0", { en: "Related expertise", fr: "Expertises associées" })} title={t("pages.expertise-detail.expertise-page-content.explore-complementary-capabilities-9969cf", { en: "Explore complementary capabilities.", fr: "Des capacités complémentaires." })} />
        <ul className={styles.related}>{related.map((item, index) => <li key={item.id || item.slug} data-reveal="card" style={{ "--i": index }}>
          <Link to={`/${locale}/expertise/${item.slug}`}>
            <span className={styles.relatedNumber}>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.title}</strong><ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </li>)}</ul>
      </Section>}
      <CTASection variant="card" secondary={{ path: "contact", label: t("pages.expertise-detail.expertise-page-content.talk-to-an-expert-8e5217", { en: "Talk to an expert", fr: "Parler à un expert" }) }} />
    </div>
  );
}
