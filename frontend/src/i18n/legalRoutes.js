export const LEGAL_ROUTES = Object.freeze({
  privacy: { en: "privacy-policy", fr: "privacy-policy" },
  terms: { en: "terms-of-use", fr: "terms-of-use" },
  cookies: { en: "cookie-policy", fr: "cookie-policy" },
  accessibility: { en: "accessibility", fr: "accessibility" },
});

export const LEGAL_CMS_SLUGS = Object.freeze({
  privacy: "privacy-policy", terms: "terms-of-use", cookies: "cookie-policy", accessibility: "accessibility",
});

export function corporatePagePath(locale, slug) {
  const legal = Object.values(LEGAL_CMS_SLUGS).includes(slug);
  return `/${locale}/${legal ? slug : `corporate/${encodeURIComponent(slug)}`}`;
}
