import { apiClient } from "./client";

export const authApi = {
  /**
   * POST /auth/register/
   * Creates account and returns tokens + user immediately (no separate login step).
   */
  register(data) {
    return apiClient.post("/auth/register/", data, {
      skipAuth: true,
    });
  },

  /**
   * POST /auth/login/
   * Returns access + refresh tokens alongside user data.
   */
  login(data) {
    return apiClient.post("/auth/login/", data, {
      skipAuth: true,
    });
  },

  /**
   * POST /auth/logout/
   * Blacklists the refresh token server-side.
   */
  logout(refreshToken) {
    return apiClient.post("/auth/logout/", {
      refresh: refreshToken,
    });
  },

  /**
   * POST /auth/token/refresh/
   * Returns a new access token (and rotated refresh token).
   */
  refreshToken(refresh) {
    return apiClient.post(
      "/auth/token/refresh/",
      { refresh },
      { skipAuth: true }
    );
  },

  /**
   * GET /auth/me/
   * Returns the current authenticated user's profile.
   */
  me() {
    return apiClient.get("/auth/me/");
  },

  /**
   * PUT /auth/me/
   * Updates profile fields (name, bio, timezone).
   */
  updateProfile(data) {
    return apiClient.put("/auth/me/", data);
  },

  /**
   * POST /auth/change-password/
   * Returns new tokens after successful password change.
   */
  changePassword(data) {
    return apiClient.post("/auth/change-password/", data);
  },
};
