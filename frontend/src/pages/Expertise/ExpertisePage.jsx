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
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { isLoading: capabilitiesIsLoading, isError: capabilitiesIsError, refetch: capabilitiesRefetch, data: capabilities = [] } = useQuery({
    queryKey: ["capabilities", locale],
    queryFn: async () => {
      return localizeEntity(expertiseData, locale);
    },
  });
  useDocumentMeta({
    title: "Prosperya — Expertise",
    description: fr
      ? "Transformation ERP, implémentation NetSuite, intégration, automatisation, audit et redressement."
      : "ERP transformation, NetSuite implementation, integration, automation, audit and rescue.",
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
        eyebrow="Expertise"
        title={fr ? "Des expertises qui produisent des résultats." : "Capabilities that drive measurable results."}
        lead={
          <p>
            {fr
              ? "Nous aidons les entreprises à concevoir, connecter et optimiser leurs systèmes pour simplifier les opérations, réduire la complexité et libérer la performance."
              : "We help enterprises design, connect and optimize their systems to simplify operations, reduce complexity and unlock performance at scale."}
          </p>
        }
        visual={<CapabilityIndex items={items} locale={locale} />}
      />
      <CapabilityStory items={items.slice(0, 4)} locale={locale} />
      <Section>
        <div className={styles.architecture}>
          <div className={styles.architectureCopy}>
            <Eyebrow>{fr ? "Notre approche d’architecture" : "Our architecture approach"}</Eyebrow>
            <h2>
              {fr ? "Conçu pour connecter." : "Built to connect."}
              <span>{fr ? "Pensé pour grandir." : "Designed to scale."}</span>
            </h2>
            <p>
              {fr
                ? "Notre cadre d’architecture unifie systèmes, données et processus pour créer une fondation résiliente et évolutive."
                : "Our architecture framework unifies your enterprise systems, data and processes — creating a resilient, scalable foundation for growth."}
            </p>
            <PrimaryLink to={`/${locale}/approach`} variant="text">
              {fr ? "Découvrir notre approche" : "Explore our approach"}
            </PrimaryLink>
          </div>
          <ArchitectureFlowDiagram />
        </div>
      </Section>
      <CTASection
        variant="card"
        title={fr ? "Vous hésitez entre plusieurs expertises ?" : "Not sure which capability you need?"}
        description={
          fr
            ? "Décrivez le problème : nous vous indiquerons le bon point de départ."
            : "Describe the problem. We will point you to the right starting point."
        }
        secondary={{ path: "contact", label: fr ? "Parler à un expert" : "Talk to an expert" }}
      />
    </>
  );
}
