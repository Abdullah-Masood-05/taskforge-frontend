"use client";

import styles from "./ErrorState.module.css";

/**
 * Consistent error UI. Renders the same shape the API returns
 * ({ code, message }) so boundary errors and API errors look identical.
 *
 * Props:
 *   error  — Error | ApiError-like ({ message, code, status })
 *   onRetry — optional callback; renders a "Try again" button when provided
 *   title  — optional override heading
 *   compact — smaller inline variant (for use inside a page section)
 */
export function ErrorState({ error, onRetry, title, compact = false }) {
  const code = error?.code;
  const status = error?.status;
  const message =
    error?.message || "An unexpected error occurred. Please try again.";

  return (
    <div className={[styles.wrap, compact ? styles.compact : ""].join(" ")} role="alert">
      <div className={styles.iconWrap} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className={styles.title}>{title ?? "Something went wrong"}</h2>
      <p className={styles.message}>{message}</p>

      {(code || status) && (
        <p className={styles.code}>
          {status ? `HTTP ${status}` : null}
          {status && code ? " · " : null}
          {code ? code : null}
        </p>
      )}

      {onRetry && (
        <button className={styles.retry} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
