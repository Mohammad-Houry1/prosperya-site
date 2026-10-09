import SystemIcon from "../system/SystemIcon.jsx";
import styles from "./ProcessPath.module.css";

/*
  A horizontal path of stages. The connecting line draws once the path enters
  view, then each stage arrives in sequence. Stacks vertically on phones.
*/
export default function ProcessPath({ steps, variant = "line" }) {
  return (
    <ol
      className={`${styles.path} ${styles[variant] ?? ""}`}
      style={{ "--count": steps.length }}
    >
      <li className={styles.rule} aria-hidden="true" data-reveal="line" />
      {steps.map((step, index) => (
        <li
          key={step.id ?? step.title}
          className={styles.step}
        >
          <span className={styles.marker}>
            {step.icon ? (
              <SystemIcon name={step.icon} size={16} />
            ) : (
              (step.number ?? String(index + 1).padStart(2, "0"))
            )}
          </span>
          <h3>{step.title}</h3>
          {step.description && <p>{step.description}</p>}
        </li>
      ))}
    </ol>
  );
}
