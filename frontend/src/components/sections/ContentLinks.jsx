import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import Section from "../common/Section.jsx";
import styles from "./MarketingSections.module.css";
export default function ContentLinks({ title, items = [], field, route }) {
  const { locale } = useLocale();
  if (!items.length) return null;
  return <Section><h2>{title}</h2><ul className={styles.links}>{items.map(item => <li key={item.id}><Link to={`/${locale}/${route}/${encodeURIComponent(item.slug)}`}>{item[field]}</Link></li>)}</ul></Section>;
}
