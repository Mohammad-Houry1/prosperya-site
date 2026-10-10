import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import WorkDeck from "../../src/pages/Work/WorkDeck.jsx";

vi.mock("../../src/components/case-study/CaseVisual.jsx", () => ({ default: () => <div /> }));
const studies = Array.from({ length: 4 }, (_, i) => ({ id: `project-${i}`, slug: `project-${i}`, name: `Project ${i + 1}`, category: "Retail" }));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const show = (locale = "en") => render(<MemoryRouter><LocaleContext.Provider value={cmsLocale(locale)}><WorkDeck studies={studies} locale={locale} /></LocaleContext.Provider></MemoryRouter>);
const advance = () => act(() => vi.advanceTimersByTime(5000));
const selected = () => screen.getAllByRole("button", { pressed: true })[0];

test("the spotlight advances through every project and loops back to the first", () => {
  vi.useFakeTimers();
  show();
  for (let i = 0; i < 4; i++) {
    expect(selected()).toHaveAccessibleName(`Project ${i + 1}`);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    advance();
  }
  expect(selected()).toHaveAccessibleName("Project 1");
});

test("hover, keyboard focus and the pause button stop rotation; manual selection resets the timer", () => {
  vi.useFakeTimers();
  const { container } = show();
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
  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  advance();
  expect(selected()).toHaveAccessibleName("Project 4");
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  advance();
  expect(selected()).toHaveAccessibleName("Project 1");
});

test("reduced motion keeps automatic rotation off while allowing manual selection", () => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  show("fr");
  advance();
  expect(selected()).toHaveAccessibleName("Project 1");
  expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Project 4" }));
  expect(selected()).toHaveAccessibleName("Project 4");
});
