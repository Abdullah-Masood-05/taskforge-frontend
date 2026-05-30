/**
 * Base API client for TaskForge.
 *
 * Design decisions:
 * - Sends JWT via `Authorization: Bearer <token>` header (not cookies).
 *   Tokens are stored in Zustand + localStorage as a portfolio-acceptable fallback.
 *   In a production-hardened app, httpOnly cookies would be preferred.
 * - Automatically attaches `X-Organization-Slug` from a thread-local context
 *   variable when an org scope is active.
 * - On 401: attempts a single token refresh via /auth/token/refresh/, then retries.
 *   If refresh fails, clears auth state (forces re-login).
 * - Throws typed `ApiError` on all non-2xx responses.
 */
import { ApiError, ApiErrorShape } from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const API_PREFIX = `${API_BASE}/api/v1`;

// Org slug context — set by useOrgContext, read by the client
let _currentOrgSlug: string | null = null;

export function setCurrentOrgSlug(slug: string | null) {
  _currentOrgSlug = slug;
}

// ── Token store accessor ──────────────────────────────────────────────────────
// We import lazily to avoid a circular dependency between client ↔ authStore.
function getTokens(): { access: string | null; refresh: string | null } {
  if (typeof window === "undefined") return { access: null, refresh: null };
  try {
    const raw = localStorage.getItem("taskforge_auth");
    if (!raw) return { access: null, refresh: null };
    const parsed = JSON.parse(raw);
    return {
      access: parsed?.state?.tokens?.access ?? null,
      refresh: parsed?.state?.tokens?.refresh ?? null,
    };
  } catch {
    return { access: null, refresh: null };
  }
}

function clearAuthStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("taskforge_auth");
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** If true, skip Authorization header (for login/register). */
  skipAuth?: boolean;
  /** If true, this is a retry after token refresh — don't retry again. */
  _isRetry?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth = false, _isRetry = false, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (!skipAuth) {
    const { access } = getTokens();
    if (access) {
      headers["Authorization"] = `Bearer ${access}`;
    }
  }

  if (_currentOrgSlug) {
    headers["X-Organization-Slug"] = _currentOrgSlug;
  }

  const url = path.startsWith("http") ? path : `${API_PREFIX}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string> | undefined) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── 401 handling: try to refresh once ────────────────────────────────────
  if (res.status === 401 && !_isRetry && !skipAuth) {
    const { refresh } = getTokens();
    if (refresh) {
      try {
        const refreshRes = await fetch(`${API_PREFIX}/auth/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          // Patch the stored token in localStorage directly
          const raw = localStorage.getItem("taskforge_auth");
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.state.tokens.access = data.access;
            if (data.refresh) parsed.state.tokens.refresh = data.refresh;
            localStorage.setItem("taskforge_auth", JSON.stringify(parsed));
          }
          // Retry the original request once with the new access token
          return request<T>(path, { ...options, _isRetry: true });
        }
      } catch {
        // Refresh request itself failed — fall through to clear auth
      }
    }
    // Refresh failed or no refresh token — force logout
    clearAuthStorage();
    // Dispatch a custom event so the UI can react without a circular import
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("taskforge:auth:expired"));
    }
  }

  // ── Parse response ────────────────────────────────────────────────────────
  // 204 No Content — return null
  if (res.status === 204) {
    return null as T;
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, {
      status: "error",
      code: "parse_error",
      message: `Server returned status ${res.status} with non-JSON body.`,
    });
  }

  if (!res.ok) {
    throw new ApiError(res.status, json as ApiErrorShape);
  }

  return json as T;
}

// ── Exported HTTP helpers ─────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { method: "GET", ...opts }),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: "POST", body, ...opts }),

  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...opts }),

  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: "PUT", body, ...opts }),

  del: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...opts }),
};
