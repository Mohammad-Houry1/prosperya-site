import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import ExpertisePageContent from "../../src/pages/ExpertiseDetail/ExpertisePageContent.jsx";

test("a new CMS-shaped page uses the shared template and fallback animation", () => {
  const view = render(<ThemeProvider><MemoryRouter>
    <LocaleContext.Provider value={{ locale: "en" }}>
      <ExpertisePageContent locale="en" page={{ slug: "new-cms-expertise", title: "A new expertise",
        description: "<p>CMS introduction</p>", sections: [
          { title: "First section", description: "<p>First CMS body</p><script>window.injected = true</script>" },
          { title: "Second section", description: "<ul><li>CMS bullet</li></ul>" },
        ] }} />
    </LocaleContext.Provider>
  </MemoryRouter></ThemeProvider>);
  expect(screen.getByRole("heading", { level: 1, name: "A new expertise" })).toBeInTheDocument();
  expect(screen.getByText("First CMS body")).toBeInTheDocument();
  expect(screen.getByText("CMS bullet")).toBeInTheDocument();
  expect(view.container.querySelectorAll("[data-animation]")).toHaveLength(1);
  expect(view.container.querySelector("[data-animation]")).toHaveAttribute("data-animation", "structure");
  expect(view.container.querySelector("script")).toBeNull();
});
