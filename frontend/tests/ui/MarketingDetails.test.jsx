import { render } from "../renderWithQueries.jsx";
import { screen } from "@testing-library/react";
import { beforeEach, afterEach, vi, expect, test } from "vitest";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import ArchitectureMorph from "../../src/components/case-study/ArchitectureMorph.jsx";
import DeliverySequence from "../../src/pages/Approach/DeliverySequence.jsx";
beforeEach(() => vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} }));
afterEach(() => vi.unstubAllGlobals());
const labels = { before: "Before CMS", after: "After CMS", transform: "Transform", core: "Core", coreName: "CMS Platform", aria: "CMS architecture" };
test("architecture renders arbitrary CMS lists beyond the original seven nodes", () => {
  render(<ThemeProvider><ArchitectureMorph detail={{ before: Array.from({length: 10}, (_, i) => `CMS source ${i}`), after: ["CMS outcome"], beforeCaption: "", afterCaption: "" }} labels={labels} /></ThemeProvider>);
  expect(screen.getByText("CMS source 9")).toBeInTheDocument();
  expect(screen.queryByText("NetSuite")).not.toBeInTheDocument();
});
test.each([[[]], [[{ id: "one", title: "CMS stage", activities: [], descriptions: [] }]]])("methodology handles zero or one authored stage", steps => {
  render(<ThemeProvider><DeliverySequence steps={steps} /></ThemeProvider>);
  if (steps.length) {
    expect(screen.getByRole("button", { name: "Next stage" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous stage" })).toBeDisabled();
  } else expect(screen.queryByRole("button", { name: "Next stage" })).not.toBeInTheDocument();
});
