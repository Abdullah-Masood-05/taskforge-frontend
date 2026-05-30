/**
 * useAuth — convenience hook wrapping the Zustand auth store.
 *
 * Exposes login, register, logout helpers that:
 *   1. Call the API
 *   2. Update the Zustand store
 *   3. Return the result (let the component decide on navigation)
 *
 * TanStack Query is NOT used here — auth is not "server state" in the
 * TanStack Query sense; it's a local credential store.
 */
"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/auth";
import type { LoginPayload, RegisterPayload, ChangePasswordPayload } from "@/lib/types";

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  // Listen for the auth:expired event dispatched by the API client on 401
  useEffect(() => {
    const handleExpired = () => {
      store.clearAuth();
      router.replace("/login");
    };
    window.addEventListener("taskforge:auth:expired", handleExpired);
    return () =>
      window.removeEventListener("taskforge:auth:expired", handleExpired);
  }, [store, router]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await authApi.login(payload);
      store.setAuth(data.user, data.tokens);
      return data;
    },
    [store]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await authApi.register(payload);
      store.setAuth(data.user, data.tokens);
      return data;
    },
    [store]
  );

  const logout = useCallback(async () => {
    const refresh = store.tokens?.refresh;
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Best-effort — clear locally even if server call fails
    } finally {
      store.clearAuth();
      router.replace("/login");
    }
  }, [store, router]);

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload) => {
      const data = await authApi.changePassword(payload);
      // Update tokens after password change
      store.setTokens(data.tokens);
      return data;
    },
    [store]
  );

  return {
    user: store.user,
    tokens: store.tokens,
    isAuthenticated: store.isAuthenticated,
    login,
    register,
    logout,
    changePassword,
  };
}
