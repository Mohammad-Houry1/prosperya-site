import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { websiteApi } from "../../src/services/websiteApi.js";
import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";
import ClientCompanies from "../../src/components/company/ClientCompanies.jsx";

beforeEach(() => {
  vi.spyOn(websiteApi, "testimonials").mockResolvedValue({ data: [{ id: "t", company: "Northline", name: "Visitor", quote: "Approved" }], meta: { last_page: 1 } });
  vi.spyOn(websiteApi, "labels").mockResolvedValue({ data: {}, meta: { last_page: 1 } });
});
afterEach(() => vi.restoreAllMocks());

function renderStrip(props = {}) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/en"]}>
        <Routes>
          <Route
            path="/:locale"
            element={
              <LocaleProvider>
                <ClientCompanies {...props} />
              </LocaleProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// The drifting track is the element that holds the moving copies of the marks.
const movingTrack = () => screen.getAllByText("Northline").at(-1).closest("ul").parentElement;

test("the Home marquee can be paused and resumed", async () => {
  renderStrip();
  await screen.findAllByText("Northline");
  const control = screen.queryByRole("button", { name: /pause client logos/i });
  expect(control).toBeInTheDocument();
  expect(getComputedStyle(movingTrack()).animationPlayState).not.toBe("paused");
  fireEvent.click(control);
  expect(getComputedStyle(movingTrack()).animationPlayState).toBe("paused");
  fireEvent.click(screen.getByRole("button", { name: /play client logos/i }));
  expect(getComputedStyle(movingTrack()).animationPlayState).not.toBe("paused");
});

test("the still client row shows each mark once, with nothing to pause", async () => {
  renderStrip({ still: true });
  await screen.findAllByText("Northline");
  expect(screen.getAllByText("Northline")).toHaveLength(1);
  expect(screen.queryByRole("button", { name: /client logos/i })).not.toBeInTheDocument();
});
