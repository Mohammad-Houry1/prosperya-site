import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { loadMarketingList } from "../../repositories/marketingListings.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import PageHero from "../../components/common/PageHero.jsx";
import Section from "../../components/common/Section.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import styles from "./ExpertisePage.module.css";

export default function ExpertisePage() {
  const { locale, t } = useLocale();
  const query = useQuery({ queryKey: ["expertise-listing", locale],
    queryFn: ({ signal }) => loadMarketingList("expertise", locale, signal) });
  useDocumentMeta({ title: t("nav.expertise") + " — Prosperya" });
  return <>
    <PageHero layout="stacked" eyebrow={t("nav.expertise")}
      title={t("pages.expertise.expertise-page.capabilities-that-drive-measurable-results-ad246d", { en: "Capabilities that drive measurable results.", fr: "Des expertises qui produisent des résultats." })}
      lead={<p>{t("pages.expertise.expertise-page.we-help-enterprises-design-connect-and-optimize-2b00c4", { en: "We help enterprises design, connect and optimize their systems to simplify operations, reduce complexity and unlock performance at scale.", fr: "Nous aidons les entreprises à concevoir, connecter et optimiser leurs systèmes pour simplifier les opérations, réduire la complexité et libérer la performance." })}</p>} />
    <PageContainer>
      {query.isLoading ? <PageLoader /> : query.isError ? <ErrorState onRetry={query.refetch} /> :
        query.data?.length ? <ol className={styles.list}>{query.data.map((item, index) => <li key={item.id} className={styles.row}>
          <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <div className={styles.body}>
            {item.tagline && <p className={styles.tagline}>{item.tagline}</p>}
            <h2><Link to={`/${locale}/expertise/${item.slug}`}>{item.title}</Link></h2>
            {item.summary && <CmsRichHtml html={item.summary} className={styles.summary} />}
            <Link className={styles.link} to={`/${locale}/expertise/${item.slug}`}>{t("pages.expertise.capability-story.explore-5be3be", { en: "Explore", fr: "Explorer" })}<span className="visuallyHidden"> {item.title}</span><ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          {(item.image?.url || item.capabilities?.length > 0) && <div className={styles.aside}>
            {item.image?.url && <Link className={styles.imageLink} to={`/${locale}/expertise/${item.slug}`} aria-label={item.title}>
              <img src={item.image.url} alt={item.image.alt || ""} loading="lazy" />
            </Link>}
            {item.capabilities?.length > 0 && <ul className={styles.capabilities}>{item.capabilities.map((text, position) => <li key={position}>{text}</li>)}</ul>}
          </div>}
        </li>)}</ol> : <EmptyState />}
    </PageContainer>
    <Section><div className={styles.close}>
      <h2>{t("pages.expertise.expertise-page.not-sure-which-capability-you-need-915e66", { en: "Not sure which capability you need?", fr: "Vous hésitez entre plusieurs expertises ?" })}</h2>
      <PrimaryLink to={`/${locale}/contact`} variant="text">{t("pages.expertise.expertise-page.talk-to-an-expert-8e5217", { en: "Talk to an expert", fr: "Parler à un expert" })}</PrimaryLink>
    </div></Section>
  </>;
}
