import styles from "./CollaborationVenn.module.css";

/*
  The collaboration model as two circles that meet: client leadership on one
  side, Prosperya on the other. On reveal they slide together, the shared
  goals in the overlap light up, and a return arc draws the continuous-value
  loop beneath. nodes: [[title, sub] × 4] in the order client, shared,
  continuous, Prosperya (approach.copy.js).
*/
export default function CollaborationVenn({ nodes }) {
  const [client, shared, loop, prosperya] = nodes;
  const label = ([title, sub], className) => (
    <div className={`${styles.label} ${className}`}>
      <strong>{title}</strong>
      <span>{sub}</span>
    </div>
  );
  return (
    <figure className={styles.venn} data-reveal="fade">
      <svg viewBox="0 0 440 340" aria-hidden="true">
        <defs>
          <clipPath id="venn-left">
            <circle cx="165" cy="140" r="118" />
          </clipPath>
        </defs>
        <g className={styles.left}>
          <circle cx="165" cy="140" r="118" />
        </g>
        <g className={styles.right}>
          <circle cx="275" cy="140" r="118" />
        </g>
        <circle cx="275" cy="140" r="118" clipPath="url(#venn-left)" className={styles.lens} />
        <path d="M112 246 C150 322 290 322 328 246" pathLength="1" className={styles.arc} />
        <path d="M321 252 L328 246 L331 255" className={styles.arrowHead} />
      </svg>
      {label(client, styles.client)}
      {label(shared, styles.shared)}
      {label(prosperya, styles.prosperya)}
      {label(loop, styles.loop)}
    </figure>
  );
}
