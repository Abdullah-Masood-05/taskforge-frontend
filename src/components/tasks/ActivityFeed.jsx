"use client";

/**
 * ActivityFeed — live list of recent project activity for the right rail.
 * Polls every 30s via useProjectActivity's refetchInterval.
 */

import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProjectActivity } from "@/lib/hooks/useTasks";
import { formatRelativeTime } from "@/lib/utils/format";
import styles from "./ActivityFeed.module.css";

export function ActivityFeed({ orgSlug, projectId }) {
  const { data, isLoading, isError } = useProjectActivity(orgSlug, projectId, 20);
  const items = data ?? [];

  return (
    <section className={styles.panel} aria-label="Recent activity">
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Activity</h3>
        <span className={styles.liveTag}>auto-refresh</span>
      </header>

      {isLoading ? (
        <div className={styles.skeletons}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.skeletonRow}>
              <Skeleton width={26} height={26} radius="full" />
              <div style={{ flex: 1 }}>
                <Skeleton height={11} width="90%" />
                <Skeleton height={9} width="30%" style={{ marginTop: 5 }} />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className={styles.empty}>Could not load activity.</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>No activity yet — changes to tasks will appear here.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <Avatar
                src={item.actor?.avatar_url || item.actor?.avatar}
                name={item.actor?.full_name || item.actor?.email || "?"}
                size="sm"
                className={styles.itemAvatar}
              />
              <div className={styles.itemBody}>
                <p className={styles.message}>{item.message}</p>
                <span className={styles.time}>{formatRelativeTime(item.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
