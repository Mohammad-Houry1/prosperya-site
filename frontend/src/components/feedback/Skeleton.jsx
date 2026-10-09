import styles from "./Skeleton.module.css";

export default function Skeleton({ width = "100%", height = 16, className = "" }) {
  return <span aria-hidden="true" className={`${styles.skeleton} ${className}`} style={{ width, height }} />;
}
