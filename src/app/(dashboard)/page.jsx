"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { OrgCard } from "@/components/orgs/OrgCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useOrgs, useCreateOrg } from "@/lib/hooks/useOrgs";
import { useAuthStore } from "@/lib/store/authStore";
import { ApiError } from "@/lib/api/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "./page.module.css";

const createOrgSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  website: z.string().url("Enter a valid URL.").or(z.literal("")).optional(),
});

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: orgs, isLoading, isError } = useOrgs();
  const createOrg = useCreateOrg();
  const [showCreate, setShowCreate] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm({ resolver: zodResolver(createOrgSchema) });

  const onCreateOrg = async (data) => {
    try {
      await createOrg.mutateAsync(data);
      setShowCreate(false);
      reset();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          Object.keys(err.errors).forEach((f) => {
            setError(f, { message: err.fieldError(f) });
          });
        }
      }
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <Topbar
        title="Dashboard"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + New organization
          </Button>
        }
      />

      <main className={styles.main}>
        {/* ── Welcome banner ─────────────────────────────────────────────── */}
        <section className={styles.banner}>
          <div className={styles.bannerContent}>
            <h2 className={styles.bannerTitle}>
              {greeting}, {user?.first_name ?? "there"} 👋
            </h2>
            <p className={styles.bannerSub}>
              {orgs?.length
                ? `You're a member of ${orgs.length} organization${orgs.length !== 1 ? "s" : ""}.`
                : "Create your first organization to get started."}
            </p>
          </div>
          <div className={styles.bannerOrb} aria-hidden="true" />
        </section>

        {/* ── Organizations grid ─────────────────────────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Your organizations</h3>

          {isLoading && (
            <div className={styles.skeleton}>
              {[1, 2, 3].map((n) => (
                <div key={n} className={styles.skeletonCard} />
              ))}
            </div>
          )}

          {isError && (
            <div className={styles.empty}>
              <p>Failed to load organizations. Please refresh.</p>
            </div>
          )}

          {orgs && orgs.length === 0 && (
            <div className={styles.empty}>
              <svg viewBox="0 0 64 64" fill="none" className={styles.emptyIcon}>
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
                <path d="M20 36h24M20 28h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <p className={styles.emptyTitle}>No organizations yet</p>
              <p className={styles.emptyHint}>
                Create one to start managing projects with your team.
              </p>
              <Button onClick={() => setShowCreate(true)}>
                Create organization
              </Button>
            </div>
          )}

          {orgs && orgs.length > 0 && (
            <div className={styles.grid}>
              {orgs.map((org) => (
                <OrgCard key={org.id} org={org} />
              ))}
              <button
                className={styles.newOrgTile}
                onClick={() => setShowCreate(true)}
              >
                <span className={styles.plusIcon}>+</span>
                <span>New organization</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ── Create org modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); reset(); }}
        title="Create organization"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowCreate(false); reset(); }}>
              Cancel
            </Button>
            <Button form="create-org-form" type="submit" loading={isSubmitting}>
              Create
            </Button>
          </>
        }
      >
        <form
          id="create-org-form"
          onSubmit={handleSubmit(onCreateOrg)}
          className={styles.createForm}
        >
          <Input
            label="Organization name"
            placeholder="Acme Inc."
            error={errors.name?.message}
            autoFocus
            {...register("name")}
          />
          <Input
            label="Description (optional)"
            placeholder="What does your team do?"
            error={errors.description?.message}
            {...register("description")}
          />
          <Input
            label="Website (optional)"
            type="url"
            placeholder="https://example.com"
            error={errors.website?.message}
            {...register("website")}
          />
        </form>
      </Modal>
    </>
  );
}
