import { Link } from "react-router-dom";
import PageContainer from "./PageContainer.jsx";
import Eyebrow from "./Eyebrow.jsx";
import RevealText from "../../motion/components/RevealText.jsx";
import styles from "./PageHero.module.css";

/*
  Interior-page hero: copy column + a page-specific visual. Pages vary the
  composition through slots (breadcrumb, extra, visual, below) and `layout`:
  split (copy | visual) or stacked (copy over a full-width visual).
*/
export default function PageHero({
  breadcrumb,
  eyebrow,
  title,
  lead,
  actions,
  extra,
  visual,
  below,
  layout = "split",
  className = "",
  titleClassName = "",
}) {
  return (
    <section className={`${styles.hero} ${styles[layout]} ${className}`}>
      <PageContainer className={styles.inner}>
        <div className={styles.copy}>
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
              <ol>
                {breadcrumb.map((item) => (
                  <li key={item.label}>
                    {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {eyebrow && (
            <div>
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
          )}
          <RevealText as="h1" onLoad delay={0.08} className={`${styles.title} ${titleClassName}`}>
            {title}
          </RevealText>
          {lead && (
            <div className={styles.lead}>
              {lead}
            </div>
          )}
          {actions && (
            <div className={styles.actions}>
              {actions}
            </div>
          )}
          {extra && (
            <div className={styles.extra}>
              {extra}
            </div>
          )}
        </div>
        {visual && <div className={styles.visual}>{visual}</div>}
      </PageContainer>
      {below}
    </section>
  );
}
