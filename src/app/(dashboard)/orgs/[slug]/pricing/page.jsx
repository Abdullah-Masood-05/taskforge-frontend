"use client";

import { use } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useBillingStatus, useCreateCheckout } from "@/lib/hooks/useBilling";
import styles from "./page.module.css";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals and small teams just getting started.",
    color: "free",
    features: [
      "Up to 3 active projects",
      "5 team members",
      "1 GB file storage",
      "Kanban boards",
      "Task comments & activity",
      "PDF exports",
      "Community support",
    ],
    cta: "Current plan",
    ctaDisabled: true,
    priceId: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "per seat / month",
    description: "For growing teams that need unlimited projects and priority support.",
    color: "pro",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited projects",
      "25 team members",
      "50 GB file storage",
      "Kanban boards",
      "Task comments & activity",
      "PDF exports",
      "Email support",
      "Advanced filters & search",
      "Notifications digest",
    ],
    cta: "Upgrade to Pro",
    priceIdKey: "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
  },
  {
    id: "business",
    name: "Business",
    price: "$29",
    period: "per seat / month",
    description: "For large organisations with dedicated support and unlimited scale.",
    color: "business",
    features: [
      "Unlimited projects",
      "Unlimited team members",
      "500 GB file storage",
      "Kanban boards",
      "Task comments & activity",
      "PDF exports",
      "Dedicated account manager",
      "SLA & priority queue",
      "SSO / SAML (coming soon)",
      "Audit log export",
    ],
    cta: "Upgrade to Business",
    priceIdKey: "NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID",
  },
];

export default function PricingPage({ params }) {
  const { slug } = use(params);
  const { data: billing } = useBillingStatus(slug);
  const currentPlan = billing?.plan ?? "free";
  const checkout = useCreateCheckout(slug);

  const handleUpgrade = (plan) => {
    const priceId = process.env[plan.priceIdKey];
    if (!priceId) {
      alert("Stripe price ID is not configured. Add NEXT_PUBLIC_STRIPE_*_PRICE_ID to your .env.local.");
      return;
    }
    checkout.mutate(priceId);
  };

  return (
    <>
      <Topbar title="Pricing" />

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Simple, transparent pricing</h1>
          <p className={styles.heroSubtitle}>
            Start free, scale when you need to. No hidden fees.
          </p>
        </div>

        <div className={styles.grid}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === currentPlan}
              isLoading={checkout.isPending}
              onUpgrade={() => handleUpgrade(plan)}
            />
          ))}
        </div>

        <p className={styles.disclaimer}>
          All plans include a 14-day free trial. Cancel anytime. Prices in USD.
        </p>
      </main>
    </>
  );
}

function PlanCard({ plan, isCurrent, isLoading, onUpgrade }) {
  return (
    <div
      className={[styles.card, plan.highlight ? styles.cardHighlight : ""].join(" ")}
      data-plan={plan.color}
      id={`plan-card-${plan.id}`}
    >
      {plan.badge && <div className={styles.badge}>{plan.badge}</div>}

      <div className={styles.cardHeader}>
        <div className={styles.planName} data-plan={plan.color}>{plan.name}</div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{plan.price}</span>
          <span className={styles.period}>{plan.period}</span>
        </div>
        <p className={styles.description}>{plan.description}</p>
      </div>

      <div className={styles.divider} />

      <ul className={styles.features}>
        {plan.features.map((feat) => (
          <li key={feat} className={styles.feature}>
            <svg viewBox="0 0 20 20" fill="currentColor" className={styles.checkIcon} data-plan={plan.color}>
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            {feat}
          </li>
        ))}
      </ul>

      <button
        id={`upgrade-${plan.id}-btn`}
        className={[styles.cta, plan.highlight ? styles.ctaHighlight : ""].join(" ")}
        data-plan={plan.color}
        disabled={isCurrent || plan.ctaDisabled || isLoading}
        onClick={!isCurrent && !plan.ctaDisabled ? onUpgrade : undefined}
      >
        {isCurrent ? "Current plan" : isLoading ? "Redirecting…" : plan.cta}
      </button>
    </div>
  );
}
