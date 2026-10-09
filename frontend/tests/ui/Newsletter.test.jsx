import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";
import Newsletter from "../../src/components/insight/Newsletter.jsx";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";

beforeEach(() => vi.stubEnv("VITE_CMS_SUBMISSIONS_ENABLED", "true"));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

function renderNewsletter(props) {
  render(
    <MemoryRouter initialEntries={["/en"]}>
      <Routes>
        <Route path="/:locale" element={<LocaleProvider><Newsletter {...props} /></LocaleProvider>} />
      </Routes>
    </MemoryRouter>,
  );
}

test("the newsletter Close uses the page's own title when one is given", () => {
  renderNewsletter({ title: "Get the next article first." });
  expect(screen.getByRole("heading", { level: 2, name: "Get the next article first." })).toBeInTheDocument();
  expect(screen.queryByText("Stay informed. Stay ahead.")).not.toBeInTheDocument();
});

test("the newsletter Close falls back to the Insights title", () => {
  renderNewsletter({});
  expect(screen.getByRole("heading", { level: 2, name: "Stay informed. Stay ahead." })).toBeInTheDocument();
});

test("keeps signup disabled without a submission route", () => {
  vi.stubEnv("VITE_CMS_SUBMISSIONS_ENABLED", "false");
  renderNewsletter({});
  expect(screen.getByRole("button", { name: "Subscribe" })).toBeDisabled();
  expect(screen.getByText("Newsletter signup is temporarily unavailable.")).toBeInTheDocument();
});

test("sends one subscription and only acknowledges an accepted response", async () => {
  const submit = vi.spyOn(websiteApi, "newsletter").mockResolvedValue({ data: { accepted: true } });
  renderNewsletter({});
  fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "a@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
  expect(await screen.findByText("Thank you. Your subscription was received.")).toBeInTheDocument();
  expect(submit).toHaveBeenCalledWith({ email: "a@example.com", origin: "footer", locale: "en", website: "" });
});

test("explains rate limiting and keeps the entered email", async () => {
  vi.spyOn(websiteApi, "newsletter").mockRejectedValue(new WebsiteApiError("Slow down", 429));
  renderNewsletter({});
  fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "a@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
  expect(await screen.findByText("Too many requests. Please wait before trying again.")).toBeInTheDocument();
  expect(screen.getByLabelText("Work email")).toHaveValue("a@example.com");
});
