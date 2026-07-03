"use client";

/**
 * BoardToolbar — secondary toolbar between the project header and the board.
 * Purely presentational wrapper: section label + refresh/share/add controls.
 */

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/lib/store/toastStore";
import styles from "./BoardToolbar.module.css";

export function BoardToolbar({ orgSlug, projectId, onAddTask }) {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["tasks", orgSlug, projectId] }),
        qc.invalidateQueries({ queryKey: ["statuses", orgSlug, projectId] }),
        qc.invalidateQueries({ queryKey: ["projects", orgSlug, projectId] }),
        qc.invalidateQueries({ queryKey: ["project-timeline", orgSlug, projectId] }),
        qc.invalidateQueries({ queryKey: ["project-analytics", orgSlug, projectId] }),
        qc.invalidateQueries({ queryKey: ["project-activity", orgSlug, projectId] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Board link copied to clipboard");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.labelWrap}>
        <span className={styles.label}>Workflow Stages</span>
        <span className={styles.sublabel}>Drag tasks between stages to update their status</span>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.iconBtn}
          onClick={handleRefresh}
          title="Refresh board data"
          aria-label="Refresh board data"
          disabled={refreshing}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            width="14"
            height="14"
            className={refreshing ? styles.spinning : undefined}
          >
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3" strokeLinecap="round" />
          </svg>
        </button>
        <button className={styles.iconBtn} onClick={handleShare} title="Copy board link" aria-label="Copy board link">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
            <circle cx="4" cy="8" r="2" /><circle cx="12" cy="4" r="2" /><circle cx="12" cy="12" r="2" />
            <path d="M5.8 7.1l4.4-2.2M5.8 8.9l4.4 2.2" />
          </svg>
        </button>
        <button className={styles.addBtn} onClick={onAddTask}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" width="12" height="12">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
}
