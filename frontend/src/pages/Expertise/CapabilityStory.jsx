import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../../components/common/PageContainer.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import CapabilityStateVisual from "../../components/visuals/CapabilityStateVisual.jsx";
import styles from "./CapabilityStory.module.css";

const VERBS = {
  en: ["Systems reorganize", "Connections appear", "Data starts flowing", "Complexity reduces"],
  fr: ["Les systèmes se réorganisent", "Les connexions apparaissent", "Les données circulent", "La complexité diminue"],
};

/*
  The capability index: four large chapters scroll past one shared visual
  that changes state with the active chapter. The active chapter is whichever
  crosses the viewport's centre line (IntersectionObserver), so it also works
  with reduced motion — the state changes, only the transitions disappear.
*/
export default function CapabilityStory({ items, locale }) {
  const fr = locale === "fr";
  const [active, setActive] = useState(-1);
  const list = useRef(null);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const steps = [...list.current.querySelectorAll("[data-step]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.step));
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, [items]);
  const verbs = VERBS[locale] ?? VERBS.en;
  return (
    <section className={styles.story} aria-labelledby="capability-index">
      <PageContainer className={styles.grid}>
        <div className={styles.aside}>
          <div className={styles.sticky}>
            <div className={styles.heading}>
              <Eyebrow>{fr ? "Quatre disciplines" : "Four disciplines"}</Eyebrow>
              <h2 id="capability-index">
                {fr ? "Une architecture, quatre gestes." : "One architecture. Four moves."}
              </h2>
            </div>
            <div className={styles.visual}>
              <CapabilityStateVisual
                state={active}
                caption={active >= 0 ? verbs[active] : fr ? "Systèmes dispersés" : "Scattered systems"}
              />
            </div>
            <ol className={styles.progress} aria-hidden="true">
              {items.map((item, index) => (
                <li key={item.id} data-active={index === active} data-done={index < active}>
                  <span>{item.number}</span>
                  {verbs[index]}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <ol ref={list} className={styles.steps}>
          {items.map((item, index) => (
            <li key={item.id} data-step={index} data-active={index === active} className={styles.step}>
              <span className={styles.number}>{item.number}</span>
              <h3>{item.title}</h3>
              <p className={styles.kind}>{item.detailTitle}</p>
              <p className={styles.description}>{item.longDescription}</p>
              <ul className={styles.services}>
                {item.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
              <Link to={`/${locale}/expertise/${item.slug}`} className={styles.link}>
                {fr ? "Explorer" : "Explore"} {item.detailTitle}
                <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
