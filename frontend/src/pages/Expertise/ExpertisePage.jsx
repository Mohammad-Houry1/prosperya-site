import { expertiseData } from "../../data/expertise.data.js";
import { localizeEntity } from "../../repositories/localize.js";
import PageHero from "../../components/common/PageHero.jsx";
import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import ArchitectureFlowDiagram from "../../components/visuals/ArchitectureFlowDiagram.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import CapabilityStory from "./CapabilityStory.jsx";
import CapabilityIndex from "./CapabilityIndex.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./ExpertisePage.module.css";

export default function ExpertisePage() {
  const {locale, t } = useLocale();

  const { isLoading: capabilitiesIsLoading, isError: capabilitiesIsError, refetch: capabilitiesRefetch, data: capabilities = [] } = useQuery({
    queryKey: ["capabilities", locale],
    queryFn: async () => {
      return localizeEntity(expertiseData, locale);
    },
  });
  useDocumentMeta({
    title: "Prosperya — Expertise",
    description: t("pages.expertise.expertise-page.erp-transformation-netsuite-implementation-integration-automation-audit-51a3ca", { en: "ERP transformation, NetSuite implementation, integration, automation, audit and rescue.", fr: "Transformation ERP, implémentation NetSuite, intégration, automatisation, audit et redressement." }),
  });
  if (capabilitiesIsLoading) return <PageLoader />;
  if (capabilitiesIsError)
    return (
      <Section>
        <ErrorState onRetry={capabilitiesRefetch} />
      </Section>
    );
  const items = capabilities ?? [];
  return (
    <>
      <PageHero
        eyebrow={t("nav.expertise")}
        title={t("pages.expertise.expertise-page.capabilities-that-drive-measurable-results-ad246d", { en: "Capabilities that drive measurable results.", fr: "Des expertises qui produisent des résultats." })}
        lead={
          <p>
            {t("pages.expertise.expertise-page.we-help-enterprises-design-connect-and-optimize-2b00c4", { en: "We help enterprises design, connect and optimize their systems to simplify operations, reduce complexity and unlock performance at scale.", fr: "Nous aidons les entreprises à concevoir, connecter et optimiser leurs systèmes pour simplifier les opérations, réduire la complexité et libérer la performance." })}
          </p>
        }
        visual={<CapabilityIndex items={items} locale={locale} />}
      />
      <CapabilityStory items={items.slice(0, 4)} locale={locale} />
      <Section>
        <div className={styles.architecture}>
          <div className={styles.architectureCopy}>
            <Eyebrow>{t("pages.expertise.expertise-page.our-architecture-approach-37ec21", { en: "Our architecture approach", fr: "Notre approche d’architecture" })}</Eyebrow>
            <h2>
              {t("pages.expertise.expertise-page.built-to-connect-5ea962", { en: "Built to connect.", fr: "Conçu pour connecter." })}
              <span>{t("pages.expertise.expertise-page.designed-to-scale-4d2442", { en: "Designed to scale.", fr: "Pensé pour grandir." })}</span>
            </h2>
            <p>
              {t("pages.expertise.expertise-page.our-architecture-framework-unifies-your-enterprise-systems-46a34d", { en: "Our architecture framework unifies your enterprise systems, data and processes — creating a resilient, scalable foundation for growth.", fr: "Notre cadre d’architecture unifie systèmes, données et processus pour créer une fondation résiliente et évolutive." })}
            </p>
            <PrimaryLink to={`/${locale}/approach`} variant="text">
              {t("pages.expertise.expertise-page.explore-our-approach-de10c8", { en: "Explore our approach", fr: "Découvrir notre approche" })}
            </PrimaryLink>
          </div>
          <ArchitectureFlowDiagram />
        </div>
      </Section>
      <CTASection
        variant="card"
        title={t("pages.expertise.expertise-page.not-sure-which-capability-you-need-915e66", { en: "Not sure which capability you need?", fr: "Vous hésitez entre plusieurs expertises ?" })}
        description={
          t("pages.expertise.expertise-page.describe-the-problem-we-will-point-you-b40a3b", { en: "Describe the problem. We will point you to the right starting point.", fr: "Décrivez le problème : nous vous indiquerons le bon point de départ." })
        }
        secondary={{ path: "contact", label: t("pages.expertise.expertise-page.talk-to-an-expert-8e5217", { en: "Talk to an expert", fr: "Parler à un expert" }) }}
      />
    </>
  );
}
