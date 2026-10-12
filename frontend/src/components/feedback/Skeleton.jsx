import { Skeleton as MantineSkeleton } from "@mantine/core";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import styles from "./Skeleton.module.css";

export default function Skeleton({ width = "100%", height = 16, className = "" }) {
  const reducedMotion = useReducedMotion();
  return <MantineSkeleton component="span" aria-hidden="true" width={width} height={height} radius="var(--radius-sm)" animate={!reducedMotion} className={`${styles.skeleton} ${className}`} />;
}
