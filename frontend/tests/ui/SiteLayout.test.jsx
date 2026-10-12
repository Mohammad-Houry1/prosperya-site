import { screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import SiteLayout from "../../src/app/SiteLayout.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";

let router;
afterEach(() => { router?.dispose(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test.each(["pending", "error"])("keeps the real header and footer mounted when labels are %s", state => {
  vi.stubGlobal("scrollTo", vi.fn());
  vi.spyOn(websiteApi, "expertise").mockReturnValue(new Promise(() => {}));
  vi.spyOn(websiteApi, "solutions").mockReturnValue(new Promise(() => {}));
  vi.spyOn(websiteApi, "corporatePages").mockReturnValue(new Promise(() => {}));
  router = createMemoryRouter([{ path: "/en/contact", element: <SiteLayout />, children: [{ index: true, element: <p>Page content</p> }] }], { initialEntries: ["/en/contact"] });
  render(<ThemeProvider><LocaleContext.Provider value={{ ...cmsLocale(), labelsLoading: state === "pending", labelsError: state === "error" }}><RouterProvider router={router} /></LocaleContext.Provider></ThemeProvider>);
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(document.querySelector('header a[href="/en/work"]')).not.toBeNull();
  expect(document.querySelector('footer a[href="/en/about"]')).not.toBeNull();
  expect(screen.queryByText("Page content")).not.toBeInTheDocument();
});
