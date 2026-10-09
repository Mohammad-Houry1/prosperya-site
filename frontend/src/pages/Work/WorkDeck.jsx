import { Link } from "react-router-dom";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import styles from "./WorkDeck.module.css";

/*
  The portfolio opens as a hand of cards: stacked on arrival, fanned once the
  page settles, each lifting toward the reader on hover. Every card is a case.
*/
export default function WorkDeck({ studies, locale }) {
  const hand = studies.slice(0, 4);
  const middle = (hand.length - 1) / 2;
  return (
    <div className={styles.deck} data-reveal="fade" style={{ "--i": 2 }}>
      {hand.map((study, index) => {
        const offset = index - middle;
        return (
          <Link
            key={study.id}
            to={`/${locale}/work/${study.slug}`}
            className={styles.card}
            style={{ "--o": offset, "--lift": Math.abs(offset), "--d": `${index * 90 + 260}ms`, zIndex: index + 1 }}
          >
            <span className={styles.face}>
              <span className={styles.media} aria-hidden="true">
                <CaseVisual study={study} sizes="320px" />
              </span>
              <span className={styles.caption}>
                <small>{study.category}</small>
                <strong>{study.name}</strong>
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
