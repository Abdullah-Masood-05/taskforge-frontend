"use client";

/**
 * ProjectTimeline — compact Gantt-style panel for the right rail.
 *
 * Month header computed from the min/max dates in the timeline response,
 * one bar row per task (collapsed to per-status "phase" bars when the
 * project has more than 20 dated tasks). Plain CSS grid math — no
 * charting library.
 */

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProjectTimeline } from "@/lib/hooks/useTasks";
import { formatShortDate } from "@/lib/utils/format";
import styles from "./ProjectTimeline.module.css";

const DAY_MS = 24 * 60 * 60 * 1000;
const COLLAPSE_THRESHOLD = 20;
const MAX_MONTHS = 12;

function monthStart(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildModel(items) {
  if (!items?.length) return null;

  const parsed = items
    .map((t) => ({ ...t, start: new Date(t.start_date), end: new Date(t.end_date) }))
    .filter((t) => !Number.isNaN(t.start.getTime()) && !Number.isNaN(t.end.getTime()));
  if (!parsed.length) return null;

  let rows;
  if (parsed.length > COLLAPSE_THRESHOLD) {
    // Phase bars: one row per status column, spanning its tasks' range.
    const groups = new Map();
    for (const t of parsed) {
      const key = t.status?.id ?? "none";
      const g = groups.get(key) ?? {
        id: key,
        label: t.status?.name ?? "No column",
        color: t.status?.color ?? "#9f8e7a",
        order: groups.size,
        start: t.start,
        end: t.end,
        count: 0,
      };
      if (t.start < g.start) g.start = t.start;
      if (t.end > g.end) g.end = t.end;
      g.count += 1;
      groups.set(key, g);
    }
    rows = [...groups.values()].map((g) => ({
      id: g.id,
      label: g.label,
      sublabel: `${g.count} tasks`,
      color: g.color,
      start: g.start,
      end: g.end,
      tooltip: `${g.label} — ${g.count} tasks · ${formatShortDate(g.start)} → ${formatShortDate(g.end)}`,
    }));
  } else {
    rows = parsed.map((t) => ({
      id: t.id,
      label: t.title,
      sublabel: null,
      color: t.status?.color ?? "#9f8e7a",
      start: t.start,
      end: t.end,
      tooltip: `${t.title} · ${formatShortDate(t.start)} → ${formatShortDate(t.end)}`,
    }));
  }

  // Range: whole months from the earliest start to the latest end (capped).
  const minDate = rows.reduce((m, r) => (r.start < m ? r.start : m), rows[0].start);
  const maxDate = rows.reduce((m, r) => (r.end > m ? r.end : m), rows[0].end);
  const rangeStart = monthStart(minDate);
  let rangeEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);
  const capEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + MAX_MONTHS, 1);
  if (rangeEnd > capEnd) rangeEnd = capEnd;

  const totalDays = Math.max(1, (rangeEnd - rangeStart) / DAY_MS);

  const months = [];
  let cursor = new Date(rangeStart);
  while (cursor < rangeEnd) {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      widthPct: (((next > rangeEnd ? rangeEnd : next) - cursor) / DAY_MS / totalDays) * 100,
    });
    cursor = next;
  }
  // Thin out labels when the range is long, so they don't collide
  const labelStep = Math.max(1, Math.ceil(months.length / 6));
  months.forEach((m, i) => {
    if (i % labelStep !== 0) m.label = "";
  });

  const positioned = rows.map((r) => {
    const clampedStart = r.start < rangeStart ? rangeStart : r.start;
    const clampedEnd = r.end > rangeEnd ? rangeEnd : r.end;
    const left = ((clampedStart - rangeStart) / DAY_MS / totalDays) * 100;
    const width = Math.max(((clampedEnd - clampedStart) / DAY_MS / totalDays) * 100, 1.5);
    return { ...r, leftPct: Math.min(left, 98.5), widthPct: Math.min(width, 100 - left) };
  });

  // Today marker, when inside the range
  const today = new Date();
  const todayPct =
    today >= rangeStart && today <= rangeEnd
      ? ((today - rangeStart) / DAY_MS / totalDays) * 100
      : null;

  return { rows: positioned, months, todayPct };
}

export function ProjectTimeline({ orgSlug, projectId }) {
  const { data, isLoading, isError } = useProjectTimeline(orgSlug, projectId);
  const model = useMemo(() => buildModel(data), [data]);

  return (
    <section className={styles.panel} aria-label="Project timeline">
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Project Timeline</h3>
        {model && (
          <span className={styles.panelHint}>
            {model.rows.length > 5 ? `${model.rows.length} rows` : ""}
          </span>
        )}
      </header>

      {isLoading ? (
        <div className={styles.skeletons}>
          <Skeleton height={14} width="80%" />
          <Skeleton height={14} width="95%" />
          <Skeleton height={14} width="65%" />
          <Skeleton height={14} width="88%" />
        </div>
      ) : isError ? (
        <p className={styles.empty}>Could not load the timeline.</p>
      ) : !model ? (
        <p className={styles.empty}>
          No dated tasks yet — set start and due dates to plot them here.
        </p>
      ) : (
        <div className={styles.gantt}>
          {/* Month header */}
          <div className={styles.monthRow}>
            <div className={styles.rowLabel} />
            <div className={styles.trackArea}>
              {model.months.map((m) => (
                <span key={m.key} className={styles.month} style={{ width: `${m.widthPct}%` }}>
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Bars */}
          <div className={styles.rows}>
            {model.rows.map((r) => (
              <div key={r.id} className={styles.row}>
                <div className={styles.rowLabel} title={r.label}>
                  <span className={styles.rowLabelText}>{r.label}</span>
                  {r.sublabel && <span className={styles.rowSub}>{r.sublabel}</span>}
                </div>
                <div className={styles.trackArea}>
                  {model.months.map((m) => (
                    <span key={m.key} className={styles.gridCell} style={{ width: `${m.widthPct}%` }} />
                  ))}
                  {model.todayPct != null && (
                    <span className={styles.todayLine} style={{ left: `${model.todayPct}%` }} />
                  )}
                  <span
                    className={styles.bar}
                    style={{
                      left: `${r.leftPct}%`,
                      width: `${r.widthPct}%`,
                      background: r.color,
                    }}
                    title={r.tooltip}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
