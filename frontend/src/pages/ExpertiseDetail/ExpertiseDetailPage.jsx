import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { websiteApi } from "../../services/websiteApi.js";
import { loadMarketingList } from "../../repositories/marketingListings.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import Section from "../../components/common/Section.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ExpertisePageContent from "./ExpertisePageContent.jsx";

export default function ExpertiseDetailPage() {
  const { slug } = useParams();
  const {locale, t } = useLocale();
  const { data: page = null, isLoading, isError, refetch } = useQuery({
    queryKey: ["expertise-page", locale, slug],
    queryFn: async ({ signal }) => {
      try { return (await websiteApi.expertiseDetail(slug, locale, signal)).data; }
      catch (error) { if (error.status === 404) return null; throw error; }
    },
    enabled: Boolean(slug),
  });
  const relatedQuery = useQuery({ queryKey: ["expertise-listing", locale], queryFn: ({ signal }) => loadMarketingList("expertise", locale, signal) });
  useDocumentMeta({ title: page ? `${page.title} — Prosperya` : "Prosperya — Expertise", model: "Expertise" });
  if (isLoading) return <PageLoader />;
  if (isError) return <Section><ErrorState onRetry={refetch} /></Section>;
  if (!page) return <Section><EmptyState title={t("pages.expertise-detail.expertise-detail-page.expertise-not-found-6043fe", { en: "Expertise not found", fr: "Expertise introuvable" })} /></Section>;
  const related = (relatedQuery.data ?? [])
    .filter((item) => item.slug !== slug)
    .map((item) => ({ id: item.id, slug: item.slug, title: item.title }));
  return <ExpertisePageContent page={page} related={related} locale={locale} />;
}
