import { stagingContent } from "../../services/stagingContent.js";
import { caseStudiesData } from "../../data/caseStudies.data.js";
import { caseStudyDetailsData, industries } from "../../data/caseStudyDetails.data.js";
import { localizeEntity } from "../../repositories/localize.js";
import { useParams } from "react-router-dom";
import Section from "../../components/common/Section.jsx";
import CaseStudyContent from "./CaseStudyContent.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";

export default function CaseStudyPage() {
  const { slug } = useParams();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { data: study = null, isLoading: studyIsLoading, isError: studyIsError, refetch: studyRefetch } = useQuery({
    queryKey: ["case-study", locale, slug],
    queryFn: async () => {
      const studies = localizeEntity(caseStudiesData, locale).map((study) => {
        const industry = caseStudyDetailsData[study.id]?.industry;
        return industry
          ? { ...study, industry, industryName: industries[industry][locale] ?? industries[industry].en }
          : study;
      });
      const index = studies.findIndex((study) => study.slug === slug);
      if (index === -1) return null;
      const study = studies[index];
      const detail = caseStudyDetailsData[study.id];
      return {
        ...study,
        detail: detail ? localizeEntity(detail, locale) : null,
        next: studies.length > 1 ? studies[(index + 1) % studies.length] : null,
      };
    },
    enabled: Boolean(slug),
  });
  const { data: platformRows = [] } = useQuery({
    queryKey: ["platforms", locale],
    queryFn: async ({ signal }) => {
      const response = await stagingContent.platforms({ locale }, signal);
      return response.data || [];
    },
  });
  const item = study;
  useDocumentMeta({
    title: item ? `${item.name} — Prosperya` : fr ? "Prosperya — Projets" : "Prosperya — Work",
    description: item?.detail?.intro ?? item?.description,
  });
  if (studyIsLoading) return <PageLoader />;
  if (studyIsError)
    return (
      <Section>
        <ErrorState onRetry={() => studyRefetch()} />
      </Section>
    );
  if (!item)
    return (
      <Section>
        <EmptyState title={fr ? "Cas introuvable" : "Case study not found"} />
      </Section>
    );
  const platforms = (item.platformIds || []).map(id => platformRows.find(platform => (platform.slug || platform.id) === id)).filter(Boolean);
  return <CaseStudyContent study={item} platforms={platforms} locale={locale} />;
}
