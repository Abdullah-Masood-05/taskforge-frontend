"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing";

/**
 * useBillingStatus(orgSlug)
 * Fetches current plan, subscription_status, current_period_end for an org.
 */
export function useBillingStatus(orgSlug) {
  return useQuery({
    queryKey: ["billing", orgSlug],
    queryFn: () => billingApi.getStatus(orgSlug),
    enabled: Boolean(orgSlug),
    staleTime: 60_000, // 1 min — billing status doesn't change that often
  });
}

/**
 * useCreateCheckout(orgSlug)
 * Mutation: creates a Stripe Checkout session and redirects the user.
 */
export function useCreateCheckout(orgSlug) {
  return useMutation({
    mutationFn: (priceId) => billingApi.createCheckout(orgSlug, priceId),
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });
}

/**
 * useOpenPortal(orgSlug)
 * Mutation: opens the Stripe Customer Portal.
 */
export function useOpenPortal(orgSlug) {
  return useMutation({
    mutationFn: () => billingApi.openPortal(orgSlug),
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });
}
