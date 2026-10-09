import { afterEach, expect, test, vi } from "vitest";
import { getInsightBySlug, getInsightCategories, getInsights } from "../../src/repositories/insights.repository.js";
import { getLegalDocument } from "../../src/repositories/legal.repository.js";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";

afterEach(() => vi.restoreAllMocks());

test("fetches a server-filtered insight page and keeps its pagination", async () => {
  const articles = vi.spyOn(websiteApi, "articles").mockResolvedValue({
    data: [{ id: "1", slug: "published", title: "Published", excerpt: "Text", category_id: "c1", published_at: "2026-10-01" }],
    meta: { page: 2, last_page: 3, total: 25 },
  });
  const result = await getInsights("fr", { page: 2, categoryId: "c1" });
  expect(articles).toHaveBeenCalledWith({ locale: "fr", page: 2, per_page: 12, category_id: "c1" }, undefined);
  expect(result.items[0].slug).toBe("published");
  expect(result.meta.total).toBe(25);
});

test("loads all category pages and treats a missing article as absent", async () => {
  vi.spyOn(websiteApi, "categories")
    .mockResolvedValueOnce({ data: [{ id: "1", name: "ERP" }], meta: { last_page: 2 } })
    .mockResolvedValueOnce({ data: [{ id: "2", name: "Finance" }], meta: { last_page: 2 } });
  vi.spyOn(websiteApi, "article").mockRejectedValue(new WebsiteApiError("Missing", 404));
  expect(await getInsightCategories("en")).toHaveLength(2);
  expect(await getInsightBySlug("en", "missing")).toBeNull();
});

test("maps CMS corporate page sections into the legal layout", async () => {
  const page = vi.spyOn(websiteApi, "corporatePage").mockResolvedValue({ data: {
    title: "Privacy", description: "<p>Intro</p>", updated_at: "2026-10-01",
    sections: [{ title: "Use", description: "<p>How data is used</p>" }],
    seo: { title: "Privacy policy" },
  } });
  const result = await getLegalDocument("fr", "privacy");
  expect(page).toHaveBeenCalledWith("privacy-policy", "fr", undefined);
  expect(result.path).toBe("/fr/politique-de-confidentialite");
  expect(result.sections[0]).toEqual({ id: "section-1", title: "Use", body: "<p>How data is used</p>" });
});
