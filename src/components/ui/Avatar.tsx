import styles from "./Avatar.module.css";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
];

function colorFromName(name?: string): string {
  if (!name) return COLORS[0];
  const code = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);
  const bg = colorFromName(name);

  return (
    <span
      className={[styles.avatar, styles[size], className ?? ""].filter(Boolean).join(" ")}
      aria-label={name}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? "avatar"} className={styles.image} />
      ) : (
        <span className={styles.initials} style={{ background: bg }}>
          {initials}
        </span>
      )}
    </span>
  );
}
