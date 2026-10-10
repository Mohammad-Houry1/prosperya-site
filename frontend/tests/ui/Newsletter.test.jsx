import { MemoryRouter } from "react-router-dom";
import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";
import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import Newsletter from "../../src/components/insight/Newsletter.jsx";
test("staging newsletter cannot submit even when the local CMS flag is enabled", () => {
  vi.stubEnv("VITE_CMS_SUBMISSIONS_ENABLED", "true");
  render(<MemoryRouter><LocaleProvider><Newsletter /></LocaleProvider></MemoryRouter>);
  expect(screen.getByRole("button", { name: "Subscribe" })).toBeDisabled();
  vi.unstubAllEnvs();
});
