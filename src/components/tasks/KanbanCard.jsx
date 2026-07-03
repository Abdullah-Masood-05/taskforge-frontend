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
  medium: { label: "Medium", color: "#9bd9ff", bg: "rgba(155,217,255,0.12)" },
  low:    { label: "Low",    color: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

function Avatar({ user, style }) {
  if (!user) return null;
  const initials = (user.full_name || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const src = user.avatar_url || user.avatar;
  return (
    <div className={styles.cardAvatar} title={user.full_name || user.email} style={style}>
      {src ? <img src={src} alt={initials} /> : <span>{initials}</span>}
    </div>
  );
}

/** Overlapping avatar cluster — max 3 visible, then a "+N" overflow badge. */
function AvatarStack({ users }) {
  if (!users?.length) return null;
  const visible = users.slice(0, 3);
  const overflow = users.length - visible.length;
  return (
    <div className={styles.avatarStack}>
      {visible.map((u, i) => (
        <Avatar key={u.id ?? i} user={u} style={{ zIndex: visible.length - i }} />
      ))}
      {overflow > 0 && (
        <div
          className={[styles.cardAvatar, styles.avatarOverflow].join(" ")}
          title={users.slice(3).map((u) => u.full_name || u.email).join(", ")}
        >
          <span>+{overflow}</span>
        </div>
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
        <circle cx="8" cy="8" r="6.25" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
      </svg>
      {label}
    </span>
  );
}

/** Compact read-only progress pill shown on cards that carry manual progress. */
function ProgressPill({ percent }) {
  return (
    <span className={styles.progressPill} title={`${percent}% complete`}>
      <span className={styles.progressPillTrack}>
        <span className={styles.progressPillFill} style={{ width: `${percent}%` }} />
      </span>
      {percent}%
    </span>
  );
}

export function KanbanCard({ task, index, onOpen }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const totalSubs = task.subtask_total ?? 0;
  const doneSubs = task.subtask_done ?? 0;
  const progress = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;
  // Multi-assignee list, falling back to the legacy single assignee shape
  const assignees = task.assignees?.length
    ? task.assignees
    : task.assignee
      ? [task.assignee]
      : [];
  const taskProgress = task.progress_percent ?? 0;

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
          {/* Reference + priority + manual progress */}
          <div className={styles.cardHeader}>
            {task.reference_label && (
              <span className={styles.cardRef}>{task.reference_label}</span>
            )}
            <span className={styles.cardHeaderRight}>
              <span
                className={styles.priorityBadge}
                style={{ color: priority.color, background: priority.bg }}
              >
                {priority.label}
              </span>
              {taskProgress > 0 && taskProgress < 100 && (
                <ProgressPill percent={taskProgress} />
              )}
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

          {/* Footer: due date + assignee cluster */}
          <div className={styles.cardFooter}>
            <DueDateBadge date={task.due_date} />
            <AvatarStack users={assignees} />
          </div>
        </div>
      )}
    </Draggable>
  );
}
