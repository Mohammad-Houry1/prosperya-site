import test from "node:test";
import assert from "node:assert/strict";
import {
  getCapabilities,
  getCapabilityBySlug,
} from "../../src/repositories/expertise.repository.js";
import {
  getCaseStudies,
  getCaseStudyBySlug,
} from "../../src/repositories/caseStudies.repository.js";
import { getPlatforms } from "../../src/repositories/platforms.repository.js";
import { websiteApi } from "../../src/services/websiteApi.js";
import {
  mapInsight,
} from "../../src/repositories/insights.repository.js";

test("expertise repository returns localized normalized capability models", async () => {
  const capabilities = await getCapabilities("fr");
  assert.equal(capabilities.length, 6);
  assert.equal(capabilities[0].title, "Transformer");
  assert.equal(typeof capabilities[0].description, "string");
  assert.equal("copy" in capabilities[0], false);
});

test("expertise repository resolves a capability by slug", async () => {
  const capability = await getCapabilityBySlug("en", "systems-integration");
  assert.equal(capability?.title, "Connect");
  assert.equal(await getCapabilityBySlug("en", "missing"), null);
});

test("case study repository exposes normalized metrics and relationships", async () => {
  const studies = await getCaseStudies("en");
  assert.ok(studies.length >= 3);
  assert.ok(studies[0].metrics.length >= 2);
  assert.ok(Array.isArray(studies[0].platformIds));
  assert.equal("copy" in studies[0], false);

  const detail = await getCaseStudyBySlug("fr", studies[0].slug);
  assert.equal(typeof detail.title, "string");
});

test("platform repository maps CMS records into frontend-ready models", async (t) => {
  t.mock.method(websiteApi, "platforms", async () => ({ data: [{ id: "cms-1", slug: "netsuite", name: "NetSuite" }], meta: { last_page: 1 } }));
  const platforms = await getPlatforms("fr");
  assert.ok(platforms.some((platform) => platform.name === "NetSuite"));
  assert.equal(platforms[0].cmsId, "cms-1");
});

test("CMS article fields map to the existing insight card model", () => {
  const insight = mapInsight({ id: "article-1", slug: "erp", title: "ERP", excerpt: "Intro", body: "<p>Body</p>", category_id: "cat-1", cover_image: { url: "https://example.com/cover.jpg", alt: "Cover" } });
  assert.equal(insight.categoryId, "cat-1");
  assert.equal(insight.image.src, "https://example.com/cover.jpg");
  assert.equal(insight.body, "<p>Body</p>");
});
