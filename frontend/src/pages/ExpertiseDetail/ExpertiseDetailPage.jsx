import { websiteApi } from "../../services/websiteApi.js";
import { adaptExpertise } from "../../repositories/marketing.repository.js";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  const { data: page = null, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["expertise-page", locale, slug],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.expertiseDetail(slug, locale, signal);
      return response.data ? adaptExpertise(response.data) : null;
    },
    enabled: Boolean(slug),
    retry: (count, error) => error?.status !== 404 && error?.status !== 403 && count < 2,
  });
  const { data: capabilities = [] } = useQuery({ queryKey: ["capabilities", locale], queryFn: async ({ signal }) => {
    const response = await websiteApi.expertise({ locale }, signal);
    return (response.data || []).map(adaptExpertise);
  } });
  useDocumentMeta({ model: "Expertise", title: page ? `${page.detailTitle} — Prosperya` : "Prosperya — Expertise", description: page?.summary || page?.description });
  if (isLoading) return <PageLoader />;
  if (isError && error?.status === 404) return <Section><EmptyState title={t("pages.expertise-detail.expertise-detail-page.expertise-not-found-6043fe")} /></Section>;
  if (isError) return <Section><ErrorState onRetry={refetch} /></Section>;
  if (!page) return <Section><EmptyState title={t("pages.expertise-detail.expertise-detail-page.expertise-not-found-6043fe")} /></Section>;
  const related = capabilities
    .filter((item) => item.slug !== slug)
    .map((item) => ({ id: item.id, slug: item.slug, title: item.detailTitle || item.title }));
  return <ExpertisePageContent page={{ ...page, title: page.detailTitle }} related={related} locale={locale} />;
}
