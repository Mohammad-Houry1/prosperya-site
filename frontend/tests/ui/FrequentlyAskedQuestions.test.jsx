import { fireEvent, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { render } from "../renderWithQueries.jsx";
import FrequentlyAskedQuestions from "../../src/components/company/FrequentlyAskedQuestions.jsx";

test("renders formatted split-record questions and their separate answers without executable markup", () => {
  const { container } = render(<FrequentlyAskedQuestions data={[{
    id: "question", question: '<p>How do <strong>we work</strong>?</p><script>bad()</script>',
    answer: '<p>We start with <em>discovery</em>.</p><img src="/diagram.svg" onerror="bad()">',
  }]} />);
  const question = screen.getByRole("button", { name: /How do we work\s*\?/ });
  expect(screen.getByText("we work").tagName).toBe("STRONG");
  expect(question.querySelector("p, script")).toBeNull();
  fireEvent.click(question);
  expect(screen.getByText("discovery").tagName).toBe("EM");
  expect(container.querySelector("script, [onerror]")).toBeNull();
});
