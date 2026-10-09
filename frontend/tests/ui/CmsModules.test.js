import { afterEach, expect, test, vi } from "vitest";
import { websiteApi } from "../../src/services/websiteApi.js";
import { getCompanyStories, getFrequentlyAskedQuestions } from "../../src/repositories/companyStories.repository.js";
import { getPlatforms } from "../../src/repositories/platforms.repository.js";

afterEach(() => vi.restoreAllMocks());

test("loads approved testimonials and derives client names without demo data", async () => {
  vi.spyOn(websiteApi, "testimonials").mockResolvedValue({ data: [{ id: "t", quote: "Approved", name: "Jad", company: "Example" }], meta: { last_page: 1 } });
  const result = await getCompanyStories("fr");
  expect(result.isDemo).toBe(false);
  expect(result.testimonials[0].quote).toBe("Approved");
  expect(result.clients).toEqual([{ id: "Example", name: "Example" }]);
});

test("loads all platform pages and routes FAQ topics to CMS categories", async () => {
  vi.spyOn(websiteApi, "platforms")
    .mockResolvedValueOnce({ data: [{ id: "p1", name: "One", slug: "one" }], meta: { last_page: 2 } })
    .mockResolvedValueOnce({ data: [{ id: "p2", name: "Two", slug: "two" }], meta: { last_page: 2 } });
  vi.spyOn(websiteApi, "faqs").mockResolvedValue({ data: [{ id: "f", question: "How?", answer: "Answer" }], meta: { last_page: 1 } });
  expect(await getPlatforms("en")).toHaveLength(2);
  expect(await getFrequentlyAskedQuestions("fr", "contact")).toEqual([{ id: "f", question: "How?", answer: "Answer" }]);
  expect(websiteApi.faqs).toHaveBeenCalledWith(expect.objectContaining({ locale: "fr", category: "contact" }), undefined);
});
