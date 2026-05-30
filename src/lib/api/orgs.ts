import { apiClient } from "./client";
import type {
  CreateOrgPayload,
  Invitation,
  InvitePayload,
  Membership,
  Organization,
  OrganizationSummary,
  UpdateOrgPayload,
  UpdateRolePayload,
} from "@/lib/types";

export const orgsApi = {
  /**
   * GET /organizations/
   * Lists all organizations the current user is a member of.
   */
  list(): Promise<OrganizationSummary[]> {
    return apiClient.get<OrganizationSummary[]>("/organizations/");
  },

  /**
   * POST /organizations/
   * Creates a new org. Creator is automatically assigned admin role.
   */
  create(data: CreateOrgPayload): Promise<Organization> {
    return apiClient.post<Organization>("/organizations/", data);
  },

  /**
   * GET /organizations/{slug}/
   */
  get(slug: string): Promise<Organization> {
    return apiClient.get<Organization>(`/organizations/${slug}/`);
  },

  /**
   * PATCH /organizations/{slug}/
   * Partial update — admin only.
   */
  update(slug: string, data: UpdateOrgPayload): Promise<Organization> {
    return apiClient.patch<Organization>(`/organizations/${slug}/`, data);
  },

  /**
   * DELETE /organizations/{slug}/
   * Soft-deletes the org — admin only.
   */
  delete(slug: string): Promise<null> {
    return apiClient.del<null>(`/organizations/${slug}/`);
  },

  // ── Members ────────────────────────────────────────────────────────────────

  /**
   * GET /organizations/{slug}/members/
   * Lists all memberships in the org.
   */
  listMembers(slug: string): Promise<Membership[]> {
    return apiClient.get<Membership[]>(`/organizations/${slug}/members/`);
  },

  /**
   * POST /organizations/{slug}/members/
   * Invites an existing user directly (creates Membership) or
   * sends a pending invitation if the email is not registered.
   */
  inviteMember(slug: string, data: InvitePayload): Promise<Membership | Invitation> {
    return apiClient.post<Membership | Invitation>(
      `/organizations/${slug}/members/`,
      data
    );
  },

  /**
   * PATCH /organizations/{slug}/members/{id}/
   * Changes a member's role — admin only.
   */
  updateMemberRole(
    slug: string,
    memberId: string,
    data: UpdateRolePayload
  ): Promise<Membership> {
    return apiClient.patch<Membership>(
      `/organizations/${slug}/members/${memberId}/`,
      data
    );
  },

  /**
   * DELETE /organizations/{slug}/members/{id}/
   * Removes a member — admin only.
   */
  removeMember(slug: string, memberId: string): Promise<null> {
    return apiClient.del<null>(`/organizations/${slug}/members/${memberId}/`);
  },

  /**
   * GET /organizations/{slug}/members/pending-invitations/
   * Lists pending invitations for the org.
   */
  listPendingInvitations(slug: string): Promise<Invitation[]> {
    return apiClient.get<Invitation[]>(
      `/organizations/${slug}/members/pending-invitations/`
    );
  },
};
