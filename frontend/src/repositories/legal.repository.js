import { normalizeLocale } from "../i18n/locale.js";
import { LEGAL_ROUTES } from "../i18n/legalRoutes.js";
import { websiteApi } from "../services/websiteApi.js";

export async function getLegalDocument(locale, id, signal) {
  const language = normalizeLocale(locale);
  const routes = LEGAL_ROUTES[id];
  if (!routes) return null;
  try {
    const { data: page } = await websiteApi.corporatePage(routes.en, language, signal);
    return {
      id,
      title: page.title,
      intro: page.description,
      sections: (page.sections || []).map((section, index) => ({
        id: `section-${index + 1}`,
        title: section.title,
        body: section.description,
      })),
      lastUpdated: page.updated_at,
      seo: page.seo,
      metaImage: page.meta_image?.url || null,
      path: `/${language}/${routes[language]}`,
    };
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
