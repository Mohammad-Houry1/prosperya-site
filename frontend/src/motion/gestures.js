import { useCallback, useEffect, useRef, useState } from "react";

// Left edge of a child inside its scroll container, in scrollLeft units.
const offsetOf = (track, child) =>
  child.getBoundingClientRect().left -
  track.getBoundingClientRect().left +
  track.scrollLeft -
  (parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0);

const clampLeft = (track, left) => Math.max(0, Math.min(left, track.scrollWidth - track.clientWidth));

/*
  Click-and-drag for horizontal scrollers. Touch and trackpads already swipe
  natively; this gives the mouse the same feel: drag, flick, settle on the
  nearest item. A drag never fires the click of the card it ended on.
  Use as a callback ref (React 19 runs the returned cleanup on detach).
*/
export function dragScroll(track) {
  if (!track) return undefined;
  let start = null;
  let moved = false;
  let velocity = 0;
  let last = { x: 0, t: 0 };
  let settleTimer = 0;
  const draggable = () => track.scrollWidth - track.clientWidth > 2;
  const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => track.toggleAttribute("data-draggable", draggable()));
  resize?.observe(track);

  const finish = () => {
    clearTimeout(settleTimer);
    delete track.dataset.dragging;
  };
  const down = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !draggable()) return;
    start = { x: event.clientX, left: track.scrollLeft };
    moved = false;
    velocity = 0;
    last = { x: event.clientX, t: event.timeStamp };
  };
  const move = (event) => {
    if (!start) return;
    const dx = event.clientX - start.x;
    if (!moved) {
      if (Math.abs(dx) < 6) return;
      moved = true;
      finish();
      track.dataset.dragging = "";
      track.setPointerCapture(event.pointerId);
    }
    track.scrollLeft = start.left - dx;
    const dt = Math.max(1, event.timeStamp - last.t);
    velocity = 0.8 * ((event.clientX - last.x) / dt) + 0.2 * velocity;
    last = { x: event.clientX, t: event.timeStamp };
  };
  const up = () => {
    if (!start) return;
    const from = start.left;
    start = null;
    if (!moved) return;
    // Project the flick and land on an item: at most one past where the drag
    // itself ended, and a quick short flick still advances one. Snapping stays
    // off until the glide ends.
    const lefts = [...track.children].map((child) => offsetOf(track, child));
    if (!lefts.length) return finish();
    const nearest = (x) => lefts.reduce((best, left, i) => (Math.abs(left - x) < Math.abs(lefts[best] - x) ? i : best), 0);
    const here = nearest(track.scrollLeft);
    let to = Math.max(here - 1, Math.min(here + 1, nearest(track.scrollLeft - velocity * 260)));
    if (to === nearest(from) && Math.abs(velocity) > 0.3) to += velocity < 0 ? 1 : -1;
    to = Math.max(0, Math.min(lefts.length - 1, to));
    track.scrollTo({ left: clampLeft(track, lefts[to]), behavior: "smooth" });
    track.addEventListener("scrollend", finish, { once: true });
    settleTimer = setTimeout(finish, 900);
  };
  const swallowClick = (event) => {
    if (!moved) return;
    moved = false;
    event.preventDefault();
    event.stopPropagation();
  };
  const noNativeDrag = (event) => event.preventDefault();

  track.addEventListener("pointerdown", down);
  track.addEventListener("pointermove", move);
  track.addEventListener("pointerup", up);
  track.addEventListener("pointercancel", up);
  track.addEventListener("click", swallowClick, true);
  track.addEventListener("dragstart", noNativeDrag);
  return () => {
    finish();
    resize?.disconnect();
    track.removeEventListener("pointerdown", down);
    track.removeEventListener("pointermove", move);
    track.removeEventListener("pointerup", up);
    track.removeEventListener("pointercancel", up);
    track.removeEventListener("click", swallowClick, true);
    track.removeEventListener("dragstart", noNativeDrag);
  };
}

/*
  A draggable track with buttons: `ref` goes on the scroller (its children are
  the items), `step(±1)` moves one item, `active` is the item most in view,
  `edges` disables the buttons at either end.
*/
export function useCarousel() {
  const [track, setTrack] = useState(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const ref = useCallback((node) => {
    setTrack(node);
    return dragScroll(node);
  }, []);
  useEffect(() => {
    if (!track || typeof IntersectionObserver === "undefined") return undefined;
    const items = [...track.children];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(items.indexOf(entry.target));
      },
      { root: track, threshold: 0.6 },
    );
    items.forEach((item) => io.observe(item));
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = track.scrollWidth - track.clientWidth;
        setEdges({ start: track.scrollLeft <= 2, end: track.scrollLeft >= max - 2 });
      });
    };
    measure();
    track.addEventListener("scroll", measure, { passive: true });
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(track);
    return () => {
      io.disconnect();
      resize?.disconnect();
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", measure);
    };
  }, [track]);
  const go = useCallback(
    (index) => {
      const child = track?.children[index];
      if (child) track.scrollTo({ left: clampLeft(track, offsetOf(track, child)), behavior: "smooth" });
    },
    [track],
  );
  const step = useCallback(
    (direction) => {
      if (!track) return;
      const lefts = [...track.children].map((child) => offsetOf(track, child));
      const now = track.scrollLeft;
      const next =
        direction > 0 ? lefts.find((left) => left > now + 4) : lefts.findLast((left) => left < now - 4);
      if (next !== undefined) track.scrollTo({ left: clampLeft(track, next), behavior: "smooth" });
    },
    [track],
  );
  return { ref, active, edges, go, step };
}

/*
  Horizontal swipe on something that is not a scroller (a stage panel):
  mouse drag or touch, 48px and mostly sideways. onSwipe(+1) means "next".
*/
export function useSwipe(onSwipe) {
  const handler = useRef(onSwipe);
  useEffect(() => {
    handler.current = onSwipe;
  });
  return useCallback((node) => {
    if (!node) return undefined;
    let start = null;
    const down = (event) => {
      if (event.button === 0) start = [event.clientX, event.clientY];
    };
    const up = (event) => {
      if (!start) return;
      const dx = event.clientX - start[0];
      const dy = event.clientY - start[1];
      start = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      window.getSelection()?.removeAllRanges();
      handler.current(dx < 0 ? 1 : -1);
    };
    const cancel = () => (start = null);
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", cancel);
    return () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", cancel);
    };
  }, []);
}
