import styles from "./PageContainer.module.css";
export default function PageContainer({
  children,
  narrow = false,
  className = "",
}) {
  return (
    <div
      className={`${styles.container} ${narrow ? styles.narrow : ""} ${className}`}
    >
      {children}
    </div>
  );
}
