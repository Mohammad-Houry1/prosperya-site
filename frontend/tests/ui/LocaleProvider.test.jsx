import { screen, waitFor } from "@testing-library/react";
import { render } from "../renderWithQueries.jsx";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useLocale } from "../../src/i18n/LocaleContext.jsx";
import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";
function Probe() {
  const { locale, t, labelsLoading } = useLocale();
  return (
    <div>
      <span>{locale}</span>
      <span>{t("nav.work")}</span>
      <span>{t("nav.contact")}</span>
      <span>{t("footer.rights")}</span>
      <span>{labelsLoading ? "Loading labels" : "Labels ready"}</span>
    </div>
  );
}
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("LocaleProvider", () => {
  test("derives French content from the localized route", async () => {
    render(
      <MemoryRouter initialEntries={["/fr/work"]}>
        <Routes>
          <Route
            path="/:locale/*"
            element={
              <LocaleProvider>
                <Probe />
              </LocaleProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("fr")).toBeInTheDocument();
    expect(await screen.findByText("Projets")).toBeInTheDocument();
  });
  test("blank CMS translations expose full keys without cross-locale fallback", async () => {
    vi.spyOn(websiteApi, "labels").mockResolvedValue({
      data: { "prosperya.nav.work": "", "prosperya.nav.contact": "   ", "prosperya.footer.rights": "Droits du CMS" },
      meta: { current_page: 1, last_page: 1 },
    });
    render(<MemoryRouter initialEntries={["/fr/work"]}><Routes>
      <Route path="/:locale/*" element={<LocaleProvider><Probe /></LocaleProvider>} />
    </Routes></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Droits du CMS")).toBeInTheDocument());
    expect(screen.getByText("prosperya.nav.work")).toBeInTheDocument();
    expect(screen.getByText("prosperya.nav.contact")).toBeInTheDocument();
    expect(screen.getByText("Droits du CMS")).toBeInTheDocument();
  });
});
