import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./CarouselArrows.module.css";

// Previous / next for a useCarousel track; disabled at either end.
export default function CarouselArrows({ carousel, labels, className = "" }) {
  return (
    <div className={`${styles.arrows} ${className}`}>
      <button type="button" onClick={() => carousel.step(-1)} disabled={carousel.edges.start} aria-label={labels[0]}>
        <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => carousel.step(1)} disabled={carousel.edges.end} aria-label={labels[1]}>
        <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
