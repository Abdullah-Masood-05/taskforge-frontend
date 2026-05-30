import styles from "./Badge.module.css";

export function Badge({ children, variant = "default", className }) {
  const classes = [styles.badge, styles[variant] || styles.default, className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
