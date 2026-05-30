import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgsApi } from "@/lib/api/orgs";

export function useOrgs() {
  return useQuery({
    queryKey: ["orgs"],
    queryFn: () => orgsApi.list(),
  });
}

export function useOrg(slug) {
  return useQuery({
    queryKey: ["org", slug],
    queryFn: () => orgsApi.get(slug),
    enabled: !!slug,
  });
}

export function useCreateOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => orgsApi.create(data),
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      queryClient.setQueryData(["org", newOrg.slug], newOrg);
    },
  });
}

export function useUpdateOrg(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => orgsApi.update(slug, data),
    onSuccess: (updatedOrg) => {
      queryClient.setQueryData(["org", slug], updatedOrg);
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });
}

export function useDeleteOrg(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => orgsApi.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      queryClient.removeQueries({ queryKey: ["org", slug] });
    },
  });
}

// ── Members ──────────────────────────────────────────────────────────────────

export function useOrgMembers(slug) {
  return useQuery({
    queryKey: ["org", slug, "members"],
    queryFn: () => orgsApi.listMembers(slug),
    enabled: !!slug,
  });
}

export function useInviteMember(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => orgsApi.inviteMember(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", slug, "members"] });
    },
  });
}

export function useUpdateMemberRole(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, data }) => orgsApi.updateMemberRole(slug, memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", slug, "members"] });
    },
  });
}

export function useRemoveMember(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId) => orgsApi.removeMember(slug, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", slug, "members"] });
    },
  });
}
