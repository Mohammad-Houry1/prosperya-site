import { websiteApi } from "../services/websiteApi.js";

// Fetch every API page so CMS records are never silently truncated.
export async function loadMarketingList(kind, locale, signal) {
  const rows = [];
  let page = 1;
  let lastPage = 1;
  do {
    const response = await websiteApi[kind]({ locale, page, per_page: 50 }, signal);
    rows.push(...response.data);
    lastPage = response.meta?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage);
  return rows;
}
