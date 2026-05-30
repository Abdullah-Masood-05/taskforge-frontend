"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useRef } from "react";

/**
 * Wraps the app in a TanStack Query provider.
 * Created client-side to avoid hydration issues with SSR.
 * QueryClient is created once and reused across the session.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,        // 30s before refetch on focus
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
