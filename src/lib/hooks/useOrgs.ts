/**
 * TanStack Query hooks for organization data.
 *
 * TanStack Query owns WHAT data is on screen (server state).
 * Zustand owns WHO the user is (auth state).
 * These two never overlap.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgsApi } from "@/lib/api/orgs";
import { setCurrentOrgSlug } from "@/lib/api/client";
import type { CreateOrgPayload, InvitePayload, UpdateOrgPayload, UpdateRolePayload } from "@/lib/types";

// ── Query Keys ────────────────────────────────────────────────────────────────
export const orgKeys = {
  all: ["orgs"] as const,
  lists: () => [...orgKeys.all, "list"] as const,
  detail: (slug: string) => [...orgKeys.all, "detail", slug] as const,
  members: (slug: string) => [...orgKeys.all, "members", slug] as const,
  invitations: (slug: string) => [...orgKeys.all, "invitations", slug] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useOrgs() {
  return useQuery({
    queryKey: orgKeys.lists(),
    queryFn: () => orgsApi.list(),
    staleTime: 30_000,
  });
}

export function useOrg(slug: string) {
  return useQuery({
    queryKey: orgKeys.detail(slug),
    queryFn: () => {
      setCurrentOrgSlug(slug);
      return orgsApi.get(slug);
    },
    enabled: Boolean(slug),
    staleTime: 30_000,
  });
}

export function useOrgMembers(slug: string) {
  return useQuery({
    queryKey: orgKeys.members(slug),
    queryFn: () => orgsApi.listMembers(slug),
    enabled: Boolean(slug),
    staleTime: 15_000,
  });
}

export function usePendingInvitations(slug: string) {
  return useQuery({
    queryKey: orgKeys.invitations(slug),
    queryFn: () => orgsApi.listPendingInvitations(slug),
    enabled: Boolean(slug),
    staleTime: 15_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrgPayload) => orgsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.lists() }),
  });
}

export function useUpdateOrg(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrgPayload) => orgsApi.update(slug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgKeys.detail(slug) });
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}

export function useDeleteOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => orgsApi.delete(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.lists() }),
  });
}

export function useInviteMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvitePayload) => orgsApi.inviteMember(slug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgKeys.members(slug) });
      qc.invalidateQueries({ queryKey: orgKeys.invitations(slug) });
    },
  });
}

export function useUpdateMemberRole(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateRolePayload }) =>
      orgsApi.updateMemberRole(slug, memberId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.members(slug) }),
  });
}

export function useRemoveMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => orgsApi.removeMember(slug, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: orgKeys.members(slug) }),
  });
}
