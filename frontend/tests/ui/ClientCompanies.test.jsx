import { cmsLabels } from "../cmsFixtures.js";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { websiteApi } from "../../src/services/websiteApi.js";
import { LocaleProvider } from "../../src/i18n/LocaleProvider.jsx";
import ClientCompanies from "../../src/components/company/ClientCompanies.jsx";

beforeEach(() => {
  vi.spyOn(websiteApi, "testimonials").mockResolvedValue({ data: [{ id: "t", company: "Northline", name: "Visitor", quote: "Approved" }], meta: { last_page: 1 } });
  vi.spyOn(websiteApi, "platforms").mockResolvedValue({ data: [{ id: "p", slug: "foot-locker", name: "Foot Locker",
    logo_image: { url: "https://media.example.test/foot-locker.jpg", alt: "FL_Logo_Primary_Black_RGB.jpg", width: 3000, height: 2732 } }], meta: { last_page: 1 } });
  vi.spyOn(websiteApi, "labels").mockResolvedValue({ data: cmsLabels("en"), meta: { last_page: 1 } });
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
const movingTrack = () => screen.getAllByAltText("Foot Locker logo").at(-1).closest("ul").parentElement;

test("the Home marquee can be paused and resumed", async () => {
  renderStrip();
  await screen.findAllByAltText("Foot Locker logo");
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
  const logo = await screen.findByAltText("Foot Locker logo");
  expect(screen.getAllByAltText("Foot Locker logo")).toHaveLength(1);
  expect(logo).toHaveAttribute("src", "https://media.example.test/foot-locker.jpg");
  expect(logo).toHaveAttribute("loading", "lazy");
  expect(screen.queryByText("Northline")).not.toBeInTheDocument();
  expect(websiteApi.testimonials).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: /client logos/i })).not.toBeInTheDocument();
});

test("a CMS platform without a logo keeps a readable company name", async () => {
  websiteApi.platforms.mockResolvedValue({ data: [{ id: "p", slug: "foot-locker", name: "Foot Locker", logo_image: null }], meta: { last_page: 1 } });
  renderStrip({ still: true });
  expect(await screen.findByText("Foot Locker")).toBeInTheDocument();
});
