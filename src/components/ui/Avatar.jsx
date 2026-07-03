import styles from "./Avatar.module.css";

export function Avatar({ src, name, size = "md", className }) {
  const classes = [styles.avatar, styles[size], className]
    .filter(Boolean)
    .join(" ");

  // Simple initial generator
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className={classes} aria-label={name}>
      {src ? (
        <img src={src} alt={name || "Avatar"} className={styles.image} />
      ) : (
        <span className={styles.initials}>{initial}</span>
      )}
    </div>
  );
}
