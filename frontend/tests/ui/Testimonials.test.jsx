import { cmsLocale } from "../cmsFixtures.js";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import Testimonials from "../../src/components/company/Testimonials.jsx";

test.each(["feature", "rail"])("renders a CMS testimonial array in the %s layout", (variant) => {
  render(
    <LocaleContext.Provider value={cmsLocale("en")}>
      <Testimonials variant={variant} data={[{
        id: "cms-1", quote: "Our teams now work from the same information.",
        name: "Alex", role: "Operations", company: "Example",
      }]} />
    </LocaleContext.Provider>,
  );
  expect(screen.getByText(/Our teams now work from the same information/)).toBeInTheDocument();
  expect(screen.getByText(/Alex/)).toBeInTheDocument();
});
