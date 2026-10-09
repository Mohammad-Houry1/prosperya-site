import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";
import ContactPage from "../../src/pages/Contact/ContactPage.jsx";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";

const choices = { project_types: [{ id: "type-1", name: "Integration" }], project_stages: [{ id: "stage-1", name: "Planning" }] };

function renderPage(locale = "en") {
  return render(
    <MantineProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
        <MemoryRouter initialEntries={[`/${locale}/contact`]}>
          <Routes><Route path="/:locale/contact" element={<LocaleProvider><ContactPage /></LocaleProvider>} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  );
}

async function fillBrief() {
  await screen.findByRole("option", { name: "Integration" });
  for (const [label, value] of [
    ["Name", "  Jad  "], ["Company", "Example"], ["Work email", "jad@example.com"],
    ["Country", "France"], ["Project type", "type-1"], ["Project stage", "stage-1"],
    ["What needs to change?", "Connect our finance systems"],
  ]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

beforeEach(() => {
  vi.stubEnv("VITE_CMS_SUBMISSIONS_ENABLED", "true");
  vi.stubGlobal("matchMedia", vi.fn((query) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() })));
  vi.spyOn(websiteApi, "contactOptions").mockResolvedValue({ data: choices, meta: { locale: "en" } });
  vi.spyOn(websiteApi, "contact").mockResolvedValue({ data: { accepted: true } });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("ContactPage", () => {
  test("keeps submissions disabled when only read access is configured", () => {
    vi.stubEnv("VITE_CMS_SUBMISSIONS_ENABLED", "false");
    renderPage();
    expect(screen.getByText("Project enquiries are temporarily unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send project brief" })).toBeDisabled();
    expect(websiteApi.contactOptions).not.toHaveBeenCalled();
  });

  test("validates required fields and focuses the first error", async () => {
    renderPage();
    await screen.findByRole("option", { name: "Integration" });
    fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(websiteApi.contact).not.toHaveBeenCalled();
  });

  test("sends CMS option IDs and confirms accepted submissions", async () => {
    renderPage();
    await fillBrief();
    fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
    expect(await screen.findByText("Thank you, your project brief was received.")).toBeInTheDocument();
    expect(websiteApi.contact).toHaveBeenCalledWith(expect.objectContaining({ name: "Jad", company_name: "Example", project_type: "type-1", project_stage: "stage-1", locale: "en" }));
  });

  test("preserves values and displays CMS validation errors", async () => {
    websiteApi.contact.mockRejectedValueOnce(new WebsiteApiError("Invalid", 422, { work_email: ["Email rejected"] }));
    renderPage();
    await fillBrief();
    fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
    expect(await screen.findByText("Email rejected")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toHaveValue("Example");
  });

  test("shows the CMS choices in French", async () => {
    renderPage("fr");
    await waitFor(() => expect(screen.getByRole("option", { name: "Integration" })).toHaveValue("type-1"));
    expect(screen.getByRole("button", { name: "Envoyer mon brief" })).toBeVisible();
  });
});
