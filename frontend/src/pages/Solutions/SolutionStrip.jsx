import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SolutionMetaphor from "../../components/visuals/SolutionMetaphor.jsx";
import { gsap } from "../../motion/gsap.js";
import { dragScroll } from "../../motion/gestures.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import styles from "./SolutionStrip.module.css";

const RESTING = 0.18;

/*
  Four business functions as one strip. The focused panel widens and its
  metaphor resolves from scattered to orchestrated; the others rest mid-chaos.
  Phones get a swipeable row with every scene resolved.
*/
export default function SolutionStrip({ items, locale }) {
  const reduced = useReducedMotion();
  const phone = useMediaQuery("(max-width: 767px)");
  const [active, setActive] = useState(items[0]?.id);
  const progress = useMemo(() => Object.fromEntries(items.map((item) => [item.id, { current: RESTING }])), [items]);
  useEffect(() => {
    for (const item of items) {
      const target = phone || item.id === active ? 1 : RESTING;
      if (reduced) progress[item.id].current = target;
      else gsap.to(progress[item.id], { current: target, duration: 1.6, ease: "inOut", overwrite: true });
    }
  }, [active, items, phone, progress, reduced]);
  return (
    <ul ref={dragScroll} className={styles.strip}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className={styles.panel}
          data-active={item.id === active}
          data-reveal="image"
          style={{ "--i": index + 3 }}
          onPointerEnter={() => setActive(item.id)}
          onFocus={() => setActive(item.id)}
        >
          <Link to={`/${locale}/solutions/${item.slug}`} className={styles.link}>
            <span className={styles.scene} aria-hidden="true" data-reveal-media>
              <SolutionMetaphor variant={item.metaphor} progressRef={progress[item.id]} />
            </span>
            <span className={styles.copy}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
              <span className={styles.tagline}>{item.tagline}</span>
              <ArrowRight className={styles.arrow} size={18} strokeWidth={1.5} aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
