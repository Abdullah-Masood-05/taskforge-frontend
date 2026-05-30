import { apiClient } from "./client";

export const orgsApi = {
  /**
   * GET /organizations/
   * Lists all organizations the current user is a member of.
   */
  list() {
    return apiClient.get("/organizations/");
  },

  /**
   * POST /organizations/
   * Creates a new org. Creator is automatically assigned admin role.
   */
  create(data) {
    return apiClient.post("/organizations/", data);
  },

  /**
   * GET /organizations/{slug}/
   */
  get(slug) {
    return apiClient.get(`/organizations/${slug}/`);
  },

  /**
   * PATCH /organizations/{slug}/
   * Partial update — admin only.
   */
  update(slug, data) {
    return apiClient.patch(`/organizations/${slug}/`, data);
  },

  /**
   * DELETE /organizations/{slug}/
   * Soft-deletes the org — admin only.
   */
  delete(slug) {
    return apiClient.del(`/organizations/${slug}/`);
  },

  // ── Members ────────────────────────────────────────────────────────────────

  /**
   * GET /organizations/{slug}/members/
   * Lists all memberships in the org.
   */
  listMembers(slug) {
    return apiClient.get(`/organizations/${slug}/members/`);
  },

  /**
   * POST /organizations/{slug}/members/
   * Invites an existing user directly (creates Membership) or
   * sends a pending invitation if the email is not registered.
   */
  inviteMember(slug, data) {
    return apiClient.post(`/organizations/${slug}/members/`, data);
  },

  /**
   * PATCH /organizations/{slug}/members/{id}/
   * Changes a member's role — admin only.
   */
  updateMemberRole(slug, memberId, data) {
    return apiClient.patch(`/organizations/${slug}/members/${memberId}/`, data);
  },

  /**
   * DELETE /organizations/{slug}/members/{id}/
   * Removes a member — admin only.
   */
  removeMember(slug, memberId) {
    return apiClient.del(`/organizations/${slug}/members/${memberId}/`);
  },

  /**
   * GET /organizations/{slug}/members/pending-invitations/
   * Lists pending invitations for the org.
   */
  listPendingInvitations(slug) {
    return apiClient.get(`/organizations/${slug}/members/pending-invitations/`);
  },
};
