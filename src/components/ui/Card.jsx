import styles from "./Card.module.css";

export function Card({ children, className, hoverable = false }) {
  const classes = [
    styles.card,
    hoverable ? styles.hoverable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}

export function CardHeader({ children, className }) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={[styles.title, className].filter(Boolean).join(" ")}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className }) {
  return (
    <div className={[styles.body, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
