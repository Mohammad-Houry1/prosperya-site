import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./PrimaryLink.module.css";
export default function PrimaryLink({
  to,
  children,
  variant = "solid",
  className = "",
  ...rest
}) {
  return (
    <Link
      className={`${styles.link} ${styles[variant]} ${className}`}
      to={to}
      {...rest}
    >
      <span>{children}</span>
      <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
    </Link>
  );
}
