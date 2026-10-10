export class WebsiteApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message);
    this.name = "WebsiteApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { query = {}, data, signal } = {}) {
  const base = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(`${key}[]`, String(item)));
    } else if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const response = await fetch(`${base}/api/${path}${params.size ? `?${params}` : ""}`, {
    method: data === undefined ? "GET" : "POST",
    headers: { Accept: "application/json", ...(data === undefined ? {} : { "Content-Type": "application/json" }) },
    credentials: "omit", cache: "no-store", signal,
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const payload = await response.json().catch((error) => {
    if (error?.name === "AbortError") throw error;
    return null;
  });
  if (!response.ok) throw new WebsiteApiError(payload?.message || `API request failed (${response.status}).`, response.status, payload?.errors || {});
  if (!payload || !Object.hasOwn(payload, "data")) throw new WebsiteApiError("The CMS returned an invalid response.", response.status);
  return payload;
}

export const websiteApi = {
  caseStudies: (query, signal) => request("case-studies", { query, signal }),
  expertise: (query, signal) => request("expertise", { query, signal }),
  articles: (query, signal) => request("articles", { query, signal }),
  article: (slug, locale, signal) => request(`articles/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  categories: (query, signal) => request("article-categories", { query, signal }),
  testimonials: (query, signal) => request("testimonials", { query, signal }),
  platforms: (query, signal) => request("platforms", { query, signal }),
  page: (slug, locale, signal) => request(`pages/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  users: (query, signal) => request("users", { query, signal }),
  user: (slug, locale, signal) => request(`users/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  faqs: (query, signal) => request("faqs", { query, signal }),
  faqCategories: (query, signal) => request("faq-categories", { query, signal }),
  corporatePages: (query, signal) => request("corporate-pages", { query, signal }),
  corporateCategories: (query, signal) => request("corporate-page-categories", { query, signal }),
  corporatePage: (slug, locale, signal) => request(`corporate-pages/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  contactOptions: (locale, signal) => request("contact/options", { query: { locale }, signal }),
  labels: (query, signal) => request("labels", { query, signal }),
  contact: (data) => request("contact", { data }),
  newsletter: (data) => request("newsletter", { data }),
  seo: (path, signal, model = "SeoPage") => request("seo", { query: { path, model }, signal }),
};
