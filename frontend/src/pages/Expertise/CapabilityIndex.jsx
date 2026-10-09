import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./CapabilityIndex.module.css";

/*
  Expertise opens on its own table of contents: every discipline as one row
  that draws in on load and fills from the left on hover. It replaces both the
  shared hub hero and the card grid that used to repeat it further down.
*/
export default function CapabilityIndex({ items, locale }) {
  return (
    <ol className={styles.index}>
      {items.map((item, index) => (
        <li key={item.id} className={styles.row} data-reveal="card" style={{ "--i": index + 2 }}>
          <Link to={`/${locale}/expertise/${item.slug}`} className={styles.link}>
            <span className={styles.number}>{item.number ?? String(index + 1).padStart(2, "0")}</span>
            <span className={styles.text}>
              <strong>{item.detailTitle ?? item.title}</strong>
              <span>{item.summary ?? item.description}</span>
            </span>
            <ArrowUpRight className={styles.arrow} size={20} strokeWidth={1.4} aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ol>
  );
}
