import { useMemo, useRef } from "react";
import { useGsapContext } from "./useGsapContext.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";

/*
  Progress for hero metaphors: most of the transformation plays once as the
  page opens (so it is seen), scrolling through the hero completes it.
  Exposed as a stable { current } getter for per-frame renderers.
*/
export function useHeroProgress(sectionRef, { intro = 0.62 } = {}) {
  const reduced = useReducedMotion();
  const opening = useRef({ value: 0 });
  const scrolled = useRef({ value: 0 });
  const progress = useMemo(
    () => ({
      get current() {
        if (reduced) return 1;
        return Math.min(1, opening.current.value * intro + scrolled.current.value * (1 - intro));
      },
    }),
    [reduced, intro],
  );
  useGsapContext(
    sectionRef,
    ({ gsap }) => {
      gsap.to(opening.current, { value: 1, duration: 2.8, delay: 0.35, ease: "inOut" });
      gsap.to(scrolled.current, {
        value: 1,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom 15%", scrub: 0.6 },
      });
    },
    [],
  );
  return progress;
}
