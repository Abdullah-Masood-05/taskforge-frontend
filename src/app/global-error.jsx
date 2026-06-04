"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import "./globals.css";

/**
 * Last-resort boundary for errors thrown in the root layout itself.
 * Must render its own <html>/<body> because it replaces the root layout.
 */
export default function GlobalError({ error, reset, unstable_retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = unstable_retry || reset;

  return (
    <html lang="en">
      <body className="antialiased">
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ErrorState
            error={error}
            onRetry={retry}
            title="Application error"
          />
        </main>
      </body>
    </html>
  );
}
