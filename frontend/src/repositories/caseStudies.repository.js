import { caseStudiesData } from "../data/caseStudies.data.js";
import { caseStudyDetailsData, industries } from "../data/caseStudyDetails.data.js";
import { bySlug, localizeEntity } from "./localize.js";

// List items carry their industry (for filtering); detail pages also get `detail`.
export async function getCaseStudies(locale) {
  return localizeEntity(caseStudiesData, locale).map((study) => {
    const industry = caseStudyDetailsData[study.id]?.industry;
    return industry
      ? { ...study, industry, industryName: industries[industry][locale] ?? industries[industry].en }
      : study;
  });
}

export async function getCaseStudyBySlug(locale, slug) {
  const studies = await getCaseStudies(locale);
  const study = bySlug(studies, slug);
  if (!study) return null;
  const detail = caseStudyDetailsData[study.id];
  const next = studies[(studies.indexOf(study) + 1) % studies.length];
  return {
    ...study,
    detail: detail ? localizeEntity(detail, locale) : null,
    next: next === study ? null : next,
  };
}
