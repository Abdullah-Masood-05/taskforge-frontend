"use client";

/**
 * Kanban board page.
 * Route: /orgs/[slug]/projects/[projectId]/board
 *
 * Real-time updates: useProjectBoard opens a WebSocket to
 * ws://.../ws/projects/{projectId}/board/?token=<jwt>
 * and keeps the TanStack Query task cache in sync.
 */

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import {
  useProject,
  useProjectStatuses,
  useTasks,
  useMoveTask,
  useCreateTask,
  useCreateStatus,
} from "@/lib/hooks/useTasks";
import { useProjectBoard } from "@/lib/hooks/useProjectBoard";
import { orgsApi } from "@/lib/api/orgs";
import { useQuery } from "@tanstack/react-query";
import styles from "./page.module.css";

function useOrgMembers(orgSlug) {
  return useQuery({
    queryKey: ["org-members", orgSlug],
    queryFn: () => orgsApi.listMembers(orgSlug),
    enabled: !!orgSlug,
    select: (d) => d?.results ?? [],
  });
}

export default function BoardPage() {
  const { slug, projectId } = useParams();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Data
  const { data: project } = useProject(slug, projectId);
  const { data: statuses = [], isLoading: statusesLoading } = useProjectStatuses(slug, projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(slug, projectId, filters);
  const { data: members = [] } = useOrgMembers(slug);

  // Real-time WebSocket sync — keeps task cache live across all tabs
  const { connected } = useProjectBoard(projectId);

  // Mutations
  const moveTask    = useMoveTask(slug, projectId);
  const createTask  = useCreateTask(slug, projectId);
  const createStatus = useCreateStatus(slug, projectId);

  const handleMove = useCallback(
    (data) => moveTask.mutateAsync(data),
    [moveTask]
  );

  const handleAddTask = useCallback(
    async (data) => { await createTask.mutateAsync(data); },
    [createTask]
  );

  const handleAddColumn = useCallback(
    async (data) => { await createStatus.mutateAsync(data); },
    [createStatus]
  );

  const isLoading = statusesLoading || tasksLoading;

  return (
    <div className={styles.page}>
      {/* ── Topbar ──────────────────────────────────────────────────────────── */}
      <div className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <Link href={`/orgs/${slug}/projects`} className={styles.breadLink}>
            Projects
          </Link>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>{project?.name ?? "…"}</span>
        </div>

        <div className={styles.topbarActions}>
          {/* Live indicator */}
          <span
            className={styles.liveIndicator}
            data-connected={connected}
            title={connected ? "Live updates active" : "Connecting…"}
          />

          {/* Filter toggle */}
          <button
            className={[styles.filterBtn, showFilters ? styles.filterBtnActive : ""].join(" ")}
            onClick={() => setShowFilters((p) => !p)}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" width="14" height="14">
              <path d="M2 4h12M4 8h8M6 12h4" />
            </svg>
            Filter
          </button>

          {/* New Task */}
          <button
            className={styles.newTaskBtn}
            onClick={() => setShowNewTask(true)}
            disabled={statuses.length === 0}
            title={statuses.length === 0 ? "Create a column first" : "Add a new task"}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" width="13" height="13">
              <path d="M8 3v10M3 8h10" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className={styles.filterBar}>
          <select
            className={styles.filterSelect}
            value={filters.priority ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value || undefined }))}
          >
            <option value="">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className={styles.filterSelect}
            value={filters.assignee ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value || undefined }))}
          >
            <option value="">All assignees</option>
            <option value="unassigned">Unassigned</option>
            {members
              .filter((m) => m.user_id)
              .map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.user_full_name || m.user_email}
                </option>
              ))}
          </select>

          <input
            className={styles.filterInput}
            placeholder="Search tasks…"
            value={filters.search ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          />

          {Object.values(filters).some(Boolean) && (
            <button className={styles.clearFilters} onClick={() => setFilters({})}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Board ───────────────────────────────────────────────────────────── */}
      <div className={styles.boardWrap}>
        {isLoading ? (
          <div className={styles.loadingRow}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.skeletonCol} />
            ))}
          </div>
        ) : (
          <KanbanBoard
            statuses={statuses}
            tasks={tasks}
            onMove={handleMove}
            onAddTask={handleAddTask}
            onAddColumn={handleAddColumn}
            onCardOpen={setSelectedTask}
          />
        )}
      </div>

      {/* ── Task detail modal ────────────────────────────────────────────────── */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          orgSlug={slug}
          members={members}
          statuses={statuses}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* ── New task modal ───────────────────────────────────────────────────── */}
      {showNewTask && (
        <NewTaskModal
          orgSlug={slug}
          projectId={projectId}
          statuses={statuses}
          members={members}
          onClose={() => setShowNewTask(false)}
        />
      )}
    </div>
  );
}
