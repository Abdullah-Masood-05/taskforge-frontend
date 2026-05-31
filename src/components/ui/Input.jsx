import { forwardRef, useId } from "react";
import styles from "./Input.module.css";

export const Input = forwardRef(
  ({ label, error, hint, className, id: propId, ...props }, ref) => {
    // useId() is SSR-safe — produces the same ID on server and client
    const reactId = useId();
    const id = propId || reactId;

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
