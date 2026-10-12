import { MantineProvider } from "@mantine/core";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { render } from "../renderWithMantine.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import ContactPage from "../../src/pages/Contact/ContactPage.jsx";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";

const choices = { project_types: [{ id: "type-1", name: "Integration" }], project_stages: [{ id: "stage-1", name: "Planning" }], captcha: { site_key: "test-site-key" } };
vi.mock("../../src/components/forms/GoogleCaptcha.jsx", () => ({ default: ({ onChange }) => <button type="button" onClick={() => onChange("captcha-test-token")}>Verify CAPTCHA</button> }));

// These tests exercise the form contract. Real dropdown rendering and keyboard
// interaction are covered in CmsModules.spec.js with a browser layout engine.
vi.mock("@mantine/core", async (importOriginal) => ({
  ...await importOriginal(),
  Select: ({ id, name, data, value, onChange, placeholder, required, ...props }) => (
    <select id={id} name={name} value={value ?? ""} required={required}
      aria-invalid={props["aria-invalid"]} aria-describedby={props["aria-describedby"]}
      onChange={(event) => onChange(event.target.value)}>
      <option value="" disabled>{placeholder}</option>
      {data.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  ),
}));

function renderPage(locale = "en") {
  return render(
    <MantineProvider env="test">
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
        <MemoryRouter initialEntries={[`/${locale}/contact`]}>
          <Routes><Route path="/:locale/contact" element={<LocaleContext.Provider value={cmsLocale(locale)}><ContactPage /></LocaleContext.Provider>} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  );
}

async function fillBrief() {
  await waitFor(() => expect(document.getElementById("project_type")).not.toBeNull());
  for (const [label, value] of [
    ["Name", "  Jad  "], ["Company", "Example"], ["Work email", "jad@example.com"],
    ["Country", "France"],
    ["What needs to change?", "Connect our finance systems"],
  ]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  for (const [label, value] of [["Project type", "type-1"], ["Project stage", "stage-1"]]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Verify CAPTCHA" }));
}

beforeEach(() => {
  vi.stubEnv("VITE_CMS_SUBMISSIONS_ENABLED", "true");
  vi.stubGlobal("matchMedia", vi.fn((query) => ({ matches: query.includes("prefers-reduced-motion"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() })));
  vi.spyOn(websiteApi, "contactOptions").mockResolvedValue({ data: choices, meta: { locale: "en" } });
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  vi.spyOn(websiteApi, "faqs").mockResolvedValue({ data: [], meta: { last_page: 1 } });
  vi.spyOn(websiteApi, "contact").mockResolvedValue({ data: { accepted: true } });
  vi.spyOn(websiteApi, "corporatePage").mockResolvedValue({ data: { title: "Do not show this heading", description: "<p>Explain your project <strong>here</strong>.</p>" } });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("ContactPage", () => {
  test("shows one skeleton for the whole form while choices are pending", () => {
    websiteApi.contactOptions.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getAllByRole("status", { name: "Loading options" })).toHaveLength(1);
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send project brief" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("Loading form options…")).not.toBeInTheDocument();
  });

  test("hides unavailable selects without an options error or retry button", async () => {
    websiteApi.contactOptions.mockRejectedValue(new WebsiteApiError("Unavailable", 503));
    renderPage();
    await waitFor(() => expect(screen.queryAllByRole("status", { name: "Loading options" })).toHaveLength(0));
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("Project type")).not.toBeInTheDocument();
    expect(screen.queryByText("Form options could not be loaded.")).not.toBeInTheDocument();
    expect(within(screen.getByRole("button", { name: "Send project brief" }).closest("form")).queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send project brief" })).toBeDisabled();
    expect(screen.getByLabelText("Name")).toBeVisible();
  });

  test("keeps submissions disabled when only read access is configured", async () => {
    vi.stubEnv("VITE_CMS_SUBMISSIONS_ENABLED", "false");
    renderPage();
    expect(screen.getByText("Project enquiries are temporarily unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send project brief" })).toBeDisabled();
    expect(websiteApi.contactOptions).not.toHaveBeenCalled();
  });

  test("renders only the contact-form corporate description and requests no category", async () => {
    renderPage();
    expect(await screen.findByText("here")).toHaveProperty("tagName", "STRONG");
    expect(screen.queryByText("Do not show this heading")).not.toBeInTheDocument();
    expect(websiteApi.corporatePage).toHaveBeenCalledWith("contact-form", "en", expect.any(AbortSignal));
  });

  test("requires a CAPTCHA token before submitting", async () => {
    renderPage();
    await waitFor(() => expect(document.getElementById("project_type")).not.toBeNull());
    expect(screen.getByRole("button", { name: "Send project brief" })).toBeDisabled();
    expect(websiteApi.contact).not.toHaveBeenCalled();
  });

  test("validates required fields and focuses the first error", async () => {
    renderPage();
    await waitFor(() => expect(document.getElementById("project_type")).not.toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Verify CAPTCHA" }));
    fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(websiteApi.contact).not.toHaveBeenCalled();
  });

  test("sends CMS option IDs and confirms accepted submissions", async () => {
    renderPage();
    await fillBrief();
    fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
    expect(await screen.findByText("Thank you, your project brief was received.")).toBeInTheDocument();
    expect(websiteApi.contact).toHaveBeenCalledWith(expect.objectContaining({ name: "Jad", company_name: "Example", project_type: "type-1", project_stage: "stage-1", locale: "en", captcha_token: "captcha-test-token" }));
    expect(screen.getByLabelText("Project type")).toHaveValue("");
  });

  test("preserves values and displays CMS validation errors", async () => {
    websiteApi.contact.mockRejectedValueOnce(new WebsiteApiError("Invalid", 422, { work_email: ["Email rejected"] }));
    renderPage();
    await fillBrief();
    fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
    expect(await screen.findByText("Email rejected")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toHaveValue("Example");
  });

  test("clears a rejected CAPTCHA error when the visitor verifies again", async () => {
    websiteApi.contact.mockRejectedValueOnce(new WebsiteApiError("Invalid", 422, { captcha_token: ["Verify again"] }));
    renderPage();
    await fillBrief();
    fireEvent.click(screen.getByRole("button", { name: "Send project brief" }));
    expect(await screen.findByText("Verify again")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send project brief" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Verify CAPTCHA" }));
    expect(screen.queryByText("Verify again")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send project brief" })).toBeEnabled();
  });

  test("shows the CMS choices in French", async () => {
    renderPage("fr");
    await waitFor(() => expect(document.getElementById("project_type")).not.toBeNull());
    const select = screen.getByLabelText("Type de projet");
    expect(select).toHaveValue("");
    expect(screen.getAllByRole("option", { name: "Sélectionnez" })).toHaveLength(2);
    expect(screen.getByRole("option", { name: "Integration" })).toHaveValue("type-1");
    expect(screen.getByRole("button", { name: "Envoyer mon brief" })).toBeVisible();
  });
});
