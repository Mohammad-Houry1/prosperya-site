import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { websiteApi } from "../../src/services/websiteApi.js";

function fetchApi(handler) {
  const fetcher = vi.fn(async (url, options) => ({ ok: true, status: 200, json: async () => ({
    ...handler({ path: new URL(url, "https://site.test").pathname.replace('/api/', ''), query: Object.fromEntries(new URL(url, "https://site.test").searchParams), data: options.body ? JSON.parse(options.body) : undefined }),
  }) }));
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
beforeEach(() => vi.stubEnv("VITE_API_BASE_URL", ""));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

test("passes the explicitly selected SEO model with the route", async () => {
  const fetcher = fetchApi(() => ({ data: {} }));
  await websiteApi.seo("/fr/insights", undefined, "SeoPage");
  await websiteApi.seo("/en/insights/example", undefined, "Article");
  await websiteApi.seo("/en/corporate/about-prosperya", undefined, "CorporatePage");
  expect(fetcher.mock.calls.map(([url]) => new URL(url, "https://site.test").searchParams.get("model")))
    .toEqual(["SeoPage", "Article", "CorporatePage"]);
});

test("requests profiles by encoded slug and users by multiple role slugs", async () => {
  const fetcher = fetchApi(() => ({ data: [] }));
  await websiteApi.user("public/person", "fr");
  await websiteApi.users({ locale: "en", roles: ["team", "author"] });
  expect(fetcher.mock.calls[0][0]).toBe("/api/users/public%2Fperson?locale=fr");
  const url = new URL(fetcher.mock.calls[1][0], "https://site.test");
  expect(url.pathname).toBe("/api/users");
  expect(url.searchParams.getAll("roles[]")).toEqual(["team", "author"]);
});

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

test("loads translated labels with one request", async () => {
  const fetcher = fetchApi(() => ({ data: { "nav.insights": "Insights", "footer.rights": "Rights" }, meta: { last_page: 2 } }));
  const response = await websiteApi.labels({ locale: "en" });
  expect(response.data).toEqual({ "nav.insights": "Insights", "footer.rights": "Rights" });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(new URL(fetcher.mock.calls[0][0], 'https://site.test').searchParams.get('locale')).toBe('en');
});
