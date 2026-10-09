import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import Testimonials from "../../src/components/company/Testimonials.jsx";
import { createTranslator } from "../../src/i18n/labels.js";

test.each(["feature", "rail"])("renders a CMS testimonial array in the %s layout", (variant) => {
  render(
    <LocaleContext.Provider value={{ locale: "en", t: createTranslator("en") }}>
      <Testimonials variant={variant} data={[{
        id: "cms-1", quote: "Our teams now work from the same information.",
        name: "Alex", role: "Operations", company: "Example",
      }]} />
    </LocaleContext.Provider>,
  );
  expect(screen.getByText(/Our teams now work from the same information/)).toBeInTheDocument();
  expect(screen.getByText(/Alex/)).toBeInTheDocument();
});
