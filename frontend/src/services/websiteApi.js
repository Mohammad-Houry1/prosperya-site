import { displayResponse } from '../repositories/cmsContent.js';
export { contentView } from '../repositories/cmsContent.js';

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

async function contentRequest(path, options = {}, resolveRelations = true) {
  const payload = await request(path, options);
  const context = { locale: options.query?.locale || 'en', ...payload.context };
  const kind = path.startsWith('contact/options') ? 'contact/options' : path.split('/')[0];
  return displayResponse(payload, kind, context, (target, ids, current, signal) =>
    contentRequest(target, { query: { locale: current.locale, ids }, signal }, target === 'testimonials'), options.signal, resolveRelations);
}

export const websiteApi = {
  search: (query, signal) => contentRequest('search', { query, signal }),
  expertise: (query, signal) => contentRequest('expertise', { query, signal }),
  expertiseDetail: (slug, locale, signal) => contentRequest(`expertise/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  solutions: (query, signal) => contentRequest('solutions', { query, signal }),
  solution: (slug, locale, signal) => contentRequest(`solutions/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  caseStudies: (query, signal) => contentRequest('case-studies', { query, signal }),
  caseStudy: (slug, locale, signal) => contentRequest(`case-studies/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  approach: (slug, locale, signal) => contentRequest(`approaches/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  page: (slug, locale, signal) => contentRequest(`pages/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  articles: (query, signal) => contentRequest("articles", { query, signal }),
  article: (slug, locale, signal) => contentRequest(`articles/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  categories: (query, signal) => contentRequest("article-categories", { query, signal }),
  testimonials: (query, signal) => contentRequest("testimonials", { query, signal }),
  platforms: (query, signal) => contentRequest("platforms", { query, signal }),
  users: (query, signal) => contentRequest("users", { query, signal }),
  user: (slug, locale, signal) => contentRequest(`users/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  faqs: (query, signal) => contentRequest("faqs", { query, signal }),
  faqCategories: (query, signal) => contentRequest("faq-categories", { query, signal }),
  corporatePages: (query, signal) => contentRequest("corporate-pages", { query, signal }),
  corporateCategories: (query, signal) => contentRequest("corporate-page-categories", { query, signal }),
  corporatePage: (slug, locale, signal) => contentRequest(`corporate-pages/${encodeURIComponent(slug)}`, { query: { locale }, signal }),
  contactOptions: (locale, signal) => contentRequest("contact/options", { query: { locale }, signal }),
  labels: (query, signal) => contentRequest("labels", { query, signal }),
  contact: (data) => request("contact", { data }),
  newsletter: (data) => request("newsletter", { data }),
  seo: (path, signal, model = "SeoPage") => request("seo", { query: { path, model }, signal }),
};
