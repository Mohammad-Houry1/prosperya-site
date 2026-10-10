import { websiteApi } from "../../services/websiteApi.js";
import { adaptExpertise } from "../../repositories/marketing.repository.js";
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
    queryFn: async ({ signal }) => {
      const response = await websiteApi.expertise({ locale }, signal);
      return (response.data || []).map(adaptExpertise);
    },
  });
  useDocumentMeta({
    title: "Prosperya — Expertise",
    description: t("pages.expertise.expertise-page.erp-transformation-netsuite-implementation-integration-automation-audit-51a3ca"),
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
        title={t("pages.expertise.expertise-page.capabilities-that-drive-measurable-results-ad246d")}
        lead={
          <p>
            {t("pages.expertise.expertise-page.we-help-enterprises-design-connect-and-optimize-2b00c4")}
          </p>
        }
        visual={<CapabilityIndex items={items} locale={locale} />}
      />
      <CapabilityStory items={items} locale={locale} />
      <Section>
        <div className={styles.architecture}>
          <div className={styles.architectureCopy}>
            <Eyebrow>{t("pages.expertise.expertise-page.our-architecture-approach-37ec21")}</Eyebrow>
            <h2>
              {t("pages.expertise.expertise-page.built-to-connect-5ea962")}
              <span>{t("pages.expertise.expertise-page.designed-to-scale-4d2442")}</span>
            </h2>
            <p>
              {t("pages.expertise.expertise-page.our-architecture-framework-unifies-your-enterprise-systems-46a34d")}
            </p>
            <PrimaryLink to={`/${locale}/approach`} variant="text">
              {t("pages.expertise.expertise-page.explore-our-approach-de10c8")}
            </PrimaryLink>
          </div>
          <ArchitectureFlowDiagram />
        </div>
      </Section>
      <CTASection
        variant="card"
        title={t("pages.expertise.expertise-page.not-sure-which-capability-you-need-915e66")}
        description={
          t("pages.expertise.expertise-page.describe-the-problem-we-will-point-you-b40a3b")
        }
        secondary={{ path: "contact", label: t("pages.expertise.expertise-page.talk-to-an-expert-8e5217") }}
      />
    </>
  );
}
