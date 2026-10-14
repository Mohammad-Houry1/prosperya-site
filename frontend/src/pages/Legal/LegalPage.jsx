import { websiteApi, contentView } from "../../services/websiteApi.js";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useQuery } from "@tanstack/react-query";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import LegalPageLayout from "../../components/legal/LegalPageLayout.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import Section from "../../components/common/Section.jsx";
import { LEGAL_CMS_SLUGS, corporatePagePath } from "../../i18n/legalRoutes.js";

export default function LegalPage({ documentId }) {
  const { locale, t } = useLocale();
  const { pathname } = useLocation();
  const { slug } = useParams();
  const documentSlug = documentId ? LEGAL_CMS_SLUGS[documentId] : slug;
  const { data: document = null, isPending, isError, refetch } = useQuery({
    queryKey: ["corporate-page", locale, documentSlug],
    queryFn: async ({ signal }) => {
      try {
        return contentView(await websiteApi.corporatePage(documentSlug, locale, signal));
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    },
    // Share the raw CMS cache with About; this route's presentation stays local.
    select: page => page ? ({
      id: page.id || documentSlug,
      title: page.title || page.name,
      intro: page.description,
      sections: (page.sections || []).map((section, index) => ({
        id: "section-" + (index + 1), title: section.title, body: section.description,
      })),
      lastUpdated: page.updated_at,
      seo: page.seo,
      metaImage: page.meta_image?.url || null,
      path: corporatePagePath(locale, page.slug || documentSlug),
    }) : null,
    enabled: Boolean(documentSlug),
    staleTime: 0,
  });
  useDocumentMeta({
    model: "CorporatePage",
    title: document ? `${document.seo?.title || document.title} — ${t("site.name")}` : t("site.name"),
    description: document?.seo?.description,
    keywords: document?.seo?.keywords,
    ogImage: document?.metaImage || undefined,
    ogType: document?.seo?.type || "website",
    canonicalPath: document?.seo?.url || document?.path,
    robots: "index, follow",
  });
  if (isPending) return <PageLoader />;
  if (isError || !document)
    return (
      <Section>
        <ErrorState onRetry={() => refetch()} />
      </Section>
    );
  if (pathname !== document.path)
    return <Navigate to={document.path} replace />;
  return <LegalPageLayout {...document} />;
}
