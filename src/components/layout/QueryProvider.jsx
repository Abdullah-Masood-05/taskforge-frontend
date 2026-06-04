"use client";

import {
  QueryCache,
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/lib/store/toastStore";

/**
 * Turn any thrown error into a user-facing toast.
 *
 * - 401s are swallowed: the API client already handles token refresh and, on
 *   failure, dispatches `taskforge:auth:expired` to force re-login. Toasting
 *   them would be noise.
 * - ApiError carries our standard { code, message } shape from the backend's
 *   custom exception handler, so we surface `message` directly.
 */
function notifyError(error) {
  if (error instanceof ApiError) {
    // Auth expiry is handled by the client (refresh + redirect).
    if (error.status === 401) return;
    // Field validation errors are rendered inline on forms — don't duplicate.
    if (error.status === 400 && error.errors && Object.keys(error.errors).length) return;
    toast.error(error.message || "Request failed", error.code ? `Code: ${error.code}` : undefined);
    return;
  }
  toast.error("Something went wrong", error?.message);
}

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Global handlers fire for every query/mutation that errors, so feature
        // code doesn't need per-call error toasts. A mutation/query can opt out
        // of the toast by setting `meta: { skipGlobalError: true }`.
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.skipGlobalError) return;
            notifyError(error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) => {
            if (mutation.meta?.skipGlobalError) return;
            notifyError(error);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
