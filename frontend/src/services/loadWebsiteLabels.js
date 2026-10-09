import { websiteApi } from "./websiteApi.js";

export async function loadWebsiteLabels(locale, signal) {
  const labels = {};
  for (let page = 1; page <= 10000; page += 1) {
    const response = await websiteApi.labels({ locale, page, per_page: 500 }, signal);
    Object.assign(labels, response.data);
    const lastPage = response.meta?.last_page;
    if (!Number.isInteger(lastPage) || lastPage < 1) throw new Error("The CMS returned invalid label pagination.");
    if (page >= lastPage) return labels;
  }
  throw new Error("Too many CMS label pages.");
}
