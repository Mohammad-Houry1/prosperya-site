import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import CapabilityCard from "../../src/components/expertise/CapabilityCard.jsx";
import CapabilityIndex from "../../src/pages/Expertise/CapabilityIndex.jsx";
import InsightCard from "../../src/components/insight/InsightCard.jsx";
import ExpertisePage from "../../src/pages/Expertise/ExpertisePage.jsx";
import ArticlePage from "../../src/pages/Article/ArticlePage.jsx";
import MarketingSections from "../../src/components/sections/MarketingSections.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";

const summary = '<p>CMS <strong>formatted summary</strong> &amp; context.</p><script>alert(1)</script>';
afterEach(() => vi.restoreAllMocks());
function show(component, path = "/en") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[path]}><LocaleContext.Provider value={cmsLocale()}>{component}</LocaleContext.Provider></MemoryRouter></ThemeProvider>);
}

test.each([
  ["Home expertise card", <CapabilityCard locale="en" capability={{ id: "skill", slug: "skill", title: "Skill", summary }} />],
  ["Expertise navigation preview", <CapabilityIndex locale="en" items={[{ id: "skill", slug: "skill", title: "Skill", summary }]} />],
  ["Article card", <InsightCard locale="en" insight={{ id: "story", slug: "story", title: "Story", excerpt: summary, image: { src: "/cms.jpg" } }} />],
  ["Additional section subtitle", <MarketingSections sections={[{ id: "section", title: "Extra section", subtitle: summary }]} />],
])("%s renders CMS summary markup instead of displaying tags", (_name, component) => {
  const { container } = show(component);
  expect(screen.getByText("formatted summary").tagName).toBe("STRONG");
  expect(container.textContent).toContain("& context.");
  expect(container.textContent).not.toContain("<p>");
  expect(container.querySelector("script")).toBeNull();
});

test("Expertise rows render the same rich summaries and formatted capability values", async () => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  vi.spyOn(websiteApi, "expertise").mockResolvedValue({ data: [{ id: "skill", slug: "skill", expertise_title: "Skill", expertise_summary: summary,
    expertise_capabilities: ["<p>One <em>capability</em></p>"] }] });
  const { container } = show(<ExpertisePage />);
  expect((await screen.findAllByText("formatted summary")).every(node => node.tagName === "STRONG")).toBe(true);
  expect(screen.getByText("capability").tagName).toBe("EM");
  expect(container.textContent).not.toContain("<p>");
});

test("Article introduction renders rich excerpt without changing the article body", async () => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  vi.spyOn(websiteApi, "article").mockResolvedValue({ data: { id: "story", slug: "story", title: "Story", excerpt: summary, body: "<p>Article body</p>" } });
  vi.spyOn(websiteApi, "articles").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "categories").mockResolvedValue({ data: [] });
  const { container } = show(<Routes><Route path="/:locale/insights/:slug" element={<ArticlePage />} /></Routes>, "/en/insights/story");
  expect((await screen.findByText("formatted summary")).tagName).toBe("STRONG");
  expect(screen.getByText("Article body")).toBeInTheDocument();
  expect(container.textContent).not.toContain("<p>");
});
