/**
 * TaskForge API Type Definitions
 *
 * These interfaces mirror the Django backend serializer response shapes exactly.
 * Keep in sync with the backend serializers when fields change.
 */

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  tokens: TokenPair;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// ── User ─────────────────────────────────────────────────────────────────────

export interface MembershipSummary {
  org_name: string;
  org_slug: string;
  role: MemberRole;
  joined_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar: string | null;
  bio: string;
  timezone: string;
  is_verified: boolean;
  date_joined: string;
  memberships: MembershipSummary[];
}

// ── Organizations ─────────────────────────────────────────────────────────────

export type OrgPlan = "free" | "pro" | "business";
export type MemberRole = "admin" | "member" | "viewer";
export type InvitationStatus = "pending" | "accepted" | "expired";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  plan: OrgPlan;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  website: string;
  owner_email: string;
  plan: OrgPlan;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrgPayload {
  name: string;
  description?: string;
  website?: string;
}

export interface UpdateOrgPayload {
  name?: string;
  description?: string;
  website?: string;
}

// ── Memberships ───────────────────────────────────────────────────────────────

export interface Membership {
  id: string;
  user_email: string;
  user_full_name: string;
  user_avatar: string | null;
  role: MemberRole;
  invited_by_email: string | null;
  joined_at: string;
}

export interface InvitePayload {
  email: string;
  role?: MemberRole;
}

export interface UpdateRolePayload {
  role: MemberRole;
}

// ── Invitations ───────────────────────────────────────────────────────────────

export interface Invitation {
  id: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
}

// ── API Errors ────────────────────────────────────────────────────────────────

/**
 * Matches the shape produced by apps/core/exceptions.py custom_exception_handler.
 * Every error from the API has this exact structure.
 */
export interface ApiErrorShape {
  status: "error";
  code: string;
  message: string;
  errors?: Record<string, string | string[]>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly errors?: Record<string, string | string[]>;

  constructor(httpStatus: number, shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = httpStatus;
    this.code = shape.code;
    this.errors = shape.errors;
  }

  /** Returns the first field-level error message for a given field name. */
  fieldError(field: string): string | undefined {
    const val = this.errors?.[field];
    if (!val) return undefined;
    return Array.isArray(val) ? val[0] : val;
  }
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
