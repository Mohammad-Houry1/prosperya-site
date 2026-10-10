import { expertiseData } from "../../data/expertise.data.js";
import { localizeEntity } from "../../repositories/localize.js";
import PageHero from "../../components/common/PageHero.jsx";
import { Link } from "react-router-dom";
import ResponsiveImage from "../../components/common/ResponsiveImage.jsx";
import Section from "../../components/common/Section.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import CapabilityIndex from "./CapabilityIndex.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./ExpertisePage.module.css";
import CTASection from "../../components/common/CTASection.jsx";
export default function ExpertisePage() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const {
    isLoading: capabilitiesIsLoading,
    isError: capabilitiesIsError,
    refetch: capabilitiesRefetch,
    data: capabilities = [],
  } = useQuery({
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
        title={
          fr
            ? "Des expertises qui produisent des résultats."
            : "Capabilities that drive measurable results."
        }
        lead={
          <p>
            {fr
              ? "Nous aidons les entreprises à concevoir, connecter et optimiser leurs systèmes pour simplifier les opérations, réduire la complexité et libérer la performance."
              : "We help enterprises design, connect and optimize their systems to simplify operations, reduce complexity and unlock performance at scale."}
          </p>
        }
        visual={<CapabilityIndex items={items} locale={locale} />}
      />
      <Section>
        <ol
          className={styles.rows}
          aria-label={fr ? "Toutes les expertises" : "All expertise"}
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              className={styles.row}
              data-reveal="card"
              style={{ "--i": index }}
            >
              <span className={styles.number}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.copy}>
                <h2>
                  <Link to={`/${locale}/expertise/${item.slug}`}>
                    {item.detailTitle || item.title}
                  </Link>
                </h2>
                {item.description && (
                  <p className={styles.tagline}>{item.description}</p>
                )}
                {item.summary && (
                  <p className={styles.summary}>{item.summary}</p>
                )}
                {item.services?.length > 0 && (
                  <ul className={styles.capabilities}>
                    {item.services.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>
                )}
                <PrimaryLink
                  to={`/${locale}/expertise/${item.slug}`}
                  variant="text"
                >
                  {fr ? "Explorer cette expertise" : "Explore this expertise"}
                </PrimaryLink>
              </div>
              {item.image?.src && (
                <ResponsiveImage
                  src={item.image.src}
                  alt={item.image.alt || ""}
                  width={item.image.width}
                  height={item.image.height}
                  className={styles.image}
                  sizes="(max-width: 700px) 100vw, 30vw"
                />
              )}
            </li>
          ))}
        </ol>
        <CTASection
          variant="split"
          showSecondButton={false}
          title={
            fr
              ? "Vous hésitez entre plusieurs expertises ?"
              : "Not sure which capability you need?"
          }
        />
      </Section>
    </>
  );
}
