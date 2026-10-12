import { screen } from "@testing-library/react";
import { render } from "../renderWithMantine.jsx";
import { expect, test } from "vitest";
import CollaborationVenn from "../../src/pages/Approach/CollaborationVenn.jsx";

test("collaboration descriptions render sanitized CMS formatting instead of literal tags", () => {
  const { container } = render(<CollaborationVenn nodes={[
    ["Client", '<p>Vision &amp; <strong>decisions</strong></p>'],
    ["Shared", '<p>Shared <em>outcomes</em></p>'],
    ["Value", '<p>Measure &amp; improve</p>'],
    ["Company", '<p>Expertise &amp; execution</p><script>alert(1)</script>'],
  ]} />);
  expect(screen.getByText("decisions").tagName).toBe("STRONG");
  expect(screen.getByText("outcomes").tagName).toBe("EM");
  expect(screen.getByText("Measure & improve")).toBeInTheDocument();
  expect(container.textContent).not.toContain("<p>");
  expect(container.querySelector("script")).toBeNull();
});
