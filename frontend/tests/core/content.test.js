import test from "node:test";
import assert from "node:assert/strict";
import { mapInsight } from "../../src/repositories/insights.repository.js";

test("CMS article fields map to the insight card model", () => {
  const insight = mapInsight({ id: "article-1", slug: "erp", title: "ERP", excerpt: "Intro", body: "<p>Body</p>", category_id: "cat-1", cover_image: { url: "https://example.com/cover.jpg", alt: "Cover" } });
  assert.equal(insight.categoryId, "cat-1");
  assert.equal(insight.image.src, "https://example.com/cover.jpg");
  assert.equal(insight.body, "<p>Body</p>");
});
