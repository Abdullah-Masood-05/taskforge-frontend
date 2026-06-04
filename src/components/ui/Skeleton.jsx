import styles from "./Skeleton.module.css";

/**
 * Shimmer placeholder block. Use while data is loading.
 *
 *   <Skeleton height={20} width="60%" />
 *   <Skeleton height={172} radius="lg" />
 */
export function Skeleton({ width = "100%", height = 16, radius = "md", style, className }) {
  const radiusVar =
    { sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", full: "var(--radius-full)" }[radius] ??
    radius;

  return (
    <div
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      style={{ width, height, borderRadius: radiusVar, ...style }}
      aria-hidden="true"
    />
  );
}

/** A few stacked text lines. */
export function SkeletonText({ lines = 3, gap = 8 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? "70%" : "100%"} />
      ))}
    </div>
  );
}
