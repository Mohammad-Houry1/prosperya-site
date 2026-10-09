import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vitest";
import SolutionRow from "../../src/components/expertise/SolutionRow.jsx";
import DeliverySequence from "../../src/pages/Approach/DeliverySequence.jsx";
import { getSolutions } from "../../src/repositories/solutions.repository.js";
import { getProcess } from "../../src/repositories/company.repository.js";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";

test("a solution row presents pains, capabilities and outcomes with locale-aware links", async () => {
  const [solution] = await getSolutions("fr");
  render(
    <MemoryRouter>
      <SolutionRow solution={solution} locale="fr" />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: solution.title })).toBeInTheDocument();
  expect(screen.getByText(solution.pains[0])).toBeInTheDocument();
  expect(screen.getByText(solution.capabilities[0])).toBeInTheDocument();
  expect(screen.getByText(solution.outcomes[0][1])).toBeInTheDocument();
  for (const link of screen.getAllByRole("link"))
    expect(link).toHaveAttribute("href", `/fr/solutions/${solution.slug}`);
});

test("delivery sequence can be reversed and cannot advance past the final stage", async () => {
  const steps = await getProcess("en");
  render(
    <ThemeProvider>
      <DeliverySequence steps={steps} locale="en" />
    </ThemeProvider>,
  );
  expect(screen.getByRole("button", { name: "Previous stage" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Next stage" }));
  expect(
    screen.getByRole("heading", { name: steps[1].title }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Previous stage" }));
  expect(
    screen.getByRole("heading", { name: steps[0].title }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: new RegExp(steps.at(-1).title) }),
  );
  expect(screen.getByRole("button", { name: "Next stage" })).toBeDisabled();
});
