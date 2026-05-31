"use client";

/**
 * KanbanColumn — a single droppable Kanban column.
 * Contains task cards and an "Add card" quick-entry form.
 */

import { Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import { KanbanCard } from "./KanbanCard";
import styles from "./KanbanBoard.module.css";

export function KanbanColumn({ status, tasks, onCardOpen, onAddTask, isAddingTask }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setSubmitting(true);
    await onAddTask({ title: quickTitle.trim(), status_id: status.id });
    setQuickTitle("");
    setShowQuickAdd(false);
    setSubmitting(false);
  };

  return (
    <div className={styles.column}>
      {/* Column header */}
      <div className={styles.columnHeader}>
        <div className={styles.columnTitleRow}>
          <span
            className={styles.columnDot}
            style={{ background: status.color }}
          />
          <h3 className={styles.columnTitle}>{status.name}</h3>
          <span className={styles.columnCount}>{tasks.length}</span>
        </div>
        <button
          className={styles.addCardBtn}
          onClick={() => setShowQuickAdd(true)}
          title="Add task"
          aria-label={`Add task to ${status.name}`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
      </div>

      {/* Droppable task list */}
      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={[
              styles.cardList,
              snapshot.isDraggingOver ? styles.cardListOver : "",
            ].join(" ")}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onOpen={onCardOpen}
              />
            ))}
            {provided.placeholder}

            {/* Quick add card */}
            {showQuickAdd && (
              <form className={styles.quickAdd} onSubmit={handleQuickAdd}>
                <textarea
                  className={styles.quickAddInput}
                  placeholder="Task title…"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  autoFocus
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickAdd(e);
                    }
                    if (e.key === "Escape") {
                      setShowQuickAdd(false);
                      setQuickTitle("");
                    }
                  }}
                />
                <div className={styles.quickAddActions}>
                  <button
                    type="submit"
                    className={styles.quickAddSave}
                    disabled={submitting || !quickTitle.trim()}
                  >
                    Add card
                  </button>
                  <button
                    type="button"
                    className={styles.quickAddCancel}
                    onClick={() => { setShowQuickAdd(false); setQuickTitle(""); }}
                  >
                    ✕
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
