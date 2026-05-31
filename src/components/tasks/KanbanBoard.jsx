"use client";

/**
 * KanbanBoard — the main board container.
 *
 * - DragDropContext wraps all columns.
 * - On drop: computes new order (mid-point between neighbours) and calls onMove.
 * - Optimistic update is applied immediately to local state; React Query sync on success.
 */

import { DragDropContext } from "@hello-pangea/dnd";
import { useState, useCallback, useMemo } from "react";
import { KanbanColumn } from "./KanbanColumn";
import styles from "./KanbanBoard.module.css";

/** Compute a new order value that slots between `before` and `after`. */
function midOrder(before, after) {
  const lo = before ?? 0;
  const hi = after ?? lo + 2000;
  return Math.round((lo + hi) / 2);
}

export function KanbanBoard({ statuses, tasks, onMove, onAddTask, onCardOpen }) {
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
        // Let React Query invalidation overwrite optimistic state
        setOptimisticTasks(null);
      }
    },
    [activeTasks, tasksByStatus, onMove]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {statuses.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            tasks={tasksByStatus[status.id] || []}
            onCardOpen={onCardOpen}
            onAddTask={onAddTask}
          />
        ))}
        {statuses.length === 0 && (
          <div className={styles.emptyBoard}>
            <p>No columns yet. Create a status column to start organising tasks.</p>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
