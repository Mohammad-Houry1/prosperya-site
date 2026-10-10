import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";
import ExpertiseDetailPage from "../../src/pages/ExpertiseDetail/ExpertiseDetailPage.jsx";

const record = { id: "authored", slug: "netsuite-implementation", expertise_title: "Short title", expertise_detail_title: "CMS full heading",
  expertise_animation_type: "workflow", expertise_tagline: "CMS tagline", expertise_description: "<p>Rich CMS introduction</p>",
  expertise_capabilities: ["CMS service"], expertise_outcomes: ["CMS outcome"],
  expertise_steps: [{ step_title: "CMS step", step_description: "<p>CMS step body</p>" }],
  sections: [{ section_title: "CMS section", section_description: '<p><strong>CMS section body</strong></p><script>bad()</script>' }, {}],
  metrics: [{ metric_value: "12", metric_label: "CMS teams" }], expertise_metrics_note: "<p>CMS qualification</p>",
  platforms: [{ id: "platform", name: "CMS platform", logo_image: { url: "/cms-platform.png", alt: "CMS platform logo" } }],
  related_solutions: [{ id: "s", slug: "selected-solution", solution_title: "Selected solution" }],
  related_case_studies: [{ id: "c", slug: "selected-case", case_study_title: "Selected case" }] };

beforeEach(() => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  vi.spyOn(websiteApi, "expertiseDetail").mockResolvedValue({ data: record });
  vi.spyOn(websiteApi, "expertise").mockResolvedValue({ data: [] });
});
afterEach(() => vi.restoreAllMocks());
function show(locale = "en") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[`/${locale}/expertise/netsuite-implementation`]}><LocaleContext.Provider value={cmsLocale(locale)}><Routes><Route path="/:locale/expertise/:slug" element={<ExpertiseDetailPage />} /></Routes></LocaleContext.Provider></MemoryRouter></ThemeProvider>);
}

test.each(["en", "fr"])("Expertise detail uses CMS visuals and all authored content in %s", async locale => {
  const view = show(locale);
  await screen.findByRole("heading", { name: "CMS full heading" });
  expect(view.container.querySelector('[data-animation="workflow"]')).toBeInTheDocument();
  expect(screen.getByText("CMS tagline")).toBeInTheDocument();
  expect(screen.getByAltText("CMS platform logo")).toHaveAttribute("src", "/cms-platform.png");
  for (const name of ["CMS service", "CMS outcome", "CMS step", "CMS step body", "CMS teams", "CMS qualification"]) expect(screen.getByText(name)).toBeInTheDocument();
  expect(screen.getByText("CMS section body").tagName).toBe("STRONG");
  expect(screen.getByRole("link", { name: "Selected solution" })).toHaveAttribute("href", `/${locale}/solutions/selected-solution`);
  expect(screen.getByRole("link", { name: "Selected case" })).toHaveAttribute("href", `/${locale}/work/selected-case`);
  expect(view.container.querySelectorAll('[data-expertise-section]')).toHaveLength(1);
  expect(view.container.querySelector("script")).toBeNull();
});

test("missing Expertise uses the missing-record state", async () => {
  vi.mocked(websiteApi.expertiseDetail).mockRejectedValue(Object.assign(new Error("Missing"), { status: 404 }));
  show();
  await screen.findByRole("heading", { name: "Expertise not found" });
});

test("an empty detail hides optional sections and does not infer a visual from its slug", async () => {
  vi.mocked(websiteApi.expertiseDetail).mockResolvedValue({ data: { expertise_title: "Minimal expertise", slug: "netsuite-implementation", sections: [{}] } });
  const view = show();
  await screen.findByRole("heading", { name: "Minimal expertise" });
  expect(view.container.querySelector('[data-animation]')).toBeNull();
  expect(screen.queryByRole("navigation", { name: "On this page" })).not.toBeInTheDocument();
  expect(view.container.querySelectorAll('[data-expertise-section]')).toHaveLength(0);
});
