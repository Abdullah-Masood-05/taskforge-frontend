/**
 * Zustand auth store.
 *
 * Design decision (noted per project brief):
 * Tokens are persisted to localStorage under the key "taskforge_auth".
 * This is the accepted portfolio-project trade-off for UX (survive page refresh)
 * vs. the production-hardened approach of httpOnly cookies.
 * The localStorage key is namespaced to avoid collisions.
 *
 * A lightweight non-sensitive cookie "taskforge_authenticated" is also set so
 * Next.js Edge Middleware can check auth state without accessing localStorage.
 *
 * Zustand owns WHO the user is.
 * TanStack Query owns WHAT data is on screen.
 * These two concerns never cross.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Cookie helpers for middleware visibility ──────────────────────────────────
function setAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "taskforge_authenticated=1; path=/; SameSite=Lax";
  }
}

function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie =
      "taskforge_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        setAuthCookie();
        set({ user, tokens, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      setTokens: (tokens) => set({ tokens }),

      clearAuth: () => {
        clearAuthCookie();
        set({ user: null, tokens: null, isAuthenticated: false });
      },
    }),
    {
      name: "taskforge_auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : sessionStorage
      ),
      // Only persist what's needed — no transient UI state
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
