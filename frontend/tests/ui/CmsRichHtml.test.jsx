import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import CmsRichHtml from "../../src/components/common/CmsRichHtml.jsx";

test("keeps editorial HTML and removes executable markup", () => {
  const { container } = render(<CmsRichHtml html={'<p>Hello <strong>world</strong></p><script>alert(1)</script><img src=x onerror="alert(2)" />'} />);
  expect(screen.getByText("world")).toBeInTheDocument();
  expect(container.querySelector("script")).toBeNull();
  expect(container.querySelector("img")).not.toHaveAttribute("onerror");
});

test("CMS images load lazily and preserve supplied alt text or use the content context", () => {
  const { container } = render(<CmsRichHtml imageAlt="ERP integration diagram" html={'<img src="/one.png" alt="Finance dashboard"><img src="/two.png">'} />);
  const images = [...container.querySelectorAll("img")];
  expect(images.every((image) => image.getAttribute("loading") === "lazy")).toBe(true);
  expect(images.map((image) => image.alt)).toEqual(["Finance dashboard", "ERP integration diagram"]);
});
