"use client";

/**
 * TeamVelocityChart — completed vs planned tasks per ISO week.
 *
 * Completed is a solid amber bar; Planned is a hollow (outline) bar, so the
 * pair is distinguished by fill-style as well as color (colorblind-safe).
 * Palette validated against the dark surface (#16130d).
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProjectAnalytics } from "@/lib/hooks/useTasks";
import styles from "./TeamVelocityChart.module.css";

const COMPLETED_FILL = "#d97706"; // solid amber — passes dark-band validation
const PLANNED_STROKE = "#d7c3ae"; // hollow outline; identity carried by fill-style

function VelocityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className={styles.tooltipRow}>
          <span
            className={styles.tooltipDot}
            style={
              p.dataKey === "completed_count"
                ? { background: COMPLETED_FILL }
                : { border: `1.5px solid ${PLANNED_STROKE}` }
            }
          />
          {p.dataKey === "completed_count" ? "Completed" : "Planned"}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function TeamVelocityChart({ orgSlug, projectId }) {
  const { data, isLoading, isError } = useProjectAnalytics(orgSlug, projectId);
  const velocity = data?.velocity ?? [];

  return (
    <section className={styles.panel} aria-label="Team velocity">
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Team Velocity</h3>
        <div className={styles.legend} aria-hidden="true">
          <span className={styles.legendItem}>
            <span className={styles.legendSolid} /> Completed
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendHollow} /> Planned
          </span>
        </div>
      </header>

      {isLoading ? (
        <Skeleton height={130} radius="lg" />
      ) : isError ? (
        <p className={styles.empty}>Could not load velocity data.</p>
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={velocity} barGap={2} barCategoryGap="28%" margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="week_label"
                tick={{ fill: "#9f8e7a", fontSize: 10.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#9f8e7a", fontSize: 10.5 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<VelocityTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="completed_count" name="Completed" fill={COMPLETED_FILL} radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="planned_count"
                name="Planned"
                fill="transparent"
                stroke={PLANNED_STROKE}
                strokeWidth={1.25}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
