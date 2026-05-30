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
 * - Throws `ApiError` on all non-2xx responses.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const API_PREFIX = `${API_BASE}/api/v1`;

// Org slug context — set by useOrgContext, read by the client
let _currentOrgSlug = null;

export function setCurrentOrgSlug(slug) {
  _currentOrgSlug = slug;
}

// ── Token store accessor ──────────────────────────────────────────────────────
// We import lazily to avoid a circular dependency between client ↔ authStore.
function getTokens() {
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

// ── API Error Class ───────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(httpStatus, shape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = httpStatus;
    this.code = shape.code;
    this.errors = shape.errors;
  }

  /** Returns the first field-level error message for a given field name. */
  fieldError(field) {
    const val = this.errors?.[field];
    if (!val) return undefined;
    return Array.isArray(val) ? val[0] : val;
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const { body, skipAuth = false, _isRetry = false, ...rest } = options;

  const headers = {
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
    headers: { ...headers, ...rest.headers },
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
          return request(path, { ...options, _isRetry: true });
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
    return null;
  }

  let json;
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
    throw new ApiError(res.status, json);
  }

  return json;
}

// ── Exported HTTP helpers ─────────────────────────────────────────────────────
export const apiClient = {
  get: (path, opts) => request(path, { method: "GET", ...opts }),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  patch: (path, body, opts) => request(path, { method: "PATCH", body, ...opts }),
  put: (path, body, opts) => request(path, { method: "PUT", body, ...opts }),
  del: (path, opts) => request(path, { method: "DELETE", ...opts }),
};
