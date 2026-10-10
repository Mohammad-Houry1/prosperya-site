import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import ContactPage from "../../src/pages/Contact/ContactPage.jsx";
test("staging enquiries cannot submit even when the local CMS flag is enabled", async () => {
  vi.stubEnv("VITE_CMS_SUBMISSIONS_ENABLED", "true");
  render(<MemoryRouter><LocaleProvider><ContactPage /></LocaleProvider></MemoryRouter>);
  expect(await screen.findByRole("button", { name: "Send project brief" })).toBeDisabled();
  expect(screen.getByText("Staging reference — project enquiries are not sent.")).toBeInTheDocument();
  vi.unstubAllEnvs();
});
