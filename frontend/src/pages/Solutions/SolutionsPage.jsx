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
  const { locale } = useLocale();
  const fr = locale === "fr";
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
    description: fr
      ? "Solutions pour la finance, les opérations, la chaîne logistique et les données."
      : "Finance, operations, supply chain and data solutions.",
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
        eyebrow="Solutions"
        title={fr ? "Des solutions à l’image de votre activité" : "Solutions built for the way your business runs"}
        lead={
          <p>
            {fr
              ? "Des systèmes intégrés, une automatisation intelligente et des analyses exploitables, reliés à chaque fonction de l’entreprise."
              : "Integrated systems, intelligent automation and actionable insight, connected across every function of your enterprise."}
          </p>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/approach`}>{fr ? "Découvrir notre approche" : "Explore our approach"}</PrimaryLink>
            <PrimaryLink to={`/${locale}/contact`} variant="ghost">
              {fr ? "Parler à un expert" : "Talk to an expert"}
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
              {fr ? "Des solutions de bout en bout." : "End‑to‑end solutions."}
              <span>{fr ? "Pensées pour vos résultats." : "Built around your business outcomes."}</span>
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
            <h2>{fr ? "Une architecture connectée qui grandit avec vous." : "Built on a connected architecture that scales with you."}</h2>
            <p>
              {fr
                ? "Notre architecture relie les personnes, les processus et les systèmes pour des flux de données fluides et de meilleures décisions."
                : "Our enterprise architecture connects people, processes and systems — enabling seamless data flow and smarter decisions across your organization."}
            </p>
          </div>
          <LayeredArchitecture />
        </div>
      </section>
      <SolutionProof solutions={data} studies={studies ?? []} locale={locale} />
      <CTASection
        variant="band"
        title={fr ? "Quelle fonction faire évoluer en premier ?" : "Which function should move first?"}
        description={
          fr
            ? "Nous vous aidons à choisir la fonction où le changement rapporte le plus vite."
            : "We help you pick the function where change pays back first."
        }
        secondary={{ path: "expertise", label: fr ? "Nos expertises" : "Explore our expertise" }}
      />
    </>
  );
}
