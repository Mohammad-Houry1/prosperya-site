import styles from "./SectionSkeleton.module.css";
export default function SectionSkeleton({ rows = 3 }) {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.row} />
      ))}
    </div>
  );
}
