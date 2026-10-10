import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import WorkDeck from "../../src/pages/Work/WorkDeck.jsx";

vi.mock("../../src/components/case-study/CaseVisual.jsx", () => ({ default: () => <div /> }));
const studies = Array.from({ length: 4 }, (_, i) => ({ id: `project-${i}`, slug: `project-${i}`, name: `Project ${i + 1}`, category: "Retail" }));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const advance = () => act(() => vi.advanceTimersByTime(5000));
const selected = () => screen.getAllByRole("button", { pressed: true })[0];

test("the spotlight advances through every project and loops back to the first", () => {
  vi.useFakeTimers();
  render(<MemoryRouter><WorkDeck studies={studies} locale="en" /></MemoryRouter>);
  for (let i = 0; i < 4; i++) {
    expect(selected()).toHaveAccessibleName(`Project ${i + 1}`);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    advance();
  }
  expect(selected()).toHaveAccessibleName("Project 1");
});

test("hover, keyboard focus and the pause button stop rotation; manual selection resets the timer", () => {
  vi.useFakeTimers();
  const { container } = render(<MemoryRouter><WorkDeck studies={studies} locale="en" /></MemoryRouter>);
  fireEvent.mouseEnter(container.firstChild);
  advance();
  expect(selected()).toHaveAccessibleName("Project 1");
  fireEvent.mouseLeave(container.firstChild);
  fireEvent.focus(screen.getByRole("button", { name: "Project 3" }));
  advance();
  expect(selected()).toHaveAccessibleName("Project 1");
  fireEvent.blur(container.firstChild, { relatedTarget: null });
  act(() => vi.advanceTimersByTime(4000));
  fireEvent.click(screen.getByRole("button", { name: "Project 3" }));
  act(() => vi.advanceTimersByTime(1000));
  expect(selected()).toHaveAccessibleName("Project 3");
  advance();
  expect(selected()).toHaveAccessibleName("Project 4");
  fireEvent.click(screen.getByRole("button", { name: "Pause slideshow" }));
  advance();
  expect(selected()).toHaveAccessibleName("Project 4");
  fireEvent.click(screen.getByRole("button", { name: "Resume slideshow" }));
  advance();
  expect(selected()).toHaveAccessibleName("Project 1");
});

test("reduced motion keeps automatic rotation off while allowing manual selection", () => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  render(<MemoryRouter><WorkDeck studies={studies} locale="fr" /></MemoryRouter>);
  advance();
  expect(selected()).toHaveAccessibleName("Project 1");
  expect(screen.queryByRole("button", { name: "Mettre en pause" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Project 4" }));
  expect(selected()).toHaveAccessibleName("Project 4");
});
