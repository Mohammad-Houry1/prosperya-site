import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";
import { useLocale } from "../../src/i18n/LocaleContext.jsx";
function Probe() { const { t } = useLocale(); return <span>{t("nav.work")}</span>; }
test("French navigation uses bundled copy without any request", () => {
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  render(<MemoryRouter initialEntries={["/fr"]}><Routes><Route path="/:locale" element={<LocaleProvider><Probe /></LocaleProvider>} /></Routes></MemoryRouter>);
  expect(screen.getByText("Projets")).toBeInTheDocument();
  expect(fetcher).not.toHaveBeenCalled(); vi.unstubAllGlobals();
});
