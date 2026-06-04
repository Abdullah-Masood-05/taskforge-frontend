"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { useBillingStatus, useOpenPortal } from "@/lib/hooks/useBilling";
import styles from "./page.module.css";

const PLAN_LABELS = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

const STATUS_LABELS = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past Due",
  canceled: "Canceled",
  incomplete: "Incomplete",
  "": "—",
};

export default function BillingPage({ params }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";

  const { data: billing, isLoading } = useBillingStatus(slug);
  const portal = useOpenPortal(slug);

  return (
    <>
      <Topbar title="Billing" />

      <main className={styles.main}>
        {checkoutSuccess && (
          <div className={styles.successBanner} id="checkout-success-banner">
            🎉 Your subscription is now active! Welcome to{" "}
            <strong>{PLAN_LABELS[billing?.plan] ?? "your new plan"}</strong>.
          </div>
        )}

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Current Plan</h2>

          {isLoading ? (
            <div className={styles.skeleton} />
          ) : (
            <div className={styles.planRow}>
              <div className={styles.planBadge} data-plan={billing?.plan ?? "free"}>
                {PLAN_LABELS[billing?.plan ?? "free"]}
              </div>

              <div className={styles.planMeta}>
                {billing?.subscription_status && (
                  <span
                    className={styles.statusChip}
                    data-status={billing.subscription_status}
                  >
                    {STATUS_LABELS[billing.subscription_status] ?? billing.subscription_status}
                  </span>
                )}
                {billing?.current_period_end && (
                  <span className={styles.periodEnd}>
                    Renews{" "}
                    {new Date(billing.current_period_end).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className={styles.cardActions}>
            {billing?.plan === "free" ? (
              <a href={`/orgs/${slug}/pricing`} className={styles.upgradeBtn} id="upgrade-plan-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 7-7 7 7M12 5v14" />
                </svg>
                Upgrade Plan
              </a>
            ) : (
              <button
                id="manage-billing-btn"
                className={styles.manageBtn}
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
              >
                {portal.isPending ? "Redirecting…" : "Manage Billing"}
              </button>
            )}
          </div>
        </div>

        {/* Feature comparison callout */}
        <div className={styles.featureCard}>
          <h3 className={styles.featureTitle}>Plan Features</h3>
          <div className={styles.featureGrid}>
            <FeatureRow label="Active projects" free="Up to 3" pro="Unlimited" business="Unlimited" />
            <FeatureRow label="Team members" free="5" pro="25" business="Unlimited" />
            <FeatureRow label="File storage" free="1 GB" pro="50 GB" business="500 GB" />
            <FeatureRow label="PDF exports" free="✓" pro="✓" business="✓" />
            <FeatureRow label="Priority support" free="—" pro="Email" business="Dedicated" />
          </div>
          {billing?.plan === "free" && (
            <a href={`/orgs/${slug}/pricing`} className={styles.pricingLink}>
              See full pricing →
            </a>
          )}
        </div>
      </main>
    </>
  );
}

function FeatureRow({ label, free, pro, business }) {
  return (
    <div className={styles.featureRow}>
      <span className={styles.featureLabel}>{label}</span>
      <span className={styles.featureCell}>{free}</span>
      <span className={styles.featureCell} data-highlight="pro">{pro}</span>
      <span className={styles.featureCell} data-highlight="business">{business}</span>
    </div>
  );
}
