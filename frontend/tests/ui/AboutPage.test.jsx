import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import AboutPage from "../../src/pages/About/AboutPage.jsx";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";

const firstId = "6ac8886280862f68e40a2864";
const secondId = "6ac8886280862f68e40a2865";
const profile = { id: firstId, name: "CMS Leader", position: "Operations Director", bio: "<p>Profile updated in Users.</p>", avatar: { url: "https://cms.example.test/leader.webp", alt: "CMS portrait", width: 300, height: 300 } };
const page = {
  title: "A title managed in Corporate Pages",
  description: '<p>A CMS introduction with <strong>editorial emphasis</strong>.</p><script>alert(1)</script>',
  our_story_description: "<p>Our story managed in Corporate Pages.</p>", our_story_title: "Our CMS story",
  cover_image: { url: "https://cms.example.test/about.webp", alt: "Our actual office", width: 1200, height: 800 },
  about_users: [secondId, firstId],
  our_story_blocks: [{ story_block_title: "Office", story_block_description: "<p><strong>Beirut</strong></p>", story_block_image: { url: "https://cms.example.test/office.png", alt: "Office icon" } }],
  corporate_content_items: ["ERP operations from the CMS"],
  sections: [{ title: "CMS principle", description: "<p>A <em>practical</em> principle.</p>" }],
  how_we_work_title: "Our CMS workflow", how_we_work_description: "<p>A workflow managed in Corporate Pages.</p>",
  how_we_work_blocks: [{ work_block_title: "First CMS step", work_block_description: "<p>A rich <strong>step description</strong>.</p>" }],
};

beforeEach(() => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: {} });
  vi.spyOn(websiteApi, "corporatePage").mockResolvedValue({ data: page });
  vi.spyOn(websiteApi, "users").mockResolvedValue({ data: [profile, { id: secondId, name: "Selected First", position: "Partner", bio: "Another selected profile" }] });
  vi.spyOn(websiteApi, "platforms").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "testimonials").mockResolvedValue({ data: [] });
});
afterEach(() => vi.restoreAllMocks());

function renderAbout(locale = "en") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[`/${locale}/about`]}>
    <LocaleContext.Provider value={{ locale, t: (_key, fallback) => fallback?.[locale] || fallback?.en || _key }}>
      <AboutPage />
    </LocaleContext.Provider>
  </MemoryRouter></ThemeProvider>);
}

test("renders CMS sections and current selected Users in the page selection order", async () => {
  const { container } = renderAbout();
  await screen.findByRole("heading", { name: "A title managed in Corporate Pages" });
  await screen.findByRole("heading", { name: "CMS Leader" });
  expect(websiteApi.corporatePage).toHaveBeenCalledWith("about-prosperya", "en", expect.any(AbortSignal));
  expect(websiteApi.users).toHaveBeenCalledWith({ locale: "en", ids: [secondId, firstId], per_page: 50 }, expect.any(AbortSignal));
  const selectedHeadings = screen.getAllByRole("heading", { name: /CMS Leader|Selected First/ });
  expect(selectedHeadings.map((heading) => heading.textContent)).toEqual(["Selected First", "CMS Leader"]);
  expect(screen.getByText("Operations Director")).toBeInTheDocument();
  expect(screen.getByText("Profile updated in Users.")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "CMS portrait" })).toHaveAttribute("src", profile.avatar.url);
  expect(screen.getByRole("img", { name: "Our actual office" })).toHaveAttribute("src", page.cover_image.url);
  expect(screen.getByText("ERP operations from the CMS")).toBeInTheDocument();
  expect(screen.getByText("Beirut").tagName).toBe("STRONG");
  expect(screen.getByRole("img", { name: "Office icon" })).toHaveAttribute("src", page.our_story_blocks[0].story_block_image.url);
  expect(screen.getByText("editorial emphasis").tagName).toBe("STRONG");
  expect(screen.getByText("practical").tagName).toBe("EM");
  expect(screen.getByText("step description").tagName).toBe("STRONG");
  expect(container.querySelector("script")).toBeNull();
  expect(screen.queryByText("Walid Houry")).not.toBeInTheDocument();
  expect(container.querySelector('img[src="/images/paris-editorial.webp"]')).toBeNull();
});

test("changing a selected User changes the displayed profile without page leadership copies", async () => {
  websiteApi.users.mockResolvedValue({ data: [{ ...profile, name: "Updated CMS Name", position: "Updated CMS Position", bio: "Updated CMS bio" }] });
  renderAbout();
  await screen.findByRole("heading", { name: "Updated CMS Name" });
  expect(screen.getByText("Updated CMS Position")).toBeInTheDocument();
  expect(screen.getByText("Updated CMS bio")).toBeInTheDocument();
  expect(screen.queryByText("CMS Leader")).not.toBeInTheDocument();
  expect(screen.queryByText("Selected First")).not.toBeInTheDocument();
});

test("blank optional sections and missing images stay hidden without static content", async () => {
  websiteApi.corporatePage.mockResolvedValue({ data: { title: "Minimal CMS page", about_users: [], our_story_blocks: [{}], sections: [{ description: "<p> </p>" }], how_we_work_blocks: [{}] } });
  const { container } = renderAbout();
  await screen.findByRole("heading", { name: "Minimal CMS page" });
  expect(websiteApi.users).not.toHaveBeenCalled();
  for (const label of ["Our story", "Leadership", "Our principles", "Our focus", "How we work"]) {
    expect(screen.queryByText(label)).not.toBeInTheDocument();
  }
  expect(container.querySelector("img")).toBeNull();
  expect(screen.queryByText("Walid Houry")).not.toBeInTheDocument();
});

test.each([403, 404])("denied or missing Corporate Pages content (%i) shows a graceful absent-content state", async (status) => {
  websiteApi.corporatePage.mockRejectedValue(new WebsiteApiError("Unavailable", status));
  renderAbout("fr");
  await screen.findByRole("heading", { name: "Contenu indisponible" });
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(websiteApi.users).not.toHaveBeenCalled();
  expect(screen.queryByText("A title managed in Corporate Pages")).not.toBeInTheDocument();
});

test("temporary Page errors allow retry and selected Users errors leave the page readable", async () => {
  websiteApi.corporatePage.mockRejectedValueOnce(new WebsiteApiError("Temporary", 503));
  renderAbout();
  await screen.findByRole("button", { name: "Try again" });
  websiteApi.corporatePage.mockResolvedValue({ data: page });
  websiteApi.users.mockRejectedValue(new WebsiteApiError("Missing users permission", 404));
  screen.getByRole("button", { name: "Try again" }).click();
  await screen.findByRole("heading", { name: "A title managed in Corporate Pages" });
  await waitFor(() => expect(websiteApi.users).toHaveBeenCalled());
  expect(screen.getByText("Our story managed in Corporate Pages.")).toBeInTheDocument();
  await screen.findByRole("alert");
  expect(screen.queryByText("Walid Houry")).not.toBeInTheDocument();
});

test("shows a page loader while the CMS Page request is pending", () => {
  websiteApi.corporatePage.mockReturnValue(new Promise(() => {}));
  renderAbout();
  expect(screen.getByRole("status", { name: "Loading page" })).toHaveAttribute("aria-busy", "true");
  expect(websiteApi.users).not.toHaveBeenCalled();
});
