"use client";

/**
 * KanbanBoard — the main board container.
 *
 * - DragDropContext wraps all columns.
 * - On drop: computes new order (mid-point between neighbours) and calls onMove.
 * - Optimistic update is applied immediately to local state; React Query sync on success.
 * - onAddColumn prop enables creating new status columns inline.
 */

import { DragDropContext } from "@hello-pangea/dnd";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import styles from "./KanbanBoard.module.css";

const COL_COLORS = [
  "#9f8e7a", // muted (default)
  "#f5a623", // amber
  "#10b981", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f59e0b", // yellow
];

/** Compute a new order value that slots between `before` and `after`. */
function midOrder(before, after) {
  const lo = before ?? 0;
  const hi = after ?? lo + 2000;
  return Math.round((lo + hi) / 2);
}

function AddColumnTile({ onAddColumn }) {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [color, setColor]     = useState(COL_COLORS[0]);
  const [saving, setSaving]   = useState(false);
  const inputRef              = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const reset = () => { setOpen(false); setName(""); setColor(COL_COLORS[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAddColumn({ name: name.trim(), color });
      reset();
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button className={styles.addColTile} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M8 3v10M3 8h10" />
        </svg>
        Add Column
      </button>
    );
  }

  return (
    <div className={styles.addColForm}>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className={styles.addColInput}
          placeholder="Column name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") reset(); }}
          maxLength={40}
        />
        <div className={styles.colorRow}>
          {COL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={[styles.colorSwatch, color === c ? styles.colorSwatchActive : ""].join(" ")}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
        <div className={styles.addColActions}>
          <button
            type="submit"
            className={styles.addColSave}
            disabled={saving || !name.trim()}
          >
            {saving ? "Adding…" : "Add Column"}
          </button>
          <button type="button" className={styles.addColCancel} onClick={reset}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function KanbanBoard({ statuses, tasks, onMove, onAddTask, onAddColumn, onCardOpen }) {
  // Local optimistic task list — updated immediately on drag
  const [optimisticTasks, setOptimisticTasks] = useState(null);

  const activeTasks = optimisticTasks ?? tasks;

  // Group tasks by status_id
  const tasksByStatus = useMemo(() => {
    const map = {};
    statuses.forEach((s) => { map[s.id] = []; });
    (activeTasks || []).forEach((t) => {
      const key = t.status_id;
      if (map[key]) map[key].push(t);
    });
    // Sort each column by order
    Object.values(map).forEach((col) => col.sort((a, b) => a.order - b.order));
    return map;
  }, [statuses, activeTasks]);

  const onDragEnd = useCallback(
    async (result) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      const destCol = tasksByStatus[destination.droppableId] || [];
      const task = (activeTasks || []).find((t) => t.id === draggableId);
      if (!task) return;

      // Compute the new order
      const filtered = destCol.filter((t) => t.id !== draggableId);
      const before = filtered[destination.index - 1]?.order;
      const after = filtered[destination.index]?.order;
      const newOrder = midOrder(before, after);

      // Optimistic update
      const updated = (activeTasks || []).map((t) =>
        t.id === draggableId
          ? { ...t, status_id: destination.droppableId, order: newOrder }
          : t
      );
      setOptimisticTasks(updated);

      try {
        await onMove({ taskId: draggableId, status_id: destination.droppableId, order: newOrder });
      } finally {
        setOptimisticTasks(null);
      }
    },
    [activeTasks, tasksByStatus, onMove]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {statuses.length === 0 && (
          <div className={styles.emptyBoard}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                <rect x="6" y="10" width="10" height="28" rx="2" strokeOpacity=".4" />
                <rect x="19" y="10" width="10" height="20" rx="2" strokeOpacity=".4" />
                <rect x="32" y="10" width="10" height="24" rx="2" strokeOpacity=".4" />
                <path d="M24 34v8M20 38h8" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>No columns yet</p>
            <p className={styles.emptyHint}>Add your first column to start organising tasks.</p>
          </div>
        )}

        {statuses.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            tasks={tasksByStatus[status.id] || []}
            onCardOpen={onCardOpen}
            onAddTask={onAddTask}
          />
        ))}

        {onAddColumn && <AddColumnTile onAddColumn={onAddColumn} />}
      </div>
    </DragDropContext>
  );
}
