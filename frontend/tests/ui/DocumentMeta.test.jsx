import { afterEach, expect, test, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { useDocumentMeta } from "../../src/hooks/useDocumentMeta.js";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";

function metadata(overrides = {}) {
  return { path: "/en", locale: "en", title: "Backend home", description: "Backend description",
    canonical: "https://site.test/en", robots: "index, follow", keywords: "enterprise",
    ogTitle: "Backend home", ogDescription: "Backend description", ogImage: "https://site.test/social.png",
    ogType: "website", alternates: [{ locale: "fr", url: "https://site.test/fr" }], structuredData: null, ...overrides };
}

function Probe({ destination = "/fr/about" }) {
  const { pathname } = useLocation();
  useDocumentMeta({ title: `Old title ${pathname}`, description: "Old description" });
  return <Link to={destination}>Go to French</Link>;
}

afterEach(() => {
  document.head.querySelectorAll('meta[name], meta[property], link[rel="canonical"], link[hreflang], #website-seo, #website-schema').forEach((node) => node.remove());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("uses the server bootstrap and preserves a single backend canonical without another request", async () => {
  const script = document.createElement("script");
  script.id = "website-seo";
  script.type = "application/json";
  script.textContent = JSON.stringify(metadata());
  document.head.append(script);
  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = "https://site.test/en";
  document.head.append(canonical);
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  render(<MemoryRouter initialEntries={["/en"]}><Probe /></MemoryRouter>);
  await waitFor(() => expect(document.title).toBe("Backend home"));
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.querySelector('meta[name="description"]').content).toBe("Backend description");
  expect(fetcher).not.toHaveBeenCalled();
});

test("updates SEO and language on navigation and removes empty metadata from the previous page", async () => {
  vi.spyOn(websiteApi, "seo").mockImplementation(async (path) => ({
    data: path === "/fr/about"
      ? metadata({ path: "/fr/about", locale: "fr", title: "À propos serveur", canonical: "https://site.test/fr/about", keywords: "", ogImage: null, alternates: [] })
      : metadata(),
  }));
  const view = render(<MemoryRouter initialEntries={["/en"]}><Probe /></MemoryRouter>);
  await waitFor(() => expect(document.title).toBe("Backend home"));
  await userEvent.click(view.getByRole("link", { name: "Go to French" }));
  await waitFor(() => expect(document.title).toBe("À propos serveur"));
  expect(document.documentElement.lang).toBe("fr");
  expect(document.querySelector('link[rel="canonical"]').href).toBe("https://site.test/fr/about");
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.querySelector('meta[name="keywords"]')).toBeNull();
  expect(document.querySelector('meta[property="og:image"]')).toBeNull();
  expect(document.querySelectorAll('link[hreflang]')).toHaveLength(0);
});

test("failed metadata requests cannot retain an indexable previous page canonical", async () => {
  vi.spyOn(websiteApi, "seo")
    .mockResolvedValueOnce({ data: metadata() })
    .mockRejectedValueOnce(new WebsiteApiError("Unavailable", 503));
  const view = render(<MemoryRouter initialEntries={["/en"]}><Probe /></MemoryRouter>);
  await waitFor(() => expect(document.title).toBe("Backend home"));
  await userEvent.click(view.getByRole("link", { name: "Go to French" }));
  await waitFor(() => expect(document.querySelector('meta[name="robots"]').content).toBe("noindex, follow"));
  expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  expect(document.title).toBe("Old title /fr/about");
});

test("an invalid metadata payload stays noindex", async () => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: {} });
  render(<MemoryRouter initialEntries={["/en"]}><Probe /></MemoryRouter>);
  await waitFor(() => expect(document.querySelector('meta[name="robots"]').content).toBe("noindex, follow"));
  expect(document.querySelector('link[rel="canonical"]')).toBeNull();
});

test("client navigation to an accented slug accepts the backend encoded pathname", async () => {
  vi.spyOn(websiteApi, "seo")
    .mockResolvedValueOnce({ data: metadata() })
    .mockResolvedValueOnce({ data: metadata({
      path: "/fr/insights/%C3%A9conomie", locale: "fr", title: "Économie serveur",
      canonical: "https://site.test/fr/insights/%C3%A9conomie",
    }) });
  const view = render(<MemoryRouter initialEntries={["/en"]}><Probe destination="/fr/insights/économie" /></MemoryRouter>);
  await waitFor(() => expect(document.title).toBe("Backend home"));
  await userEvent.click(view.getByRole("link", { name: "Go to French" }));
  await waitFor(() => expect(document.title).toBe("Économie serveur"));
  expect(document.querySelector('meta[name="robots"]').content).toBe("index, follow");
  expect(document.querySelector('link[rel="canonical"]').href).toBe("https://site.test/fr/insights/%C3%A9conomie");
});
