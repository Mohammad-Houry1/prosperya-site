import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { loadMarketingList } from "../../repositories/marketingListings.js";
import { websiteApi } from "../../services/websiteApi.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import PageHero from "../../components/common/PageHero.jsx";
import Section from "../../components/common/Section.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import Testimonials from "../../components/company/Testimonials.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./WorkPage.module.css";
import WorkDeck from "./WorkDeck.jsx";

export default function WorkPage() {
  const { locale, t } = useLocale();
  const [industry, setIndustry] = useState("");
  const [capability, setCapability] = useState("");
  const work = useQuery({ queryKey: ["work-listing", locale], queryFn: ({ signal }) => loadMarketingList("caseStudies", locale, signal) });
  const expertise = useQuery({ queryKey: ["expertise-listing", locale], queryFn: ({ signal }) => loadMarketingList("expertise", locale, signal) });
  const stories = useQuery({ queryKey: ["company-stories", locale], queryFn: async ({ signal }) => (await websiteApi.testimonials({ locale }, signal)).data });
  useDocumentMeta({ title: t("pages.work.work-page.work-prosperya-bb3774", { en: "Work — Prosperya", fr: "Projets — Prosperya" }) });
  const rows = work.data ?? [];
  const industries = [...new Set(rows.map((row) => row.industry).filter(Boolean))];
  const capabilities = (expertise.data ?? []).filter((item) => rows.some((row) => row.expertise_ids?.includes(item.id)));
  const selectedIndustry = industries.includes(industry) ? industry : "";
  const selectedCapability = capabilities.some((item) => item.id === capability) ? capability : "";
  const filtered = rows.filter((row) => (!selectedIndustry || row.industry === selectedIndustry)
    && (!selectedCapability || row.expertise_ids?.includes(selectedCapability)));
  return <>
    <PageHero visual={rows.length ? <WorkDeck studies={rows} locale={locale} /> : undefined} eyebrow={t("pages.work.work-page.work-2af496", { en: "Work", fr: "Projets" })}
      title={t("pages.work.work-page.transformation-stories-that-prove-the-impact-f01aa8", { en: "Transformation stories that prove the impact", fr: "Des transformations qui prouvent l’impact" })}
      lead={<p>{t("pages.work.work-page.real-challenges-explicit-decisions-measured-outcomes-see-b93c0c", { en: "Real challenges, explicit decisions, measured outcomes. See how an architecture takes shape — illustrative engagements that show how we work.", fr: "Des défis réels, des décisions explicites, des résultats mesurés. Découvrez comment une architecture prend forme — des exemples illustratifs de notre façon de travailler." })}</p>} />
    <PageContainer>
      {work.isLoading ? <PageLoader /> : work.isError ? <ErrorState onRetry={work.refetch} /> : <>
        {rows.length > 0 && <div className={styles.filters}>
          {industries.length > 0 && <label>{t("pages.work.work-page.filter-by-industry-3fbb2d", { en: "Filter by industry", fr: "Filtrer par secteur" })}
            <select value={selectedIndustry} onChange={(event) => setIndustry(event.target.value)}>
              <option value="">{t("pages.work.work-page.all-industries-42b72e", { en: "All industries", fr: "Tous les secteurs" })}</option>
              {industries.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>}
          {capabilities.length > 0 && <label>{t("pages.work.work-page.filter-by-capability-9f728f", { en: "Filter by capability", fr: "Filtrer par expertise" })}
            <select value={selectedCapability} onChange={(event) => setCapability(event.target.value)}>
              <option value="">{t("pages.work.work-page.all-capabilities-3d897f", { en: "All capabilities", fr: "Toutes les expertises" })}</option>
              {capabilities.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>}
          <span role="status" className={styles.count}>{t(filtered.length === 1 ? "work.count_one" : "work.count_many", { en: filtered.length === 1 ? "{count} engagement" : "{count} engagements", fr: filtered.length === 1 ? "{count} projet" : "{count} projets" }, { count: filtered.length })}</span>
        </div>}
        {filtered.length ? <div className={styles.grid}>{filtered.map((row) => <article key={row.id} className={styles.project}>
          {row.image?.url && <Link to={`/${locale}/work/${row.slug}`} className={styles.imageLink} aria-label={row.title}>
            <img src={row.image.url} alt={row.image.alt || ""} loading="lazy" />
          </Link>}
          {(row.industry || row.client) && <p className={styles.meta}>{[row.industry, row.client].filter(Boolean).join(" · ")}</p>}
          <h2><Link to={`/${locale}/work/${row.slug}`}>{row.title}</Link></h2>
          {row.summary && <CmsRichHtml html={row.summary} className={styles.summary} />}
          <Link to={`/${locale}/work/${row.slug}`} className={styles.link}>{t("components.case-study.project-feature.view-case-study-2050cc", { en: "View case study", fr: "Voir le cas client" })}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </article>)}</div> : <EmptyState />}
      </>}
    </PageContainer>
    {!stories.isLoading && !stories.isError && stories.data?.length > 0 && <Testimonials data={stories.data} variant="rail" />}
    <Section><div className={styles.close}>
      <h2>{t("pages.work.work-page.facing-a-similar-challenge-bc32be", { en: "Facing a similar challenge?", fr: "Un défi comparable ?" })}</h2>
      <PrimaryLink to={`/${locale}/contact`} variant="text">{t("nav.contact")}</PrimaryLink>
    </div></Section>
  </>;
}
