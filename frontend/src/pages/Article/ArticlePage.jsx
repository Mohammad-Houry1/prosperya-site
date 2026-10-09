import { websiteApi } from "../../services/websiteApi.js";
import { mapInsight } from "../../repositories/insights.repository.js";
import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import ReadingProgress from "./ReadingProgress.jsx";
import RevealText from "../../motion/components/RevealText.jsx";
import styles from "./ArticlePage.module.css";
import PageContainer from "../../components/common/PageContainer.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Section from "../../components/common/Section.jsx";
import ResponsiveImage from "../../components/common/ResponsiveImage.jsx";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import CoverArt from "../../components/visuals/CoverArt.jsx";
import InsightCard from "../../components/insight/InsightCard.jsx";
import Newsletter from "../../components/insight/Newsletter.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";

export default function ArticlePage() {
  const articleRef = useRef(null);
  const { slug } = useParams();
  const {locale, t } = useLocale();

  const { data: insight = null, isLoading: insightIsLoading, isError: insightIsError, refetch: insightRefetch } = useQuery({
    queryKey: ["insight", locale, slug],
    queryFn: async ({ signal }) => {
      try {
        const response = await websiteApi.article(slug, locale, signal);
        return mapInsight(response.data);
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(slug),
    staleTime: 0,
  });
  const { data: articles = { items: [], meta: {} } } = useQuery({
    queryKey: ["insights", locale, 1, ""],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.articles({ locale, page: 1, per_page: 12 }, signal);
      return { items: response.data.map(mapInsight), meta: response.meta };
    },
    staleTime: 0,
  });
  const { data: categoriesData = [] } = useQuery({
    queryKey: ["insight-categories", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.categories({ locale }, signal);
      return response.data || [];
    },
    staleTime: 0,
  });
  const item = insight;
  const categoryNames = Object.fromEntries((categoriesData ?? []).map((entry) => [entry.id, entry.name]));
  useDocumentMeta({
    model: "Article",
    title: item ? `${item.seo?.title || item.title} — Prosperya` : t("pages.article.article-page.prosperya-insights-56ddec", { en: "Prosperya — Insights", fr: "Prosperya — Analyses" }),
    description: item?.seo?.description || item?.excerpt,
    canonicalPath: item?.seo?.url || undefined,
    ogImage: item?.metaImage?.src || item?.image?.src,
    ogType: item?.seo?.type || "article",
    keywords: item?.seo?.keywords,
  });
  if (insightIsLoading) return <PageLoader />;
  if (insightIsError)
    return (
      <Section>
        <ErrorState onRetry={() => insightRefetch()} />
      </Section>
    );
  if (!item)
    return (
      <Section>
        <EmptyState title={t("pages.article.article-page.insight-not-found-6a3f0b", { en: "Insight not found", fr: "Analyse introuvable" })} />
      </Section>
    );
  const others = (articles?.items ?? []).filter((entry) => entry.id !== item.id).map((entry) => ({ ...entry, category: categoryNames[entry.categoryId] || "" }));
  const related = [
    ...others.filter((entry) => entry.categoryId === item.categoryId),
    ...others.filter((entry) => entry.categoryId !== item.categoryId),
  ].slice(0, 3);
  return (
    <>
      <ReadingProgress articleRef={articleRef} />
      <header className={styles.masthead}>
        <Link to={`/${locale}/insights`} className={styles.back}>
          <ArrowLeft size={15} strokeWidth={1.6} aria-hidden="true" />
          {t("pages.article.article-page.all-insights-3e70ef", { en: "All insights", fr: "Toutes les analyses" })}
        </Link>
        <p className={styles.category}>
          {categoryNames[item.categoryId] || ""}
        </p>
        <RevealText as="h1" onLoad>
          {item.title}
        </RevealText>
        <p className={styles.dek}>
          {item.excerpt}
        </p>
        <p className={styles.meta}>
          {item.publishedAt && <span>
            <CalendarDays size={14} strokeWidth={1.5} aria-hidden="true" />
            <time dateTime={item.publishedAt}>
              {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(item.publishedAt))}
            </time>
          </span>}
          {item.readTime && <span>
            <Clock3 size={14} strokeWidth={1.5} aria-hidden="true" />
            {t("common.reading_time", { en: "{minutes} min read", fr: "{minutes} min de lecture" }, { minutes: item.readTime })}
          </span>}
          <span>{t("pages.article.article-page.by-the-prosperya-team-63c8ff", { en: "By the Prosperya team", fr: "Par l’équipe Prosperya" })}</span>
        </p>
      </header>
      <PageContainer>
        <figure className={styles.cover} data-reveal="image" aria-hidden="true">
          {item.image ? (
            <ResponsiveImage {...item.image} alt="" priority />
          ) : (
            <CoverArt variant="flow" seed={item.id.length * 3} />
          )}
        </figure>
      </PageContainer>
      <article ref={articleRef} className={styles.body}>
        <CmsRichHtml html={item.body} imageAlt={item.title} />
      </article>
      {related.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow={t("pages.article.article-page.keep-reading-6c0c98", { en: "Keep reading", fr: "À lire ensuite" })}
            title={t("pages.article.article-page.related-insights-e79261", { en: "Related insights", fr: "Analyses liées" })}
            align="split"
            action={{ to: `/${locale}/insights`, label: t("pages.article.article-page.all-insights-3e70ef", { en: "All insights", fr: "Toutes les analyses" }) }}
          />
          <div className={styles.related}>
            {related.map((entry, index) => (
              <InsightCard key={entry.id} insight={entry} locale={locale} index={index} />
            ))}
          </div>
        </Section>
      )}
      <Section>
        <Newsletter title={t("pages.article.article-page.get-the-next-article-first-79dae7", { en: "Get the next article first.", fr: "Recevez la prochaine analyse." })} />
      </Section>
    </>
  );
}
