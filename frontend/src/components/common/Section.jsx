import PageContainer from "./PageContainer.jsx";
import styles from "./Section.module.css";
export default function Section({
  children,
  id,
  className = "",
  contained = true,
  narrow = false,
  tone = "default",
}) {
  const content = contained ? (
    <PageContainer narrow={narrow}>{children}</PageContainer>
  ) : (
    children
  );
  return (
    <section
      id={id}
      className={`${styles.section} ${styles[tone] ?? ""} ${className}`}
    >
      {content}
    </section>
  );
}
