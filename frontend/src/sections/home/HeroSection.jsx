import { useRef } from "react";
import PageContainer from "../../components/common/PageContainer.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import OrchestrationExperience from "../../components/system/OrchestrationExperience.jsx";
import SystemIcon from "../../components/system/SystemIcon.jsx";
import RevealText from "../../motion/components/RevealText.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useGsapContext } from "../../motion/hooks/useGsapContext.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { heroCopy } from "./heroStory.copy.js";
import styles from "./HomeHero.module.css";

const ORCHESTRATED_VIEW = { tilt: 0, zoom: 0.12, yaw: 0 };

/*
  Home Hero: one screen, never pinned (docs/adr/0001-no-repeat-rules.md).
  The claim sits beside the Hub. On load the Hub settles once from fragmented
  to orchestrated (under five seconds), then drifts gently while its systems
  keep pulsing. Reduced motion starts on the finished, still frame.
*/
export default function HeroSection() {
  const { locale } = useLocale();
  const copy = heroCopy[locale] ?? heroCopy.en;
  const reduced = useReducedMotion();
  const section = useRef(null);
  const progress = useRef(reduced ? 1 : 0);
  const view = useRef(reduced ? { ...ORCHESTRATED_VIEW } : { tilt: -0.36, zoom: 0, yaw: 0.14 });
  const layout = useRef({ left: 0.06, right: 0.94 });

  useGsapContext(
    section,
    ({ gsap }) => {
      const q = gsap.utils.selector(section.current);
      gsap
        .timeline({ delay: 0.4, defaults: { ease: "inOut" } })
        .to(progress, { current: 1, duration: 3.4 }, 0)
        .to(view.current, { ...ORCHESTRATED_VIEW, duration: 3.4 }, 0)
        .to(q("[data-status='before']"), { autoAlpha: 0, duration: 0.3 }, 2.9)
        .fromTo(q("[data-status='after']"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 3.1)
        .to(section.current, { "--resolve": 1, duration: 0.5 }, 3)
        // After the settle, a slow camera drift keeps the scene alive.
        .to(view.current, { yaw: 0.07, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 }, "+=0.2");
    },
    [],
  );

  return (
    <section ref={section} className={`${styles.hero} ${reduced ? styles.resolved : ""}`}>
      <PageContainer className={styles.inner}>
        <div className={styles.copy}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <RevealText as="h1" onLoad delay={0.1} className={styles.title}>
            {copy.lines[0]}
            <span className={styles.claimEnd}>{copy.lines[1]}</span>
          </RevealText>
          <p className={styles.lead}>{copy.lead}</p>
          <div className={styles.actions}>
            <PrimaryLink to={`/${locale}/approach`}>{copy.primary}</PrimaryLink>
            <PrimaryLink to={`/${locale}/contact`} variant="ghost">
              {copy.secondary}
            </PrimaryLink>
          </div>
          <div className={styles.audiences}>
            <span>{copy.audienceLabel}</span>
            <ul>
              {copy.audiences.map(([icon, label]) => (
                <li key={label}>
                  <SystemIcon name={icon} size={15} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.visual}>
            <OrchestrationExperience progressRef={progress} viewRef={view} layoutRef={layout} />
          </div>
          <div className={styles.status} aria-hidden="true">
            <span data-status="before" className={reduced ? styles.gone : ""}>
              <i />
              {copy.status[0]}
            </span>
            <span data-status="after" className={reduced ? "" : styles.statusAfter}>
              <i />
              {copy.status[1]}
            </span>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
