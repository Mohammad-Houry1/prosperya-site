import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Renders the Home Hero with only the given media queries matching.
async function renderHero(locale, matching = []) {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: matching.includes(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
  const { default: HeroSection } = await import("../../src/sections/home/HeroSection.jsx");
  render(
    <MemoryRouter initialEntries={[`/${locale}`]}>
      <Routes>
        <Route
          path="/:locale"
          element={
            <LocaleProvider>
              <HeroSection />
            </LocaleProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

it.each([
  ["en", /Complexity\.\s*Orchestrated\./, "One operating architecture", "Fragmented architecture"],
  ["fr", /Complexité\.\s*Orchestrée\./, "Une architecture opérationnelle", "Architecture fragmentée"],
])(
  "starts on the finished, orchestrated state in %s with reduced motion",
  async (locale, heading, after, before) => {
    await renderHero(locale, ["(prefers-reduced-motion: reduce)"]);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    expect(screen.getByText(after)).toBeVisible();
    expect(screen.getByText(before)).not.toBeVisible();
  },
);

it.each([
  ["desktop", []],
  ["a phone", ["(max-width: 980px)", "(max-width: 640px)"]],
  ["reduced motion", ["(prefers-reduced-motion: reduce)"]],
])(
  "the Hero is one claim with its audiences and no chapters on %s",
  async (_mode, matching) => {
    await renderHero("en", matching);
    expect(screen.getByRole("heading", { level: 1, name: /Complexity\.\s*Orchestrated\./ })).toBeVisible();
    expect(screen.getByText("Built for ambitious organizations")).toBeInTheDocument();
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0);
  },
);
