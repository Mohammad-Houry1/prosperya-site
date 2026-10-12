import { render } from "../renderWithQueries.jsx";
import { screen } from "@testing-library/react";
import { beforeEach, afterEach, vi, expect, test } from "vitest";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import DeliverySequence from "../../src/pages/Approach/DeliverySequence.jsx";
beforeEach(() => vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} }));
afterEach(() => vi.unstubAllGlobals());
test.each([[[]], [[{ id: "one", title: "CMS stage", activities: [], descriptions: [] }]]])("methodology handles zero or one authored stage", steps => {
  render(<ThemeProvider><DeliverySequence steps={steps} /></ThemeProvider>);
  if (steps.length) {
    expect(screen.getByRole("button", { name: "Next stage" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous stage" })).toBeDisabled();
  } else expect(screen.queryByRole("button", { name: "Next stage" })).not.toBeInTheDocument();
});
