"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

/**
 * Route-segment error boundary. Catches render/runtime errors below the root
 * layout and shows the shared ErrorState UI.
 *
 * Next 16.2 forwards `unstable_retry`; older builds use `reset`. We accept both.
 */
export default function Error({ error, reset, unstable_retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = unstable_retry || reset;

  return <ErrorState error={error} onRetry={retry} />;
}
