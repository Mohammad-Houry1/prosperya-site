import { render, screen, waitFor } from "@testing-library/react";
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
  test("derives French content from the localized route", () => {
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
    expect(screen.getByText("Projets")).toBeInTheDocument();
  });
  test("empty CMS translations keep the French fallback instead of blanking navigation", async () => {
    vi.spyOn(websiteApi, "labels").mockResolvedValue({
      data: { "nav.work": "", "nav.contact": "   ", "footer.rights": "Droits du CMS" },
      meta: { current_page: 1, last_page: 1 },
    });
    render(<MemoryRouter initialEntries={["/fr/work"]}><Routes>
      <Route path="/:locale/*" element={<LocaleProvider><Probe /></LocaleProvider>} />
    </Routes></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Labels ready")).toBeInTheDocument());
    expect(screen.getByText("Projets")).toBeInTheDocument();
    expect(screen.getByText("Démarrer un projet")).toBeInTheDocument();
    expect(screen.getByText("Droits du CMS")).toBeInTheDocument();
  });
});
