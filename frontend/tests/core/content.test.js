import test from "node:test";
import assert from "node:assert/strict";
import { expertiseData } from "../../src/data/expertise.data.js";
import { caseStudiesData } from "../../src/data/caseStudies.data.js";
import { localizeEntity } from "../../src/repositories/localize.js";
import { mapInsight } from "../../src/repositories/insights.repository.js";

test("localization preserves capability fields and uses the selected language", () => {
  const capabilities = localizeEntity(expertiseData, "fr");
  assert.equal(capabilities.length, 6);
  assert.equal(capabilities[0].title, "Transformer");
  assert.equal(typeof capabilities[0].description, "string");
  assert.equal("copy" in capabilities[0], false);
});

test("localized case studies preserve metrics and platform relationships", () => {
  const studies = localizeEntity(caseStudiesData, "en");
  assert.ok(studies.length >= 3);
  assert.ok(studies[0].metrics.length >= 2);
  assert.ok(Array.isArray(studies[0].platformIds));
  assert.equal("copy" in studies[0], false);
});

test("CMS article fields map to the insight card model", () => {
  const insight = mapInsight({ id: "article-1", slug: "erp", title: "ERP", excerpt: "Intro", body: "<p>Body</p>", category_id: "cat-1", cover_image: { url: "https://example.com/cover.jpg", alt: "Cover" } });
  assert.equal(insight.categoryId, "cat-1");
  assert.equal(insight.image.src, "https://example.com/cover.jpg");
  assert.equal(insight.body, "<p>Body</p>");
});
