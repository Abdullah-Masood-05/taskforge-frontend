"use client";

import { useState } from "react";
import { useCreateTask } from "@/lib/hooks/useTasks";
import styles from "./NewTaskModal.module.css";

const PRIORITIES = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function NewTaskModal({ orgSlug, projectId, statuses, members, onClose }) {
  const [title, setTitle]       = useState("");
  const [statusId, setStatusId] = useState(statuses[0]?.id ?? "");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate]   = useState("");
  const [error, setError]       = useState("");

  const createTask = useCreateTask(orgSlug, projectId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!statusId)     { setError("Select a column."); return; }
    setError("");

    const payload = {
      title: title.trim(),
      status_id: statusId,
      priority,
      ...(assigneeId && { assignee_id: assigneeId }),
      ...(dueDate    && { due_date: dueDate }),
    };

    await createTask.mutateAsync(payload);
    onClose();
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="New task">
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerLabel}>NEW TASK</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nt-title">Title *</label>
            <textarea
              id="nt-title"
              className={styles.textarea}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
              }}
            />
          </div>

          {/* Two-col: Column + Priority */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nt-status">Column *</label>
              <select
                id="nt-status"
                className={styles.select}
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="nt-priority">Priority</label>
              <select
                id="nt-priority"
                className={styles.select}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Two-col: Assignee + Due date */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nt-assignee">Assignee</label>
              <select
                id="nt-assignee"
                className={styles.select}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members
                  .filter((m) => m.user_id)
                  .map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.user_full_name || m.user_email}
                    </option>
                  ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="nt-due">Due date</label>
              <input
                id="nt-due"
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={createTask.isPending || !title.trim()}
            >
              {createTask.isPending ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
