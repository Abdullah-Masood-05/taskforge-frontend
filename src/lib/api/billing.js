import { apiClient } from "@/lib/api/client";

/**
 * Billing API client — all calls scoped to an org slug.
 *
 * Endpoints:
 *   POST /api/v1/organizations/{slug}/billing/checkout/   → { url }
 *   POST /api/v1/organizations/{slug}/billing/portal/     → { url }
 *   GET  /api/v1/organizations/{slug}/billing/status/     → { plan, subscription_status, ... }
 */
export const billingApi = {
  /**
   * Create a Stripe Checkout session for the given price.
   * Returns { url } — redirect the user to this URL to complete payment.
   */
  createCheckout: (orgSlug, priceId) =>
    apiClient.post(`/organizations/${orgSlug}/billing/checkout/`, {
      price_id: priceId,
    }),

  /**
   * Create a Stripe Customer Portal session.
   * Returns { url } — redirect the user to manage their subscription.
   */
  openPortal: (orgSlug) =>
    apiClient.post(`/organizations/${orgSlug}/billing/portal/`),

  /**
   * Get the org's current billing state.
   * Returns { plan, subscription_status, current_period_end, has_billing_account }
   */
  getStatus: (orgSlug) =>
    apiClient.get(`/organizations/${orgSlug}/billing/status/`),
};
