import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vitest";
import SolutionRow from "../../src/components/expertise/SolutionRow.jsx";
import DeliverySequence from "../../src/pages/Approach/DeliverySequence.jsx";
import { solutionsData } from "../../src/data/solutions.data.js";
import { companyData } from "../../src/data/company.data.js";
import { localizeEntity } from "../../src/repositories/localize.js";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { createTranslator } from "../../src/i18n/labels.js";

test("a solution row presents pains, capabilities and outcomes with locale-aware links", async () => {
  const [solution] = localizeEntity(solutionsData, "fr");
  render(
    <MemoryRouter>
      <LocaleContext.Provider value={{ locale: "fr", t: createTranslator("fr") }}>
        <SolutionRow solution={solution} locale="fr" />
      </LocaleContext.Provider>
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
  const steps = localizeEntity(companyData.process, "en");
  render(
    <ThemeProvider>
      <LocaleContext.Provider value={{ locale: "en", t: createTranslator("en") }}>
        <DeliverySequence steps={steps} locale="en" />
      </LocaleContext.Provider>
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
