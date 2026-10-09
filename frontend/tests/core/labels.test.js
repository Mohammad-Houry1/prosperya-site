import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createTranslator, loadLabels } from "../../src/i18n/labels.js";
import { buildLabelCatalog } from "../../scripts/export-labels.mjs";

test("CMS labels override fallbacks and namespaced site labels precede legacy keys", () => {
  const t = createTranslator("fr", { "prosperya.nav.work": "Réalisations", "nav.work": "Projets legacy" });
  assert.equal(t("nav.work"), "Réalisations");
  assert.equal(t("nav.about"), "À propos");
  assert.equal(createTranslator("en", { "nav.work": "Our work" })("nav.work"), "Our work");
});

test("blank CMS translations preserve French source fallback and existing messages", () => {
  const t = createTranslator("fr", { "prosperya.page.heading": "  ", "prosperya.nav.work": "" });
  assert.equal(t("page.heading", { en: "Heading", fr: "Titre" }), "Titre");
  assert.equal(t("nav.work"), "Projets");
  assert.equal(t("unknown", { en: "English only" }), "English only");
  assert.equal(t("unknown"), "unknown");
});

test("interpolation respects CMS templates without changing unrelated placeholders", () => {
  const t = createTranslator("fr", { "prosperya.results": "{count} résultats pour {term}" });
  assert.equal(t("results", { en: "{count} results", fr: "{count} résultats" }, { count: 12 }), "12 résultats pour {term}");
  assert.equal(t("results", undefined, { count: 0, term: "ERP" }), "0 résultats pour ERP");
});

test("loadLabels follows every page, forwards cancellation, and never writes", async () => {
  const signal = new AbortController().signal;
  const requests = [];
  const api = { async labels(query, receivedSignal) {
    requests.push(query);
    assert.equal(receivedSignal, signal);
    return { data: { [`prosperya.page${query.page}`]: `Label ${query.page}` }, meta: { last_page: 3 } };
  } };
  assert.deepEqual(await loadLabels(api, "fr", signal), {
    "prosperya.page1": "Label 1", "prosperya.page2": "Label 2", "prosperya.page3": "Label 3",
  });
  assert.deepEqual(requests.map(query => query.page), [1, 2, 3]);
  assert.ok(requests.every(query => query.locale === "fr" && query.per_page === 500));
});

test("a failed later label page rejects the dictionary rather than keeping a partial result", async () => {
  const api = { async labels({ page }) {
    if (page === 2) throw new Error("CMS unavailable");
    return { data: { first: "First" }, meta: { last_page: 2 } };
  } };
  await assert.rejects(loadLabels(api, "en"), /CMS unavailable/);
});

test("exported dictionary exactly matches all source label keys and CMS field limits", () => {
  const catalog = buildLabelCatalog();
  const exported = JSON.parse(fs.readFileSync(new URL("../../../docs/cms/prosperya-labels.json", import.meta.url), "utf8"));
  assert.deepEqual(exported, catalog);
  assert.ok(catalog.length > 400);
  assert.equal(new Set(catalog.map(entry => entry.key)).size, catalog.length);
  for (const entry of catalog) {
    assert.ok(entry.key.startsWith("prosperya."));
    assert.ok(entry.key.length <= 255);
    assert.ok(["ui", "pages"].includes(entry.group));
    assert.equal(entry.source, entry.translations.en);
    assert.equal(typeof entry.translations.fr, "string");
    assert.ok(Object.values(entry.translations).every(text => text.length <= 2000));
  }
});
