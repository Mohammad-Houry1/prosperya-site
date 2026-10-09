import { websiteApi } from "../services/websiteApi.js";
import { loadContentPages } from "../services/loadContentPages.js";

export async function getPlatforms(locale, signal) {
  const platforms = await loadContentPages(websiteApi.platforms, { locale }, signal);
  return platforms.map((platform) => ({ ...platform, cmsId: platform.id, id: platform.slug || platform.id, category: "" }));
}
