import { screen, within } from "@testing-library/react";
import { render } from "../renderWithMantine.jsx";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vitest";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import CaseStudyContent from "../../src/pages/CaseStudy/CaseStudyContent.jsx";
import { cmsLocale } from "../cmsFixtures.js";

const study = { id: "sparse", slug: "sparse", title: "Sparse project", description: "<p>Project introduction</p>", detail: {} };
const show = (overrides = {}) => render(
  <ThemeProvider><MemoryRouter><LocaleContext.Provider value={cmsLocale()}>
    <CaseStudyContent study={{ ...study, ...overrides }} locale="en" />
  </LocaleContext.Provider></MemoryRouter></ThemeProvider>,
);

test("unsupported animation and empty media do not reserve a hero visual", () => {
  const view = show({ animationType: "none", image: { src: "" } });
  expect(screen.getByRole("heading", { name: "Sparse project" })).toBeInTheDocument();
  expect(view.container.querySelector('[class*="heroVisual"]')).toBeNull();
  expect(view.container.querySelector('img[src=""]')).toBeNull();
});

test("technology-only projects omit empty navigation and narrative columns", () => {
  const view = show({ technologyStack: [{ id: "tech", name: "Laravel" }] });
  expect(screen.getByText("Technology stack")).toBeInTheDocument();
  expect(screen.getByText("Laravel")).toBeInTheDocument();
  expect(screen.queryByText("At a glance")).not.toBeInTheDocument();
  expect(screen.queryByRole("navigation", { name: "On this page" })).not.toBeInTheDocument();
  expect(view.container.querySelector('[class*="narrative"]')).toBeNull();
});

test("empty editor paragraphs and empty rows do not create optional sections", () => {
  const blank = "<p>&nbsp;<br></p>";
  const view = show({
    contentSections: [{ id: "empty", title: "", subtitle: blank, description: blank }],
    technologyStack: [{ id: "empty", name: "", image: null }],
    detail: { challenge: blank, challengePoints: [blank], solutionIntro: blank, features: [[null, blank]], before: [blank], after: [], outcomeIntro: blank, outcomes: [["", ""]], metricsNote: blank, heroFacts: [["", ""]] },
  });
  expect(screen.queryByText("At a glance")).not.toBeInTheDocument();
  expect(screen.queryByText("Technology stack")).not.toBeInTheDocument();
  expect(view.container.querySelector('[class*="story"]')).toBeNull();
  expect(view.container.querySelector('[class*="facts"]')).toBeNull();
});

test("a narrative without section titles does not create an empty sidebar", () => {
  const view = show({ contentSections: [{ id: "untitled", description: "<p>Authored narrative</p>" }] });
  expect(screen.getByText("Authored narrative")).toBeInTheDocument();
  expect(screen.queryByText("At a glance")).not.toBeInTheDocument();
  expect(screen.queryByRole("navigation", { name: "On this page" })).not.toBeInTheDocument();
  expect(view.container.querySelector('[class*="narrative"]')).toBeInTheDocument();
});

test("rich lead, subtitle and next-project summaries preserve formatting safely", () => {
  const view = show({
    chapeau: "<p><strong>Authored lead</strong></p>",
    contentSections: [{ id: "chapter", title: "Chapter", subtitle: "<p><em>Authored subtitle</em></p>", description: "<p>Body</p>" }],
    next: { id: "next", slug: "next", title: "Next project", description: '<p><strong>Next summary</strong></p><script>bad()</script>' },
  });
  expect(screen.getByText("Authored lead").tagName).toBe("STRONG");
  expect(screen.getByText("Authored subtitle").tagName).toBe("EM");
  const next = screen.getByRole("link", { name: /Next project/ });
  expect(within(next).getByText("Next summary").tagName).toBe("STRONG");
  expect(next.querySelector('[class*="nextVisual"]')).toBeNull();
  expect(next.querySelector("p")).toBeNull();
  expect(view.container.querySelector("script")).toBeNull();
});

test("supported animations and authored images retain the complete visual layout", () => {
  const view = show({ animationType: "network", image: { src: "/authored.png", alt: "Project image" }, detail: { challenge: "<p>Challenge content</p>" } });
  expect(view.container.querySelector('[data-case-study-animation="network"]')).toBeInTheDocument();
  expect(screen.getByAltText("Project image")).toHaveAttribute("src", "/authored.png");
  expect(screen.getByRole("link", { name: /The challenge/ })).toHaveAttribute("href", "#case-challenge");
});

test("before and after descriptions render formatted CMS values safely", () => {
  const view = show({ detail: { before: ['<p><em>Disconnected systems</em></p>'], after: ['<p><strong>Unified finance</strong> &amp; operations</p><script>bad()</script>'] } });
  expect(screen.getByText("Disconnected systems").tagName).toBe("EM");
  expect(screen.getByText("Unified finance").tagName).toBe("STRONG");
  expect(view.container.textContent).toContain("& operations");
  expect(view.container.textContent).not.toContain("<p>");
  expect(view.container.querySelector("script")).toBeNull();
});
