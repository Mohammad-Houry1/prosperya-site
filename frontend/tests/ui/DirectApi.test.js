import { afterEach, expect, test, vi } from "vitest";
import { websiteApi } from "../../src/services/websiteApi.js";

afterEach(() => vi.unstubAllGlobals());

test("each content request has its own URL and HTTP error", async () => {
  const fetcher = vi.fn(async (url) => ({
    ok: !url.includes("testimonials"), status: url.includes("testimonials") ? 404 : 200,
    json: async () => url.includes("testimonials") ? { message: "Missing module" } : { data: [] },
  }));
  vi.stubGlobal("fetch", fetcher);
  const results = await Promise.allSettled([websiteApi.articles({ locale: "fr" }), websiteApi.testimonials({ locale: "fr" }), websiteApi.faqs({ locale: "fr" })]);
  expect(fetcher.mock.calls.map(([url]) => url)).toEqual(["/api/articles?locale=fr", "/api/testimonials?locale=fr", "/api/faqs?locale=fr"]);
  expect(results[0].status).toBe("fulfilled");
  expect(results[1].reason).toMatchObject({ status: 404, message: "Missing module" });
  expect(results[2].status).toBe("fulfilled");
});

test("passes independent cancellation signals to each request", async () => {
  const fetcher = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ data: [] }) }));
  vi.stubGlobal("fetch", fetcher);
  const first = new AbortController();
  const second = new AbortController();
  await Promise.all([websiteApi.articles({ locale: "en" }, first.signal), websiteApi.platforms({ locale: "en" }, second.signal)]);
  expect(fetcher.mock.calls[0][1].signal).toBe(first.signal);
  expect(fetcher.mock.calls[1][1].signal).toBe(second.signal);
});

test("keeps cancellation distinct from invalid JSON after response headers arrive", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200,
    json: async () => { throw new DOMException("Request cancelled.", "AbortError"); },
  })));
  await expect(websiteApi.articles({ locale: "en" })).rejects.toMatchObject({ name: "AbortError" });
});
