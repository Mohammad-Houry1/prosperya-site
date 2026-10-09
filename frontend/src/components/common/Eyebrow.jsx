import styles from "./Eyebrow.module.css";
export default function Eyebrow({ children }) {
  return <div className={styles.eyebrow}>{children}</div>;
}
