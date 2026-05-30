import { forwardRef } from "react";
import styles from "./Input.module.css";

export const Input = forwardRef(
  ({ label, error, hint, className, id: propId, ...props }, ref) => {
    // Generate a simple unique id if none provided for a11y linking
    const id = propId || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={[styles.input, error ? styles.hasError : ""].filter(Boolean).join(" ")}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
