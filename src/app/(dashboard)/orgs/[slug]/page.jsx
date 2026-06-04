"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { MemberTable } from "@/components/orgs/MemberTable";
import { InviteModal } from "@/components/orgs/InviteModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useOrg, useOrgMembers } from "@/lib/hooks/useOrgs";
import { useAuthStore } from "@/lib/store/authStore";
import styles from "./page.module.css";

export default function OrgDetailPage({ params }) {
  const { slug } = use(params);
  const user = useAuthStore((s) => s.user);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: org, isLoading: orgLoading, isError: orgError } = useOrg(slug);
  const { data: members, isLoading: membersLoading } = useOrgMembers(slug);

  if (orgError) notFound();

  const currentMembership = members?.find((m) => m.user_email === user?.email);
  const isAdmin = currentMembership?.role === "admin";

  return (
    <>
      <Topbar
        title={org?.name ?? "Organization"}
        actions={
          isAdmin && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              + Invite member
            </Button>
          )
        }
      />

      <main className={styles.main}>
        {/* ── Org header ─────────────────────────────────────────────────── */}
        {orgLoading ? (
          <div className={styles.headerSkeleton} />
        ) : org ? (
          <section className={styles.orgHeader}>
            <div className={styles.orgIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="9" width="18" height="12" rx="2" />
                <path d="M8 9V6a4 4 0 0 1 8 0v3" />
              </svg>
            </div>

            <div className={styles.orgMeta}>
              <div className={styles.orgNameRow}>
                <h2 className={styles.orgName}>{org.name}</h2>
                <Badge variant={org.plan}>{org.plan}</Badge>
                {isAdmin && <Badge variant="admin">Admin</Badge>}
              </div>
              {org.description && (
                <p className={styles.orgDescription}>{org.description}</p>
              )}
              <div className={styles.orgStats}>
                <span className={styles.stat}>
                  <strong>{org.member_count}</strong> members
                </span>
                <span className={styles.statDot} />
                <span className={styles.stat}>
                  <code className={styles.statSlug}>/{org.slug}</code>
                </span>
                {org.website && (
                  <>
                    <span className={styles.statDot} />
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.statLink}
                    >
                      {org.website.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── Members ────────────────────────────────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              Members
              {members && (
                <span className={styles.count}>{members.length}</span>
              )}
            </h3>
          </div>

          {membersLoading ? (
            <div className={styles.tableSkeleton} />
          ) : members ? (
            <MemberTable
              orgSlug={slug}
              members={members}
              currentUserEmail={user?.email}
              isAdmin={isAdmin}
            />
          ) : null}
        </section>
      </main>

      <InviteModal
        orgSlug={slug}
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  );
}
