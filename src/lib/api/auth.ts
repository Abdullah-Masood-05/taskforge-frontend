import { apiClient } from "./client";
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  TokenPair,
  User,
} from "@/lib/types";

export const authApi = {
  /**
   * POST /auth/register/
   * Creates account and returns tokens + user immediately (no separate login step).
   */
  register(data: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/register/", data, {
      skipAuth: true,
    });
  },

  /**
   * POST /auth/login/
   * Returns access + refresh tokens alongside user data.
   */
  login(data: LoginPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login/", data, {
      skipAuth: true,
    });
  },

  /**
   * POST /auth/logout/
   * Blacklists the refresh token server-side.
   */
  logout(refreshToken: string): Promise<{ detail: string }> {
    return apiClient.post<{ detail: string }>("/auth/logout/", {
      refresh: refreshToken,
    });
  },

  /**
   * POST /auth/token/refresh/
   * Returns a new access token (and rotated refresh token).
   */
  refreshToken(refresh: string): Promise<TokenPair> {
    return apiClient.post<TokenPair>(
      "/auth/token/refresh/",
      { refresh },
      { skipAuth: true }
    );
  },

  /**
   * GET /auth/me/
   * Returns the current authenticated user's profile.
   */
  me(): Promise<User> {
    return apiClient.get<User>("/auth/me/");
  },

  /**
   * PUT /auth/me/
   * Updates profile fields (name, bio, timezone).
   */
  updateProfile(data: Partial<Pick<User, "first_name" | "last_name" | "bio" | "timezone">>): Promise<User> {
    return apiClient.put<User>("/auth/me/", data);
  },

  /**
   * POST /auth/change-password/
   * Returns new tokens after successful password change.
   */
  changePassword(data: ChangePasswordPayload): Promise<{ detail: string; tokens: TokenPair }> {
    return apiClient.post<{ detail: string; tokens: TokenPair }>(
      "/auth/change-password/",
      data
    );
  },
};
