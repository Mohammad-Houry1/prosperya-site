import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { websiteApi } from "../../src/services/websiteApi.js";
import { loadWebsiteLabels } from "../../src/services/loadWebsiteLabels.js";

function fetchApi(handler) {
  const fetcher = vi.fn(async (url, options) => ({ ok: true, status: 200, json: async () => ({
    ...handler({ path: new URL(url, "https://site.test").pathname.replace('/api/', ''), query: Object.fromEntries(new URL(url, "https://site.test").searchParams), data: options.body ? JSON.parse(options.body) : undefined }),
  }) }));
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
beforeEach(() => vi.stubEnv("VITE_API_BASE_URL", ""));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

test("requests public article pages with locale, category and no credentials", async () => {
  const fetcher = fetchApi(() => ({ data: [], meta: { last_page: 1 } }));
  await websiteApi.articles({ locale: "fr", page: 2, category_id: "cat-1" });
  const [url, options] = fetcher.mock.calls[0];
  expect(url).toBe("/api/articles?locale=fr&page=2&category_id=cat-1");
  expect(options.method).toBe("GET");
  expect(options.credentials).toBe("omit");
  expect(options.headers.Authorization).toBeUndefined();
  expect(options.cache).toBe("no-store");
});

test("does not expose CMS credentials on reads or submissions", async () => {
  vi.stubEnv("VITE_CMS_WEBSITE_KEY", "test-public-website-key");
  const fetcher = fetchApi(() => ({ data: { accepted: true } }));
  await Promise.all([websiteApi.labels({ locale: "en" }), websiteApi.contact({ name: "Jad" })]);
  for (const [, options] of fetcher.mock.calls) {
    expect(options.headers["X-Api-Key"]).toBeUndefined();
    expect(options.body || "").not.toContain("test-public-website-key");
  }
});

test("posts submission JSON directly to the named endpoint", async () => {
  const fetcher = fetchApi(() => ({ data: { accepted: true } }));
  await websiteApi.contact({ name: "Jad", website: "" });
  const [url, options] = fetcher.mock.calls[0];
  expect(url).toBe("/api/contact");
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body)).toEqual({ name: "Jad", website: "" });
  expect(options.headers["Content-Type"]).toBe("application/json");
});

test("loads every page of translated labels", async () => {
  const fetcher = fetchApi(({ query }) => ({ data: query.page === "1" ? { "nav.insights": "Insights" } : { "footer.rights": "Rights" }, meta: { last_page: 2 } }));
  expect(await loadWebsiteLabels("en")).toEqual({ "nav.insights": "Insights", "footer.rights": "Rights" });
  expect(new URL(fetcher.mock.calls[1][0], 'https://site.test').searchParams.get('page')).toBe('2');
});
