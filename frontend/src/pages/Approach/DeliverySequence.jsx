import { useEffect, useRef, useState } from "react";
import PageContainer from "../../components/common/PageContainer.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import SystemIcon from "../../components/system/SystemIcon.jsx";
import SignalWave from "../../components/visuals/SignalWave.jsx";
import { useGsapContext } from "../../motion/hooks/useGsapContext.js";
import { dragScroll, useSwipe } from "../../motion/gestures.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import styles from "./DeliverySequence.module.css";

/*
  The methodology as one continuous path. On large screens the section pins
  and scrolling walks the path: the line fills, each stage takes its turn and
  the light field beside it moves from tangled to structured. Everywhere the
  stages stay real buttons, with previous/next controls and a sideways swipe
  on the panel, so the path is fully usable by keyboard, touch and mouse.
*/
export default function DeliverySequence({ steps, locale }) {
  const fr = locale === "fr";
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 981px)");
  const pinned = wide && !reduced;
  const [index, setIndex] = useState(0);
  const section = useRef(null);
  const trigger = useRef(null);
  const fill = useRef(null);
  const progress = useRef(1 / steps.length);
  const active = steps[index];
  // Swipe the stage panel (touch or mouse drag) to walk the path.
  const swipe = useSwipe((direction) => go(index + direction));

  useGsapContext(
    section,
    ({ ScrollTrigger }) => {
      if (!pinned) return;
      trigger.current = ScrollTrigger.create({
        trigger: section.current,
        start: "top top+=64",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          progress.current = Math.max(0.04, self.progress);
          if (fill.current) fill.current.style.transform = `scaleX(${self.progress})`;
          setIndex(Math.min(steps.length - 1, Math.floor(self.progress * steps.length)));
        },
      });
    },
    [pinned, steps.length],
  );
  // Without the pinned scroll, the chosen stage drives the path and the field.
  useEffect(() => {
    if (pinned) return;
    progress.current = (index + 1) / steps.length;
    if (fill.current) fill.current.style.transform = `scaleX(${index / Math.max(1, steps.length - 1)})`;
  }, [index, pinned, steps.length]);

  const go = (next) => {
    const target = Math.max(0, Math.min(steps.length - 1, next));
    const st = trigger.current;
    if (pinned && st) {
      window.scrollTo({ top: st.start + ((st.end - st.start) * (target + 0.5)) / steps.length });
    } else setIndex(target);
  };

  return (
    <section
      ref={section}
      className={`${styles.path} ${pinned ? styles.pinned : ""}`}
      style={pinned ? { "--stages": steps.length } : undefined}
      aria-labelledby="methodology-title"
    >
      <div className={styles.stage}>
        <PageContainer>
          <header className={styles.header}>
            <div>
              <Eyebrow>{fr ? "Notre méthode" : "Our methodology"}</Eyebrow>
              <h2 id="methodology-title">
                {fr ? "De la stratégie à la valeur durable." : "From strategy to sustained value."}
              </h2>
            </div>
            <p>
              {fr
                ? "Une méthode structurée et itérative pour réduire le risque, accélérer la livraison et garantir une adoption durable."
                : "A structured, iterative methodology designed to reduce risk, accelerate delivery and ensure lasting adoption."}
            </p>
          </header>
          <div className={styles.rail}>
            <div className={styles.track} aria-hidden="true">
              <i ref={fill} />
            </div>
            <div ref={dragScroll} className={styles.steps} role="group" aria-label={fr ? "Étapes de transformation" : "Transformation stages"}>
              {steps.map((step, i) => (
                <button
                  type="button"
                  key={step.id}
                  aria-pressed={i === index}
                  aria-controls="delivery-stage"
                  data-done={i < index}
                  onClick={() => go(i)}
                >
                  <span className={styles.icon}>
                    <SystemIcon name={step.icon} size={20} strokeWidth={1.4} />
                  </span>
                  <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
                  {step.title}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.detail}>
            <div className={styles.field} aria-hidden="true">
              <SignalWave shape="structure" progressRef={progress} strands={34} particles={220} />
            </div>
            {active && (
              <div ref={swipe} className={styles.panel} id="delivery-stage" aria-live="polite">
                <span className={styles.big} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div key={active.id} className={styles.panelBody}>
                  <h2>{active.title}</h2>
                  <p>{active.description}</p>
                  {active.activities && (
                    <ul>
                      {active.activities.map((activity) => (
                        <li key={activity}>{activity}</li>
                      ))}
                    </ul>
                  )}
                  {active.deliverable && (
                    <p className={styles.deliverable}>
                      <span>{fr ? "Livrable" : "Hand-over"}</span>
                      {active.deliverable}
                    </p>
                  )}
                  <div className={styles.controls}>
                    <button type="button" disabled={index === 0} onClick={() => go(index - 1)} aria-label={fr ? "Étape précédente" : "Previous stage"}>
                      ←
                    </button>
                    <span>
                      {index + 1} / {steps.length}
                    </span>
                    <button
                      type="button"
                      disabled={index === steps.length - 1}
                      onClick={() => go(index + 1)}
                      aria-label={fr ? "Étape suivante" : "Next stage"}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PageContainer>
      </div>
    </section>
  );
}
