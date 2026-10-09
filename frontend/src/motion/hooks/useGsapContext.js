import { useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "../gsap.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";

export function useGsapContext(scopeRef, setup, dependencies = []) {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion || !scopeRef.current) return undefined;
    const context = gsap.context(
      () => setup({ gsap, ScrollTrigger }),
      scopeRef,
    );
    return () => context.revert();
    // setup is intentionally owned by the caller and captured with explicit dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, scopeRef, ...dependencies]);
}
