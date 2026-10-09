import { Navigate, useLocation } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useLegalDocument } from "../../queries/useLegalDocument.js";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import LegalPageLayout from "../../components/legal/LegalPageLayout.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import Section from "../../components/common/Section.jsx";

export default function LegalPage({ documentId }) {
  const { locale } = useLocale();
  const { pathname } = useLocation();
  const query = useLegalDocument(locale, documentId);
  const document = query.data;
  useDocumentMeta({
    title: document ? `${document.seo?.title || document.title} — Prosperya` : "Prosperya",
    description: document?.seo?.description,
    keywords: document?.seo?.keywords,
    ogImage: document?.metaImage || undefined,
    ogType: document?.seo?.type || "website",
    canonicalPath: document?.seo?.url || document?.path,
    robots: "index, follow",
  });
  if (query.isPending) return <PageLoader />;
  if (query.isError || !document)
    return (
      <Section>
        <ErrorState onRetry={() => query.refetch()} />
      </Section>
    );
  if (pathname !== document.path)
    return <Navigate to={document.path} replace />;
  return <LegalPageLayout {...document} />;
}
