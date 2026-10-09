import { Clock3, TriangleAlert } from "lucide-react";
import Section from "../common/Section.jsx";
import SectionHeader from "../common/SectionHeader.jsx";
import Eyebrow from "../common/Eyebrow.jsx";
import PrimaryLink from "../common/PrimaryLink.jsx";
import ProcessPath from "../company/ProcessPath.jsx";
import SystemIcon from "../system/SystemIcon.jsx";
import AnimatedCounter from "../../motion/components/AnimatedCounter.jsx";
import styles from "./DetailSections.module.css";

/*
  Typed content sections for detail pages. Content decides the sequence
  (section.type); each type owns one composition. Adding a type means adding
  one component to SECTIONS — pages never branch on content.
*/

function Phases({ section }) {
  return (
    <Section className={styles.tinted}>
      <SectionHeader eyebrow={section.eyebrow} title={section.title} />
      <ProcessPath steps={section.steps} variant={section.icons ? "line" : "dotted"} />
    </Section>
  );
}

function Services({ section }) {
  return (
    <Section>
      <SectionHeader eyebrow={section.eyebrow} title={section.title} />
      <div className={`${styles.services} ${section.layout === "row" ? styles.row : ""}`}>
        {section.items.map(([icon, title, text], index) => (
          <article key={title} className={styles.service} data-reveal="card" style={{ "--i": index }}>
            <SystemIcon name={icon} size={24} strokeWidth={1.3} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Flow({ section }) {
  const state = (block, future) => (
    <div className={`${styles.stateBox} ${future ? styles.future : ""}`} data-reveal="card" style={{ "--i": future ? 8 : 0 }}>
      <strong>{block.title}</strong>
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
  return (
    <Section>
      <SectionHeader eyebrow={section.eyebrow} title={section.title} />
      <div className={styles.flow}>
        {state(section.current)}
        <ol className={styles.cycle}>
          <li className={styles.loop} aria-hidden="true" data-reveal="line" />
          {section.steps.map(([icon, title, text], index) => (
            <li key={title} className={styles.circle} data-reveal="scale" style={{ "--i": index + 1 }}>
              <SystemIcon name={icon} size={22} strokeWidth={1.3} />
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        {state(section.future, true)}
      </div>
    </Section>
  );
}

function Metrics({ section }) {
  return (
    <Section>
      <SectionHeader eyebrow={section.eyebrow} title={section.title} />
      <div className={styles.metrics} style={{ "--count": section.items.length }}>
        {section.items.map(([value, label, unit], index) => (
          <div key={label} className={styles.metric} data-reveal="card" style={{ "--i": index }}>
            <strong>
              <AnimatedCounter value={value} />
              {unit && <small>{unit}</small>}
            </strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {section.note && <p className={styles.note}>{section.note}</p>}
    </Section>
  );
}

// The partner ecosystem as a grid of categories. Not a Hub: on the pages that
// use this section, the Hero visual already carries the page's one Hub.
function Ecosystem({ section }) {
  return (
    <Section>
      <div className={styles.ecosystem}>
        <div className={styles.ecosystemCopy}>
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </div>
        <div>
          <ul className={styles.ecosystemGrid}>
            {section.groups.map(([category, names], index) => (
              <li key={category} data-reveal="card" style={{ "--i": index }}>
                <span>{category}</span>
                <b>{names.join(", ")}</b>
              </li>
            ))}
          </ul>
          <p className={styles.footnote}>{section.footnote}</p>
        </div>
      </div>
    </Section>
  );
}

function Outcomes({ section, locale }) {
  return (
    <Section className={styles.tinted}>
      <div className={styles.outcomes}>
        <div className={styles.outcomesCopy}>
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
          {section.link && (
            <PrimaryLink to={`/${locale}/${section.link[0]}`} variant="ghost">
              {section.link[1]}
            </PrimaryLink>
          )}
        </div>
        <div className={styles.outcomeCards}>
          {section.items.map(([icon, value, label, text], index) => (
            <article key={label} className={styles.outcome} data-reveal="card" style={{ "--i": index }}>
              <SystemIcon name={icon} size={22} strokeWidth={1.3} />
              <strong>
                <AnimatedCounter value={value} />
              </strong>
              <h3>{label}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
      {section.note && <p className={styles.note}>{section.note}</p>}
    </Section>
  );
}

function Comparison({ section }) {
  const panel = (block, automated) => (
    <div className={`${styles.panel} ${automated ? styles.automated : ""}`} data-reveal="card" style={{ "--i": automated ? 2 : 0 }}>
      <span className={styles.panelTitle}>{block.title}</span>
      <ol>
        {automated && <li className={styles.pulse} aria-hidden="true" />}
        {block.steps.map((step, index) => (
          <li key={step} style={{ "--i": index }}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {step}
            {!automated && index < block.steps.length - 1 && (
              <Clock3 className={styles.wait} size={13} strokeWidth={1.6} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
  return (
    <Section>
      <SectionHeader eyebrow={section.eyebrow} title={section.title} />
      <div className={styles.comparison}>
        {panel(section.before, false)}
        {panel(section.after, true)}
      </div>
    </Section>
  );
}

function Matrix({ section }) {
  return (
    <Section>
      <div className={styles.matrixLayout}>
        <div className={styles.outcomesCopy}>
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </div>
        <figure className={styles.matrix} data-reveal="fade">
          {section.quadrants.map((name, index) => (
            <span key={name} className={styles.quadrant} data-quadrant={index}>
              {name}
            </span>
          ))}
          {section.findings.map(([label, impact, effort], index) => (
            <span
              key={label}
              className={styles.finding}
              data-quick={impact > 0.6 && effort < 0.5}
              style={{ "--x": `${effort * 100}cqw`, "--y": `${(1 - impact) * 100}cqh`, "--i": index }}
            >
              <i aria-hidden="true" />
              {label}
            </span>
          ))}
          <figcaption>
            <span>{section.axes[0]} →</span>
            <span>{section.axes[1]} →</span>
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}

function Signals({ section }) {
  return (
    <Section>
      <SectionHeader eyebrow={section.eyebrow} title={section.title} />
      <ol className={styles.signals}>
        {section.items.map(([title, text], index) => (
          <li key={title}>
            <TriangleAlert size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const SECTIONS = {
  phases: Phases,
  services: Services,
  flow: Flow,
  metrics: Metrics,
  ecosystem: Ecosystem,
  outcomes: Outcomes,
  comparison: Comparison,
  matrix: Matrix,
  signals: Signals,
};

export default function DetailSections({ sections = [], locale }) {
  return sections.map((section, index) => {
    const Component = SECTIONS[section.type];
    return Component ? <Component key={`${section.type}-${index}`} section={section} locale={locale} /> : null;
  });
}
