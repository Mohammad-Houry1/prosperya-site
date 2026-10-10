import { Quote } from "lucide-react";
import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import Eyebrow from "../common/Eyebrow.jsx";
import CarouselArrows from "../common/CarouselArrows.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import SectionSkeleton from "../feedback/SectionSkeleton.jsx";
import { useCarousel } from "../../motion/gestures.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./CompanyStories.module.css";

/*
  Client perspectives, swipeable everywhere (touch, trackpad, mouse drag).
  `rail`: quote cards bleeding off the right edge (Work).
  `feature`: one large quote at a time with a progress selector (About).
*/
export default function Testimonials({ variant = "feature", data = [], isError, isLoading, refetch }) {
  const { t } = useLocale();

  const carousel = useCarousel();
  if (isError)
    return (
      <Section>
        <ErrorState onRetry={refetch} />
      </Section>
    );
  if (isLoading)
    return (
      <Section>
        <SectionSkeleton rows={2} label={t("components.company.testimonials.loading-testimonials-501f46")} />
      </Section>
    );
  const items = data;
  if (!items.length) return null;
  const label = t("components.company.testimonials.client-testimonials-46561e");
  const arrows = (
    <CarouselArrows
      carousel={carousel}
      labels={[t("components.company.testimonials.previous-testimonial-88596e"), t("components.company.testimonials.next-testimonial-884918")]}
    />
  );
  if (variant === "rail")
    return (
      <Section>
        <div className={styles.railHead}>
          <SectionHeader eyebrow={t("components.company.testimonials.client-perspectives-457ff0")} title={t("components.company.testimonials.outcomes-that-matter-f87211")} />
          {arrows}
        </div>
        <div ref={carousel.ref} className={styles.rail} tabIndex={0} role="region" aria-label={label}>
          {items.map((item, i) => (
            <figure key={item.id} className={styles.quoteCard} data-reveal="card" style={{ "--i": i }}>
              <Quote size={26} strokeWidth={1.2} aria-hidden="true" />
              <blockquote>{item.quote}</blockquote>
              <figcaption>
                <strong>{item.company}</strong>
                <span>
                  {item.role}
                  <br />
                  {item.name}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    );
  return (
    <Section tone="soft">
      <div className={styles.testimonial}>
        <div>
          <Eyebrow>{t("components.company.testimonials.client-perspectives-457ff0")}</Eyebrow>
          <h2>{t("components.company.testimonials.change-is-experienced-81aad7")}</h2>
        </div>
        <div className={styles.featureBody}>
          <div ref={carousel.ref} className={styles.slides} tabIndex={0} role="region" aria-label={label}>
            {items.map((item, i) => (
              <figure key={item.id} className={styles.slide} data-active={i === carousel.active}>
                <blockquote>“{item.quote}”</blockquote>
                <figcaption>
                  <strong>{item.name}</strong>
                  <span>
                    {[item.role, item.company].filter(Boolean).join(" · ")}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className={styles.controlsRow}>
            <div className={styles.controls} role="group" aria-label={t("components.company.testimonials.choose-a-testimonial-3197d0")}>
              {items.map((entry, i) => (
                <button
                  type="button"
                  key={entry.id}
                  aria-pressed={i === carousel.active}
                  aria-label={`${t("components.company.testimonials.testimonial-from-4f2bd1")} ${entry.name}`}
                  onClick={() => carousel.go(i)}
                >
                  <span />
                </button>
              ))}
            </div>
            {arrows}
          </div>
        </div>
      </div>
    </Section>
  );
}
