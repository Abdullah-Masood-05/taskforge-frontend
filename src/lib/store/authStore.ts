/**
 * Zustand auth store.
 *
 * Design decision (noted per project brief):
 * Tokens are persisted to localStorage under the key "taskforge_auth".
 * This is the accepted portfolio-project trade-off for UX (survive page refresh)
 * vs. the production-hardened approach of httpOnly cookies.
 * The localStorage key is namespaced to avoid collisions.
 *
 * Zustand owns WHO the user is.
 * TanStack Query owns WHAT data is on screen.
 * These two concerns never cross.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TokenPair, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, tokens: TokenPair) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: TokenPair) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      setTokens: (tokens) => set({ tokens }),

      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),
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
