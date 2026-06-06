"use client";

/**
 * TaskDetailModal — full task view with editing, subtasks, comments, activity.
 *
 * Props:
 *   task        — task object (from TaskListSerializer, used for initial display)
 *   projectId   — UUID
 *   orgSlug     — string
 *   members     — array of { id, user_email, user_full_name, user_avatar }
 *   statuses    — array of TaskStatus
 *   onClose     — () => void
 */

import { useState, useEffect, useRef } from "react";
import {
  useTask,
  useUpdateTask,
  useSubtasks,
  useCreateSubtask,
  useToggleSubtask,
  useDeleteSubtask,
  useComments,
  useCreateComment,
  useDeleteComment,
  useActivityLog,
} from "@/lib/hooks/useTasks";
import styles from "./TaskDetailModal.module.css";

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low",    color: "#64748b" },
  { value: "medium", label: "Medium", color: "#9bd9ff" },
  { value: "high",   label: "High",   color: "#f59e0b" },
  { value: "urgent", label: "Urgent", color: "#ef4444" },
];

function UserAvatar({ user, size = 28 }) {
  if (!user) return null;
  const initials = (user.full_name || user.user_full_name || user.email || "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const avatar = user.avatar || user.user_avatar;
  return (
    <div className={styles.avatar} style={{ width: size, height: size }}>
      {avatar
        ? <img src={avatar} alt={initials} />
        : <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      }
    </div>
  );
}

function ActivityVerb({ verb }) {
  const map = {
    created: "created this task",
    status_changed: "changed the status",
    assignee_changed: "changed the assignee",
    priority_changed: "changed the priority",
    title_changed: "renamed this task",
    due_date_changed: "changed the due date",
  };
  return <span>{map[verb] ?? verb.replace(/_/g, " ")}</span>;
}

export function TaskDetailModal({ task: initialTask, projectId, orgSlug, members, statuses, onClose }) {
  const [activeTab, setActiveTab] = useState("subtasks"); // subtasks | comments | activity
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const overlayRef = useRef(null);

  // Full task detail (includes comments & subtasks)
  const { data: task } = useTask(orgSlug, projectId, initialTask?.id);
  const displayTask = task ?? initialTask;

  const updateTask = useUpdateTask(orgSlug, projectId, displayTask?.id);
  const { data: subtasks = [] } = useSubtasks(orgSlug, displayTask?.id);
  const createSubtask = useCreateSubtask(orgSlug, displayTask?.id);
  const toggleSubtask = useToggleSubtask(orgSlug, displayTask?.id);
  const deleteSubtask = useDeleteSubtask(orgSlug, displayTask?.id);
  const { data: comments = [] } = useComments(orgSlug, displayTask?.id);
  const createComment = useCreateComment(orgSlug, displayTask?.id);
  const deleteComment = useDeleteComment(orgSlug, displayTask?.id);
  const { data: activity = [] } = useActivityLog(orgSlug, displayTask?.id);

  // Sync title when task loads
  useEffect(() => {
    if (displayTask?.title) setTitle(displayTask.title);
  }, [displayTask?.title]);

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!displayTask) return null;

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (title.trim() && title !== displayTask.title) {
      updateTask.mutate({ title: title.trim() });
    }
  };

  const handleFieldChange = (field, value) => {
    updateTask.mutate({ [field]: value });
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    await createSubtask.mutateAsync({ title: newSubtask.trim() });
    setNewSubtask("");
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await createComment.mutateAsync({ body: newComment.trim() });
    setNewComment("");
  };

  const priorityCfg = PRIORITY_OPTIONS.find((p) => p.value === displayTask.priority) ?? PRIORITY_OPTIONS[1];

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            {displayTask.reference_label && (
              <span className={styles.refLabel}>{displayTask.reference_label}</span>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          {editingTitle ? (
            <textarea
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              autoFocus
              rows={2}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleTitleBlur(); } }}
            />
          ) : (
            <h2
              className={styles.title}
              onClick={() => setEditingTitle(true)}
              title="Click to edit"
            >
              {displayTask.title}
            </h2>
          )}
        </div>

        <div className={styles.body}>
          {/* ── Left: metadata ────────────────────────────────────────────────── */}
          <div className={styles.meta}>
            {/* Status */}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <select
                className={styles.metaSelect}
                value={displayTask.status?.id ?? displayTask.status_id ?? ""}
                onChange={(e) => handleFieldChange("status_id", e.target.value || null)}
              >
                <option value="">No status</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Priority</span>
              <select
                className={styles.metaSelect}
                value={displayTask.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
                style={{ color: priorityCfg.color }}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value} style={{ color: p.color }}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Assignee</span>
              <div className={styles.assigneeRow}>
                {displayTask.assignee && <UserAvatar user={displayTask.assignee} size={22} />}
                <select
                  className={styles.metaSelect}
                  value={displayTask.assignee?.id ?? ""}
                  onChange={(e) => handleFieldChange("assignee_id", e.target.value || null)}
                >
                  <option value="">Unassigned</option>
                  {members
                    .filter((m) => m.user_id)
                    .map((m) => (
                      <option key={m.user_id} value={m.user_id}>{m.user_full_name || m.user_email}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Due date */}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Due date</span>
              <input
                type="date"
                className={styles.metaInput}
                value={displayTask.due_date ?? ""}
                onChange={(e) => handleFieldChange("due_date", e.target.value || null)}
              />
            </div>
          </div>

          {/* ── Right: tabs ───────────────────────────────────────────────────── */}
          <div className={styles.content}>
            {/* Description */}
            <div className={styles.descSection}>
              <span className={styles.sectionLabel}>Description</span>
              <textarea
                className={styles.descInput}
                defaultValue={displayTask.description ?? ""}
                placeholder="Add a description…"
                rows={3}
                onBlur={(e) => {
                  if (e.target.value !== (displayTask.description ?? "")) {
                    handleFieldChange("description", e.target.value);
                  }
                }}
              />
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              {["subtasks", "comments", "activity"].map((tab) => (
                <button
                  key={tab}
                  className={[styles.tab, activeTab === tab ? styles.tabActive : ""].join(" ")}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "subtasks" && subtasks.length > 0 && (
                    <span className={styles.tabBadge}>{subtasks.length}</span>
                  )}
                  {tab === "comments" && comments.length > 0 && (
                    <span className={styles.tabBadge}>{comments.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: Subtasks */}
            {activeTab === "subtasks" && (
              <div className={styles.tabContent}>
                {subtasks.map((st) => (
                  <div key={st.id} className={styles.subtaskRow}>
                    <button
                      className={[styles.checkbox, st.completed ? styles.checkboxDone : ""].join(" ")}
                      onClick={() => toggleSubtask.mutate({ subtaskId: st.id, completed: !st.completed })}
                      aria-label={st.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {st.completed && (
                        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
                          <polyline points="1.5 5 4 7.5 8.5 2.5" />
                        </svg>
                      )}
                    </button>
                    <span className={[styles.subtaskTitle, st.completed ? styles.subtaskDone : ""].join(" ")}>
                      {st.title}
                    </span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteSubtask.mutate(st.id)}
                      aria-label="Delete subtask"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <form className={styles.addRow} onSubmit={handleAddSubtask}>
                  <input
                    className={styles.addInput}
                    placeholder="Add a subtask…"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                  />
                  <button type="submit" className={styles.addBtn} disabled={!newSubtask.trim()}>Add</button>
                </form>
              </div>
            )}

            {/* Tab: Comments */}
            {activeTab === "comments" && (
              <div className={styles.tabContent}>
                {comments.map((c) => (
                  <div key={c.id} className={styles.commentRow}>
                    <UserAvatar user={c.author} size={30} />
                    <div className={styles.commentBody}>
                      <div className={styles.commentMeta}>
                        <span className={styles.commentAuthor}>
                          {c.author?.full_name || c.author?.email}
                        </span>
                        <span className={styles.commentTime}>
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                        {c.is_own && (
                          <button
                            className={styles.deleteBtn}
                            onClick={() => deleteComment.mutate(c.id)}
                            aria-label="Delete comment"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className={styles.commentText}>{c.body}</p>
                    </div>
                  </div>
                ))}
                <form className={styles.commentForm} onSubmit={handleAddComment}>
                  <textarea
                    className={styles.commentInput}
                    placeholder="Write a comment…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(e); }
                    }}
                  />
                  <button type="submit" className={styles.addBtn} disabled={!newComment.trim()}>
                    Post
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Activity */}
            {activeTab === "activity" && (
              <div className={styles.tabContent}>
                {activity.length === 0 && (
                  <p className={styles.emptyState}>No activity yet.</p>
                )}
                {activity.map((log) => (
                  <div key={log.id} className={styles.activityRow}>
                    <UserAvatar user={log.actor} size={24} />
                    <div className={styles.activityText}>
                      <span className={styles.actorName}>
                        {log.actor?.full_name || log.actor?.email || "System"}
                      </span>{" "}
                      <ActivityVerb verb={log.verb} />
                      <span className={styles.activityTime}>
                        {" · "}{new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
