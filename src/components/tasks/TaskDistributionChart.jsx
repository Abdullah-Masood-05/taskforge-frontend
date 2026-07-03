"use client";

/**
 * TaskDistributionChart — donut of task counts by priority, with a
 * percentage legend beside it and the total in the donut hole.
 *
 * Priority palette validated for the dark surface (#16130d):
 * urgent #ef4444 · high #d97706 · medium #3b82f6 · low #0d9488.
 * Segments carry 2px surface gaps; the legend + % double as direct labels.
 */

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProjectAnalytics } from "@/lib/hooks/useTasks";
import styles from "./TaskDistributionChart.module.css";

const PRIORITY_COLORS = {
  urgent: "#ef4444",
  high: "#d97706",
  medium: "#3b82f6",
  low: "#0d9488",
};

const PRIORITY_LABELS = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };

function DistTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipDot} style={{ background: PRIORITY_COLORS[item.name] }} />
      {PRIORITY_LABELS[item.name] ?? item.name}: {item.value} tasks
    </div>
  );
}

export function TaskDistributionChart({ orgSlug, projectId }) {
  const { data, isLoading, isError } = useProjectAnalytics(orgSlug, projectId);
  const distribution = (data?.distribution ?? []).filter((d) => d.count > 0);
  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <section className={styles.panel} aria-label="Task distribution by priority">
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Task Distribution</h3>
      </header>

      {isLoading ? (
        <Skeleton height={128} radius="lg" />
      ) : isError ? (
        <p className={styles.empty}>Could not load distribution data.</p>
      ) : total === 0 ? (
        <p className={styles.empty}>No tasks yet.</p>
      ) : (
        <div className={styles.body}>
          <div className={styles.donutWrap}>
            <ResponsiveContainer width="100%" height={128}>
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="count"
                  nameKey="priority"
                  innerRadius={38}
                  outerRadius={56}
                  paddingAngle={2}
                  stroke="var(--bg-surface)"
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {distribution.map((d) => (
                    <Cell key={d.priority} fill={PRIORITY_COLORS[d.priority] ?? "#9f8e7a"} />
                  ))}
                </Pie>
                <Tooltip content={<DistTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter} aria-hidden="true">
              <span className={styles.donutTotal}>{total}</span>
              <span className={styles.donutCaption}>tasks</span>
            </div>
          </div>

          <ul className={styles.legend}>
            {distribution.map((d) => (
              <li key={d.priority} className={styles.legendRow}>
                <span
                  className={styles.legendDot}
                  style={{ background: PRIORITY_COLORS[d.priority] ?? "#9f8e7a" }}
                />
                <span className={styles.legendLabel}>{PRIORITY_LABELS[d.priority] ?? d.priority}</span>
                <span className={styles.legendPct}>{d.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
