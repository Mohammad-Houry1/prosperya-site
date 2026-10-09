import { useEffect, useRef } from "react";
import styles from "./ArticlePage.module.css";
export default function ReadingProgress({ articleRef }) {
  const ref = useRef(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = articleRef.current;
      if (!article || !ref.current) return;
      const box = article.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(
          0,
          (window.innerHeight - box.top) /
            Math.max(1, box.height + window.innerHeight),
        ),
      );
      ref.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [articleRef]);
  return (
    <div className={styles.progress} aria-hidden="true">
      <span ref={ref} />
    </div>
  );
}
