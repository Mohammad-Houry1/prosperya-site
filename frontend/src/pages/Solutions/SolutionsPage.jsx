import { caseStudiesData } from "../../data/caseStudies.data.js";
import { caseStudyDetailsData, industries } from "../../data/caseStudyDetails.data.js";
import { localizeEntity } from "../../repositories/localize.js";
import { solutionsData } from "../../data/solutions.data.js";
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
    queryFn: async () => {
      return localizeEntity(solutionsData, locale);
    },
  });
  const { data: studies = [] } = useQuery({
    queryKey: ["case-studies", locale],
    queryFn: async () => {
      return localizeEntity(caseStudiesData, locale).map((study) => {
        const industry = caseStudyDetailsData[study.id]?.industry;
        return industry
          ? { ...study, industry, industryName: industries[industry][locale] ?? industries[industry].en }
          : study;
      });
    },
  });
  useDocumentMeta({
    title: "Prosperya — Solutions",
    description: t("pages.solutions.solutions-page.finance-operations-supply-chain-and-data-solutions-69ed3c", { en: "Finance, operations, supply chain and data solutions.", fr: "Solutions pour la finance, les opérations, la chaîne logistique et les données." }),
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
        title={t("pages.solutions.solutions-page.solutions-built-for-the-way-your-business-c82c90", { en: "Solutions built for the way your business runs", fr: "Des solutions à l’image de votre activité" })}
        lead={
          <p>
            {t("pages.solutions.solutions-page.integrated-systems-intelligent-automation-and-actionable-insight-59c571", { en: "Integrated systems, intelligent automation and actionable insight, connected across every function of your enterprise.", fr: "Des systèmes intégrés, une automatisation intelligente et des analyses exploitables, reliés à chaque fonction de l’entreprise." })}
          </p>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/approach`}>{t("pages.solutions.solutions-page.explore-our-approach-de10c8", { en: "Explore our approach", fr: "Découvrir notre approche" })}</PrimaryLink>
            <PrimaryLink to={`/${locale}/contact`} variant="ghost">
              {t("pages.solutions.solutions-page.talk-to-an-expert-8e5217", { en: "Talk to an expert", fr: "Parler à un expert" })}
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
              {t("pages.solutions.solutions-page.end-to-end-solutions-132f71", { en: "End‑to‑end solutions.", fr: "Des solutions de bout en bout." })}
              <span>{t("pages.solutions.solutions-page.built-around-your-business-outcomes-22e3a4", { en: "Built around your business outcomes.", fr: "Pensées pour vos résultats." })}</span>
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
            <h2>{t("pages.solutions.solutions-page.built-on-a-connected-architecture-that-scales-a0fd13", { en: "Built on a connected architecture that scales with you.", fr: "Une architecture connectée qui grandit avec vous." })}</h2>
            <p>
              {t("pages.solutions.solutions-page.our-enterprise-architecture-connects-people-processes-and-77db9d", { en: "Our enterprise architecture connects people, processes and systems — enabling seamless data flow and smarter decisions across your organization.", fr: "Notre architecture relie les personnes, les processus et les systèmes pour des flux de données fluides et de meilleures décisions." })}
            </p>
          </div>
          <LayeredArchitecture />
        </div>
      </section>
      <SolutionProof solutions={data} studies={studies ?? []} locale={locale} />
      <CTASection
        variant="band"
        title={t("pages.solutions.solutions-page.which-function-should-move-first-74e99d", { en: "Which function should move first?", fr: "Quelle fonction faire évoluer en premier ?" })}
        description={
          t("pages.solutions.solutions-page.we-help-you-pick-the-function-where-15082c", { en: "We help you pick the function where change pays back first.", fr: "Nous vous aidons à choisir la fonction où le changement rapporte le plus vite." })
        }
        secondary={{ path: "expertise", label: t("pages.solutions.solutions-page.explore-our-expertise-245f76", { en: "Explore our expertise", fr: "Nos expertises" }) }}
      />
    </>
  );
}
