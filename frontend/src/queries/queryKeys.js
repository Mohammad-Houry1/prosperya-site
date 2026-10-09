export const queryKeys = {
  capabilities: (locale) => ["capabilities", locale],
  capability: (locale, slug) => ["capability", locale, slug],
  solutions: (locale) => ["solutions", locale],
  solution: (locale, slug) => ["solution", locale, slug],
  caseStudies: (locale) => ["case-studies", locale],
  caseStudy: (locale, slug) => ["case-study", locale, slug],
  platforms: (locale) => ["platforms", locale],
  insights: (locale, page, categoryId) => ["insights", locale, page, categoryId],
  insight: (locale, slug) => ["insight", locale, slug],
  insightCategories: (locale) => ["insight-categories", locale],
  process: (locale) => ["process", locale],
  leadership: (locale) => ["leadership", locale],
};
