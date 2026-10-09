import { Compass, PlugZap, Sparkles } from "lucide-react";
import styles from "./ConnectionIllustration.module.css";

export default function ConnectionIllustration({ compact = false }) {
  return (
    <div className={`${styles.illustration} ${compact ? styles.compact : ""}`} aria-hidden="true">
      <div className={styles.halo} />
      <div className={styles.buddy}>
        <svg viewBox="0 0 144 144" fill="none">
          <path d="M72 34V23M35 94L25 89M109 94L119 89" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="72" cy="18" r="5" className={styles.antenna} />
          <rect x="35" y="36" width="74" height="79" rx="25" className={styles.face} stroke="currentColor" strokeWidth="2.5" />
          <path d="M47 110L45 123M97 110L99 123" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <g className={styles.eyes}>
            <circle cx="57" cy="70" r="4" fill="currentColor" />
            <circle cx="87" cy="70" r="4" fill="currentColor" />
          </g>
          <path d="M61 85Q72 98 83 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="48" cy="83" r="5" className={styles.cheek} />
          <circle cx="96" cy="83" r="5" className={styles.cheek} />
        </svg>
      </div>
      <span className={`${styles.satellite} ${styles.plug}`}><PlugZap size={24} strokeWidth={1.6} /></span>
      <span className={`${styles.satellite} ${styles.compass}`}><Compass size={22} strokeWidth={1.6} /></span>
      <Sparkles className={styles.sparkles} size={23} strokeWidth={1.5} />
    </div>
  );
}
