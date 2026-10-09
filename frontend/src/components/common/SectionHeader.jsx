import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Eyebrow from "./Eyebrow.jsx";
import styles from "./SectionHeader.module.css";
export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  as: Heading = "h2",
}) {
  return (
    <header className={`${styles.header} ${styles[align]}`}>
      <div className={styles.copy}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading>{title}</Heading>
        {description && align !== "split" && <p>{description}</p>}
      </div>
      {description && align === "split" && (
        <p className={styles.aside}>{description}</p>
      )}
      {action && (
        <Link className={styles.action} to={action.to}>
          {action.label}
          <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
        </Link>
      )}
    </header>
  );
}
