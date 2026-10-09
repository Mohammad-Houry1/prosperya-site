import { useEffect } from "react";

/*
  One observer for every [data-reveal] element under the root, including
  elements mounted later (lazy routes, filters). Each reveals once.
*/
export function useRevealObserver(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const pending = "[data-reveal]:not([data-inview])";
    if (typeof IntersectionObserver === "undefined") {
      root
        .querySelectorAll(pending)
        .forEach((node) => node.setAttribute("data-inview", ""));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Already scrolled past (restored scroll, jump links): show it, don't wait for a scroll back up.
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) continue;
          entry.target.setAttribute("data-inview", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -9% 0px" },
    );
    const observe = (node) => {
      if (node.nodeType !== 1) return;
      if (node.matches(pending)) io.observe(node);
      node.querySelectorAll(pending).forEach((child) => io.observe(child));
    };
    observe(root);
    const mo = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach(observe)),
    );
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [rootRef]);
}
