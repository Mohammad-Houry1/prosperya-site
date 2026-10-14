import styles from "./LayeredArchitecture.module.css";


/*
  The architecture assembles from the ground up: the foundation arrives first,
  then the platform, the solutions and finally the people who use them —
  each layer plugged into the one below.
*/
export default function LayeredArchitecture({ columns = [], titles = [] }) {
  const layers = columns.map((items, index) => [titles[index] || "", items, index]).filter(([, items]) => items.length > 0);
  return (
    <div className={styles.stack}>
      {layers.map(([name, items, layerIndex], index) => (
        <div
          key={layerIndex}
          className={`${styles.layer} ${layerIndex === 2 ? styles.platform : ""}`}
          data-reveal="card"
          style={{ "--i": (layers.length - 1 - index) * 2 }}
        >
          {name && <span className={styles.name}>{name}</span>}
          <ul className={items.length === 1 ? styles.single : undefined}>
            {items.map((label, itemIndex) => (
              <li key={itemIndex}>
                {label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
