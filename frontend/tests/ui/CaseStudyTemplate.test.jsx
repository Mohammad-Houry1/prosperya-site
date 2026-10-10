import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vitest";
import CaseStudyContent from "../../src/pages/CaseStudy/CaseStudyContent.jsx";

test("arbitrary project records use the shared template and retain dense architecture data", () => {
  const systems = Array.from({ length: 12 }, (_, i) => `Source ${i + 1}`);
  const view = render(<MemoryRouter><CaseStudyContent locale="en" platforms={[{ id: "first", name: "Selected first" }, { id: "second", name: "Selected second" }]} study={{
    id: "new-record", slug: "new-project-slug", name: "A different project", description: "Record summary",
    detail: { challenge: "Record challenge", solutionIntro: "Record solution", before: systems, after: ["Target system"], outcomeIntro: "Record result" },
  }} /></MemoryRouter>);
  expect(screen.getByRole("heading", { level: 1, name: "A different project" })).toBeInTheDocument();
  expect(view.container.querySelector('[data-case-study-template="shared"]')).not.toBeNull();
  systems.forEach(system => expect(screen.getByText(system)).toBeInTheDocument());
  expect(screen.getByText("Core platform").parentElement).toHaveTextContent("Selected first");
  expect(screen.queryByText("NetSuite")).not.toBeInTheDocument();
});

test("a sparse project renders its summary without empty sections or missing-array errors", () => {
  render(<MemoryRouter><CaseStudyContent locale="en" study={{ id: "minimal", slug: "minimal", name: "Minimal project", description: "Only the summary" }} /></MemoryRouter>);
  expect(screen.getByText("Only the summary")).toBeInTheDocument();
  expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  expect(screen.queryByRole("navigation", { name: "In this project" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Let’s talk it through" })).toHaveAttribute("href", "/en/contact");
});
