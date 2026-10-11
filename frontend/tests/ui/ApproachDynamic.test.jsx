import { screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";
import ApproachPage from "../../src/pages/Approach/ApproachPage.jsx";

beforeEach(() => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  vi.spyOn(websiteApi, "faqs").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "approach").mockResolvedValue({ data: { slug: "our-approach", approach_title: "CMS detailed approach", approach_description: "<p>CMS lead</p>",
    methodology: [{ methodology_title: "CMS stage", methodology_deliverable: "CMS handover" }],
    how_we_work: [{ work_title: "CMS practice", work_points: ["CMS practice point"] }],
    collaboration_title: "CMS collaboration", collaboration_items: ["CMS collaboration point"],
    principles_title: "CMS principles", principles: [{ principle_title: "CMS principle", principle_description: "<p>CMS principle body</p>" }],
    approach_image: { url: "/cms-approach.png", alt: "CMS approach image" } } });
});
afterEach(() => vi.restoreAllMocks());
function show(locale = "en", slug = "our-approach") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[`/${locale}/approach/${slug}`]}><LocaleContext.Provider value={cmsLocale(locale)}><Routes><Route path="/:locale/approach/:slug" element={<ApproachPage />} /></Routes></LocaleContext.Provider></MemoryRouter></ThemeProvider>);
}
test.each(["en", "fr"])("Approach loads its slug and renders detailed authored fields in %s", async locale => {
  show(locale);
  await screen.findByRole("heading", { name: "CMS detailed approach" });
  expect(websiteApi.approach).toHaveBeenCalledWith("our-approach", locale, expect.any(AbortSignal));
  for (const text of ["CMS handover", "CMS practice point", "CMS collaboration point", "CMS principle body"]) expect(screen.getByText(text)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "CMS collaboration" })).toBeInTheDocument();
  expect(screen.getByAltText("CMS approach image")).toHaveAttribute("src", "/cms-approach.png");
});
test("missing Approach slug uses missing-record feedback", async () => {
  vi.mocked(websiteApi.approach).mockRejectedValue(Object.assign(new Error("Missing"), { status: 404 }));
  show("en", "missing");
  await screen.findByRole("heading", { name: "Nothing to show yet" });
});

test("switching between cached Approach slugs starts at a valid methodology stage", async () => {
  vi.mocked(websiteApi.approach).mockImplementation(async slug => ({ data: { slug, approach_title: `Page ${slug}`,
    methodology: Array.from({ length: slug === "long" ? 3 : 1 }, (_, i) => ({ methodology_title: `${slug} stage ${i + 1}` })) } }));
  render(<ThemeProvider><MemoryRouter initialEntries={["/en/approach/long"]}><LocaleContext.Provider value={cmsLocale()}>
    <Link to="/en/approach/long">Open long</Link><Link to="/en/approach/short">Open short</Link>
    <Routes><Route path="/:locale/approach/:slug" element={<ApproachPage />} /></Routes>
  </LocaleContext.Provider></MemoryRouter></ThemeProvider>);
  await screen.findByRole("heading", { name: "Page long" });
  fireEvent.click(screen.getByRole("link", { name: "Open short" }));
  await screen.findByRole("heading", { name: "Page short" });
  fireEvent.click(screen.getByRole("link", { name: "Open long" }));
  await screen.findByRole("heading", { name: "Page long" });
  fireEvent.click(screen.getByRole("button", { name: "Next stage" }));
  fireEvent.click(screen.getByRole("button", { name: "Next stage" }));
  expect(screen.getByRole("heading", { name: "long stage 3" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Open short" }));
  await screen.findByRole("heading", { name: "Page short" });
  expect(screen.getByRole("heading", { name: "short stage 1" })).toBeInTheDocument();
});
