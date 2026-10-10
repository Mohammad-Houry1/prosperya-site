import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, vi } from "vitest";
import { websiteApi } from "../src/services/websiteApi.js";
import { cmsLabels } from "./cmsFixtures.js";
beforeEach(() => {
  vi.spyOn(websiteApi, "labels").mockImplementation(async ({ locale }) => ({ data: cmsLabels(locale) }));
});

// jsdom has no matchMedia; GSAP needs one at import. Tests can still stub their own.
if (!window.matchMedia)
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });

afterEach(cleanup);

afterAll(async () => {
  const { ScrollTrigger } = await import("../src/motion/gsap.js");
  ScrollTrigger.disable(true, true);
});
