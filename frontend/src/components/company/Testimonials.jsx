import { Quote } from "lucide-react";
import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import Eyebrow from "../common/Eyebrow.jsx";
import CarouselArrows from "../common/CarouselArrows.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import { useCompanyStories } from "../../queries/useCompanyStories.js";
import { useCarousel } from "../../motion/gestures.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./CompanyStories.module.css";

/*
  Client perspectives, swipeable everywhere (touch, trackpad, mouse drag).
  `rail`: quote cards bleeding off the right edge (Work).
  `feature`: one large quote at a time with a progress selector (About).
  Demo content is always labelled as fictional.
*/
export default function Testimonials({ variant = "feature" }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const query = useCompanyStories(locale);
  const carousel = useCarousel();
  if (query.isError)
    return (
      <Section>
        <ErrorState onRetry={query.refetch} />
      </Section>
    );
  if (query.isLoading)
    return (
      <Section>
        <div className={styles.placeholder} aria-busy="true" aria-label={fr ? "Chargement des témoignages" : "Loading testimonials"} />
      </Section>
    );
  const items = query.data.testimonials;
  if (!items.length) return null;
  const demo = query.data.isDemo && (
    <p className={styles.demo}>{fr ? "Témoignages fictifs pour démonstration." : "Fictional testimonials for demonstration."}</p>
  );
  const label = fr ? "Témoignages clients" : "Client testimonials";
  const arrows = (
    <CarouselArrows
      carousel={carousel}
      labels={fr ? ["Témoignage précédent", "Témoignage suivant"] : ["Previous testimonial", "Next testimonial"]}
    />
  );
  if (variant === "rail")
    return (
      <Section>
        <div className={styles.railHead}>
          <SectionHeader eyebrow={fr ? "Regards clients" : "Client perspectives"} title={fr ? "Des résultats qui comptent." : "Outcomes that matter."} />
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
        {demo}
      </Section>
    );
  return (
    <Section tone="soft">
      <div className={styles.testimonial}>
        <div>
          <Eyebrow>{fr ? "Regards clients" : "Client perspectives"}</Eyebrow>
          <h2>{fr ? "Le changement se vit." : "Change is experienced."}</h2>
          {demo}
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
            <div className={styles.controls} role="group" aria-label={fr ? "Choisir un témoignage" : "Choose a testimonial"}>
              {items.map((entry, i) => (
                <button
                  type="button"
                  key={entry.id}
                  aria-pressed={i === carousel.active}
                  aria-label={`${fr ? "Témoignage de" : "Testimonial from"} ${entry.name}`}
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
