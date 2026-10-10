import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import AppErrorBoundary from "../../src/app/AppErrorBoundary.jsx";
import { AppProviders } from "../../src/app/providers/AppProviders.jsx";
import { router as browserRouter } from "../../src/app/router.jsx";

vi.mock("../../src/pages/About/AboutPage.jsx", () => {
  throw new Error("Failed to fetch dynamically imported module: /private-test-path/AboutPage.jsx");
});

const routes = browserRouter.routes;
browserRouter.dispose();
let testRouter;
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({
    data: {}, meta: { current_page: 1, last_page: 1 },
  }) }));
});
afterEach(() => {
  testRouter?.dispose();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.head.querySelectorAll('meta[name="robots"], meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]').forEach((node) => node.remove());
});

test.each([
  ["en", "Back home", "Try again"],
  ["fr", "Retour à l’accueil", "Réessayer"],
])("a failed page import shows localized recovery actions on the %s route", async (locale, home, retry) => {
  for (const [attribute, key] of [["name", "description"], ["name", "keywords"], ["property", "og:title"], ["property", "og:url"], ["name", "twitter:title"]]) {
    const tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    tag.content = "Previous server page";
    document.head.append(tag);
  }
  testRouter = createMemoryRouter(routes, { initialEntries: [`/${locale}/about`] });
  render(<AppProviders><RouterProvider router={testRouter} /></AppProviders>);
  const recovery = await screen.findByRole("link", { name: home });
  expect(recovery).toHaveAttribute("href", `/${locale}`);
  expect(screen.getByRole("button", { name: retry })).toBeInTheDocument();
  expect(screen.queryByText(/Unexpected Application Error/)).not.toBeInTheDocument();
  expect(document.body).not.toHaveTextContent("private-test-path");
  await waitFor(() => expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow"));
  expect(document.documentElement.lang).toBe(locale);
  expect(document.head.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"]')).toHaveLength(0);
});

test("the outer application boundary also gives a safe way home", () => {
  function Crash() { throw new Error("private runtime details"); }
  render(<AppErrorBoundary><Crash /></AppErrorBoundary>);
  expect(screen.getByRole("link", { name: "prosperya.components.feedback.failure-screen.back-home-b335e9" })).toHaveAttribute("href", "/en");
  expect(screen.getByRole("button", { name: "prosperya.components.feedback.failure-screen.try-again-170551" })).toBeInTheDocument();
  expect(document.body).not.toHaveTextContent("private runtime details");
});
