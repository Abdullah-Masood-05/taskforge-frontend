import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/auth";

/**
 * Facade hook for authentication interactions.
 * Bridges UI actions with the API and the Zustand store.
 */
export function useAuth() {
  const router = useRouter();
  const { user, tokens, isAuthenticated, setAuth, setUser, clearAuth } = useAuthStore();

  // Listen for background expirations fired from apiClient.js
  useEffect(() => {
    const handleExpired = () => {
      clearAuth();
      router.push("/login?expired=1");
    };

    window.addEventListener("taskforge:auth:expired", handleExpired);
    return () => window.removeEventListener("taskforge:auth:expired", handleExpired);
  }, [clearAuth, router]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setAuth(res.user, { access: res.access, refresh: res.refresh });
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    setAuth(res.user, { access: res.access, refresh: res.refresh });
  };

  const logout = async () => {
    if (tokens?.refresh) {
      try {
        await authApi.logout(tokens.refresh);
      } catch {
        // Silently fail if server-side blacklist fails (e.g. network issue),
        // we still want to locally clear the state.
      }
    }
    clearAuth();
    router.push("/login");
  };

  const updateProfile = async (data) => {
    const updatedUser = await authApi.updateProfile(data);
    setUser(updatedUser);
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };
}
