import { stagingContent } from "../../services/stagingContent.js";
import { mapInsight } from "../../repositories/insights.repository.js";
import { useEffect, useState } from "react";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import InsightCard from "../../components/insight/InsightCard.jsx";
import Newsletter from "../../components/insight/Newsletter.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import { dragScroll } from "../../motion/gestures.js";
import styles from "./InsightsPage.module.css";

export default function InsightsPage() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("all");
  const { isLoading, isError, refetch, data: articles = { items: [], meta: {} } } = useQuery({
    queryKey: ["insights", locale, page, category === "all" ? "" : category],
    queryFn: async ({ signal }) => {
      const response = await stagingContent.articles({ locale, page: page, per_page: 12, category: (category === "all" ? "" : category) || undefined }, signal);
      return { items: response.data.map(mapInsight), meta: response.meta };
    },
    staleTime: 0,
  });
  const { isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories, data: categories = [] } = useQuery({
    queryKey: ["insight-categories", locale],
    queryFn: async ({ signal }) => {
      const response = await stagingContent.categories({ locale }, signal);
      return response.data || [];
    },
    staleTime: 0,
  });
  useEffect(() => { setPage(1); setCategory("all"); }, [locale]);
  useDocumentMeta({
    title: `${fr ? "Analyses" : "Insights"} — Prosperya`,
    description: fr
      ? "Perspectives sur la transformation ERP, NetSuite, l’intégration et les opérations financières."
      : "Perspectives on ERP transformation, NetSuite, integration and finance operations.",
  });
  if (isLoading || categoriesLoading) return <PageLoader />;
  if (isError || categoriesError)
    return (
      <Section>
        <ErrorState onRetry={() => { refetch(); refetchCategories(); }} />
      </Section>
    );
  const categoryNames = Object.fromEntries(categories.map((item) => [item.id, item.name]));
  const data = (articles?.items ?? []).map((item) => ({ ...item, category: categoryNames[item.categoryId] || "" }));
  const featured = page === 1 && category === "all" ? data.find((item) => item.featured) : null;
  const list = featured ? data.filter((item) => item.id !== featured.id) : data;
  const lastPage = articles?.meta?.last_page || 1;
  return (
    <>
      <PageHero
        eyebrow={fr ? "Analyses" : "Insights"}
        title={fr ? "Idées et regards venus du terrain." : "Ideas and perspectives from the field."}
        titleClassName={styles.title}
        lead={
          <p>
            {fr
              ? "Des analyses pratiques sur l’ERP, NetSuite et la transformation d’entreprise — nourries par l’expérience, mesurées par l’impact."
              : "Practical insights on ERP, NetSuite and enterprise transformation — shaped by experience, measured by impact."}
          </p>
        }
        layout="stacked"
        className={styles.masthead}
        extra={<span className={styles.rule} data-reveal="line" aria-hidden="true" />}
      />
      <PageContainer>
        {featured && category === "all" && (
          <div className={styles.featured}>
            <Eyebrow>{fr ? "À la une" : "Featured article"}</Eyebrow>
            <InsightCard insight={featured} locale={locale} featured />
          </div>
        )}
        <div ref={dragScroll} className={styles.tabs} role="group" aria-label={fr ? "Filtrer les analyses" : "Filter insights"}>
          {[["all", fr ? "Toutes les analyses" : "All insights"], ...categories.filter((item) => item.slug).map((item) => [item.slug, item.name])].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={category === id} onClick={() => { setCategory(id); setPage(1); }}>
              {label}
            </button>
          ))}
        </div>
        <p className={styles.count} role="status">
          {articles?.meta?.total ?? 0} {fr ? "analyse(s)" : articles?.meta?.total === 1 ? "article" : "articles"}
        </p>
        {list.length ? (
          <div key={category} className={styles.grid}>
            {list.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} locale={locale} index={index} large={index === 0 && list.length > 2} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
        {lastPage > 1 && (
          <nav className={styles.pagination} aria-label={fr ? "Pages des analyses" : "Insight pages"}>
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{fr ? "Précédent" : "Previous"}</button>
            <span>{fr ? "Page" : "Page"} {page} / {lastPage}</span>
            <button type="button" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)}>{fr ? "Suivant" : "Next"}</button>
          </nav>
        )}
      </PageContainer>
      <Section>
        <Newsletter />
      </Section>
    </>
  );
}
