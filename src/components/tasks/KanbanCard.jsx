"use client";

/**
 * KanbanCard — a single draggable task card.
 * Rendered inside KanbanColumn as a Draggable item.
 */

import { Draggable } from "@hello-pangea/dnd";
import styles from "./KanbanBoard.module.css";

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  high:   { label: "High",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  medium: { label: "Medium", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  low:    { label: "Low",    color: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

function Avatar({ user }) {
  if (!user) return null;
  const initials = (user.full_name || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className={styles.cardAvatar} title={user.full_name || user.email}>
      {user.avatar ? (
        <img src={user.avatar} alt={initials} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function DueDateBadge({ date }) {
  if (!date) return null;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = d < today;
  const isToday = d.getTime() === today.getTime();
  const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return (
    <span
      className={styles.dueBadge}
      style={{
        color: isPast ? "#ef4444" : isToday ? "#f59e0b" : "var(--text-muted)",
        background: isPast ? "rgba(239,68,68,0.1)" : isToday ? "rgba(245,158,11,0.1)" : "transparent",
      }}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
        <rect x="2" y="3" width="12" height="11" rx="2" />
        <path d="M11 1v4M5 1v4M2 7h12" />
      </svg>
      {label}
    </span>
  );
}

export function KanbanCard({ task, index, onOpen }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const totalSubs = task.subtask_total ?? 0;
  const doneSubs = task.subtask_done ?? 0;
  const progress = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={[styles.card, snapshot.isDragging ? styles.cardDragging : ""].join(" ")}
          onClick={() => onOpen(task)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onOpen(task)}
          aria-label={`Open task: ${task.title}`}
        >
          {/* Reference + priority */}
          <div className={styles.cardHeader}>
            {task.reference_label && (
              <span className={styles.cardRef}>{task.reference_label}</span>
            )}
            <span
              className={styles.priorityBadge}
              style={{ color: priority.color, background: priority.bg }}
            >
              {priority.label}
            </span>
          </div>

          {/* Title */}
          <p className={styles.cardTitle}>{task.title}</p>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className={styles.cardLabels}>
              {task.labels.map((l) => (
                <span
                  key={l.id}
                  className={styles.labelChip}
                  style={{ background: l.color + "22", color: l.color, borderColor: l.color + "44" }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          {/* Subtask progress bar */}
          {totalSubs > 0 && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressLabel}>{doneSubs}/{totalSubs}</span>
            </div>
          )}

          {/* Footer: assignee + due date */}
          <div className={styles.cardFooter}>
            <DueDateBadge date={task.due_date} />
            <Avatar user={task.assignee} />
          </div>
        </div>
      )}
    </Draggable>
  );
}
