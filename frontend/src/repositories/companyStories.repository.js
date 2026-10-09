import { websiteApi } from "../services/websiteApi.js";
import { loadContentPages } from "../services/loadContentPages.js";

export async function getCompanyStories(locale, signal) {
  const testimonials = await loadContentPages(websiteApi.testimonials, { locale }, signal);
  const companies = [...new Set(testimonials.map((item) => item.company).filter(Boolean))];
  return {
    isDemo: false,
    clients: companies.map((name) => ({ id: name, name })),
    testimonials,
  };
}
export async function getFrequentlyAskedQuestions(locale, topic, signal) {
  return loadContentPages(websiteApi.faqs, { locale, category: topic && topic !== "general" ? topic : undefined }, signal);
}
