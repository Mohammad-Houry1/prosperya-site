import { expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render } from "../renderWithQueries.jsx";
import { useDocumentMeta } from "../../src/hooks/useDocumentMeta.js";
function Probe() { useDocumentMeta({ title: "Original page", description: "Original description" }); return null; }
test("staging uses local metadata and is not indexable", () => {
  const old = document.createElement("link"); old.rel = "canonical"; old.href = "https://production.test/en"; document.head.append(old);
  render(<MemoryRouter><Probe /></MemoryRouter>);
  expect(document.title).toBe("Original page");
  expect(document.querySelector('meta[name="description"]').content).toBe("Original description");
  expect(document.querySelector('meta[name="robots"]').content).toBe("noindex, nofollow");
  expect(document.querySelector('link[rel="canonical"]')).toBeNull();
});
