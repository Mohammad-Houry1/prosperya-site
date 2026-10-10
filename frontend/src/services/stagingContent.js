import { stagingPlatforms, stagingTestimonials, stagingFaqs, stagingArticles, stagingLegalPages } from "../data/staging.data.js";

export class StagingContentError extends Error {
  constructor(message, status) { super(message); this.name = "StagingContentError"; this.status = status; }
}

const result = (data) => Promise.resolve({ data, meta: { current_page: 1, last_page: 1, total: Array.isArray(data) ? data.length : 0 } });
function find(rows, slug) {
  const row = rows.find((item) => item.slug === slug);
  return row ? result(row) : Promise.reject(new StagingContentError("Page not found.", 404));
}

export const stagingContent = {
  labels: () => result({}),
  platforms: () => result(stagingPlatforms),
  testimonials: ({ locale }) => result(stagingTestimonials(locale)),
  faqs: ({ locale }) => result(stagingFaqs(locale)),
  articles: ({ locale }) => result(stagingArticles(locale)),
  article: (slug, locale) => find(stagingArticles(locale), slug),
  categories: ({ locale }) => result([{ id: "expertise", name: locale === "fr" ? "Expertise" : "Expertise", slug: "expertise" }]),
  corporatePages: ({ locale }) => result(stagingLegalPages(locale)),
  corporatePage: (slug, locale) => find(stagingLegalPages(locale), slug),
  contactOptions: () => result({ project_types: [{ id: "erp", name: "ERP" }, { id: "integration", name: "Integration" }], project_stages: [{ id: "planning", name: "Planning" }], countries: [] }),
  contact: () => Promise.reject(new StagingContentError("Submissions are disabled in the staging reference.", 403)),
  newsletter: () => Promise.reject(new StagingContentError("Submissions are disabled in the staging reference.", 403)),
};
