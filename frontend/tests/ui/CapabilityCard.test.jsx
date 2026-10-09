import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import CapabilityCard from "../../src/components/expertise/CapabilityCard.jsx";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { createTranslator } from "../../src/i18n/labels.js";
const capability = {
  id: "systems-integration",
  slug: "systems-integration",
  number: "02",
  icon: "share",
  eyebrow: "Systems Integration",
  title: "Connect",
  summary: "Integrate systems, data and partners.",
  description: "Connect the enterprise landscape.",
  services: ["API Architecture", "Celigo"],
};
describe("CapabilityCard", () => {
  test("renders normalized capability data and a locale-aware detail link", () => {
    render(
      <MemoryRouter>
        <LocaleContext.Provider value={{ locale: "fr", t: createTranslator("fr") }}>
          <CapabilityCard capability={capability} locale="fr" />
        </LocaleContext.Provider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Connect" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /En savoir plus.*Connect/i }),
    ).toHaveAttribute("href", "/fr/expertise/systems-integration");
    expect(screen.getByText(capability.summary)).toBeInTheDocument();
  });
});
