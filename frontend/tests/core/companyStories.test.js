import test from "node:test";
import assert from "node:assert/strict";
import { websiteApi } from "../../src/services/websiteApi.js";
import {
  getCompanyStories,
  getFrequentlyAskedQuestions,
} from "../../src/repositories/companyStories.repository.js";
test("CMS endorsements preserve approved localized content", async (t) => {
  t.mock.method(websiteApi, "testimonials", async ({ locale }) => ({ data: [{ id: "1", company: "Example", quote: locale === "fr" ? "Avis" : "Review" }], meta: { last_page: 1 } }));
  const en = await getCompanyStories("en");
  const fr = await getCompanyStories("fr");
  assert.equal(en.isDemo, false);
  assert.equal(fr.isDemo, false);
  assert.equal(en.clients.length, 1);
  assert.equal(fr.testimonials.length, 1);
  assert.notEqual(en.testimonials[0].quote, fr.testimonials[0].quote);
});
test("FAQ topic selection is delegated to the CMS category filter", async (t) => {
  t.mock.method(websiteApi, "faqs", async ({ category }) => ({ data: category === "contact" ? [{ id: "1", answer: "Réponse" }] : [], meta: { last_page: 1 } }));
  const questions = await getFrequentlyAskedQuestions("fr", "contact");
  assert.ok(questions.length > 0);
  assert.ok(
    questions.every(
      (item) =>
        typeof item.answer === "string",
    ),
  );
  assert.deepEqual(await getFrequentlyAskedQuestions("en", "missing"), []);
});
