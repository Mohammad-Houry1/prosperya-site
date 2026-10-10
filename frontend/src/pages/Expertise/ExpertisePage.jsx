import { websiteApi } from "../../services/websiteApi.js";
import { adaptExpertise } from "../../repositories/marketing.repository.js";
import PageHero from "../../components/common/PageHero.jsx";
import Section from "../../components/common/Section.jsx";
import { Link } from "react-router-dom";
import CmsImage from "../../components/common/CmsImage.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
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
      <Section>
        <ol
          className={styles.rows}
          aria-label={t("nav.expertise")}
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
                {item.tagline && (
                  <p className={styles.tagline}>{item.tagline}</p>
                )}
                {item.summary && (
                  <p className={styles.summary}>{item.summary}</p>
                )}
                {item.capabilities?.length > 0 && (
                  <ul className={styles.capabilities}>
                    {item.capabilities.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>
                )}
                <PrimaryLink
                  to={`/${locale}/expertise/${item.slug}`}
                  variant="text"
                >
                  {t("pages.expertise.capability-story.explore-5be3be")}
                </PrimaryLink>
              </div>
              <CmsImage media={item.image} className={styles.image} sizes="(max-width: 700px) 100vw, 30vw" />
            </li>
          ))}
        </ol>
        <CTASection
          variant="split"
          showSecondButton={false}
          title={t("pages.expertise.expertise-page.not-sure-which-capability-you-need-915e66")}
        />
      </Section>
    </>
  );
}
