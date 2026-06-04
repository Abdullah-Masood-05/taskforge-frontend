"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

/**
 * Dashboard-segment error boundary. Sits below the dashboard layout, so the
 * sidebar/topbar shell stays intact while just the page content shows the error.
 */
export default function DashboardError({ error, reset, unstable_retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = unstable_retry || reset;

  return <ErrorState error={error} onRetry={retry} />;
}
