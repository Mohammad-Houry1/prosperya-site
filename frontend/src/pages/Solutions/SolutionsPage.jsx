import { websiteApi } from "../../services/websiteApi.js";
import { adaptSolution, adaptCaseStudy } from "../../repositories/marketing.repository.js";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import Section from "../../components/common/Section.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import SolutionRow from "../../components/expertise/SolutionRow.jsx";
import LayeredArchitecture from "../../components/visuals/LayeredArchitecture.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import SolutionStrip from "./SolutionStrip.jsx";
import SolutionProof from "./SolutionProof.jsx";
import styles from "./SolutionsPage.module.css";

export default function SolutionsPage() {
  const {locale, t } = useLocale();

  const { isLoading, isError, refetch, data = [] } = useQuery({
    queryKey: ["solutions", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.solutions({ locale }, signal);
      return (response.data || []).map(adaptSolution);
    },
  });
  const { data: studies = [] } = useQuery({
    queryKey: ["case-studies", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.caseStudies({ locale }, signal);
      return (response.data || []).map(adaptCaseStudy);
    },
  });
  useDocumentMeta({
    title: "Prosperya — Solutions",
    description: t("pages.solutions.solutions-page.finance-operations-supply-chain-and-data-solutions-69ed3c"),
  });
  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <Section>
        <ErrorState onRetry={() => refetch()} />
      </Section>
    );
  return (
    <>
      <PageHero
        eyebrow={t("nav.solutions")}
        title={t("pages.solutions.solutions-page.solutions-built-for-the-way-your-business-c82c90")}
        lead={
          <p>
            {t("pages.solutions.solutions-page.integrated-systems-intelligent-automation-and-actionable-insight-59c571")}
          </p>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/approach`}>{t("pages.solutions.solutions-page.explore-our-approach-de10c8")}</PrimaryLink>
            <PrimaryLink to={`/${locale}/contact`} variant="ghost">
              {t("pages.solutions.solutions-page.talk-to-an-expert-8e5217")}
            </PrimaryLink>
          </>
        }
        layout="stacked"
        className={styles.hero}
        below={
          <PageContainer className={styles.stripWrap}>
            <SolutionStrip items={data} locale={locale} />
          </PageContainer>
        }
      />
      <section className={styles.solutions} aria-labelledby="solutions-heading">
        <div className={styles.panel}>
          <div className={styles.sticky}>
            <h2 id="solutions-heading">
              {t("pages.solutions.solutions-page.end-to-end-solutions-132f71")}
              <span>{t("pages.solutions.solutions-page.built-around-your-business-outcomes-22e3a4")}</span>
            </h2>
          </div>
          <div className={styles.rows}>
            {!data.length && <EmptyState />}
            {data.map((solution, index) => (
              <SolutionRow key={solution.id} solution={solution} locale={locale} index={index} />
            ))}
          </div>
        </div>
      </section>
      <section className={styles.architecture}>
        <div className={styles.panel}>
          <div className={styles.sticky}>
            <h2>{t("pages.solutions.solutions-page.built-on-a-connected-architecture-that-scales-a0fd13")}</h2>
            <p>
              {t("pages.solutions.solutions-page.our-enterprise-architecture-connects-people-processes-and-77db9d")}
            </p>
          </div>
          <LayeredArchitecture />
        </div>
      </section>
      <SolutionProof solutions={data} studies={studies ?? []} locale={locale} />
      <CTASection
        variant="band"
        title={t("pages.solutions.solutions-page.which-function-should-move-first-74e99d")}
        description={
          t("pages.solutions.solutions-page.we-help-you-pick-the-function-where-15082c")
        }
        secondary={{ path: "expertise", label: t("pages.solutions.solutions-page.explore-our-expertise-245f76") }}
      />
    </>
  );
}
