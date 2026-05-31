/**
 * React Query hooks for the tasks app.
 *
 * All hooks require `orgSlug` from the org context (passed via X-Organization-Slug).
 * Cache keys follow a [entity, orgSlug, ...ids, filters] pattern for precise invalidation.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activityApi,
  commentsApi,
  labelsApi,
  projectsApi,
  statusesApi,
  subtasksApi,
  tasksApi,
} from "../api/tasks";

// ── Query key factories ───────────────────────────────────────────────────────

export const taskKeys = {
  projects: (orgSlug) => ["projects", orgSlug],
  project: (orgSlug, id) => ["projects", orgSlug, id],
  statuses: (orgSlug, projectId) => ["statuses", orgSlug, projectId],
  labels: (orgSlug, projectId) => ["labels", orgSlug, projectId],
  tasks: (orgSlug, projectId, filters) => ["tasks", orgSlug, projectId, filters ?? {}],
  task: (orgSlug, projectId, taskId) => ["task", orgSlug, projectId, taskId],
  subtasks: (orgSlug, taskId) => ["subtasks", orgSlug, taskId],
  comments: (orgSlug, taskId) => ["comments", orgSlug, taskId],
  activity: (orgSlug, taskId) => ["activity", orgSlug, taskId],
};

// ── Projects ──────────────────────────────────────────────────────────────────

export function useProjects(orgSlug, params) {
  return useQuery({
    queryKey: taskKeys.projects(orgSlug),
    queryFn: () => projectsApi.list(orgSlug, params),
    enabled: !!orgSlug,
    select: (data) => data?.results ?? [],
  });
}

export function useProject(orgSlug, projectId) {
  return useQuery({
    queryKey: taskKeys.project(orgSlug, projectId),
    queryFn: () => projectsApi.get(orgSlug, projectId),
    enabled: !!orgSlug && !!projectId,
  });
}

export function useCreateProject(orgSlug) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectsApi.create(orgSlug, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.projects(orgSlug) }),
  });
}

export function useUpdateProject(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectsApi.update(orgSlug, projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.projects(orgSlug) });
      qc.invalidateQueries({ queryKey: taskKeys.project(orgSlug, projectId) });
    },
  });
}

export function useDeleteProject(orgSlug) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId) => projectsApi.delete(orgSlug, projectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.projects(orgSlug) }),
  });
}

export function useArchiveProject(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => projectsApi.archive(orgSlug, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.projects(orgSlug) });
      qc.invalidateQueries({ queryKey: taskKeys.project(orgSlug, projectId) });
    },
  });
}

// ── Task Statuses ─────────────────────────────────────────────────────────────

export function useProjectStatuses(orgSlug, projectId) {
  return useQuery({
    queryKey: taskKeys.statuses(orgSlug, projectId),
    queryFn: () => statusesApi.list(orgSlug, projectId),
    enabled: !!orgSlug && !!projectId,
    select: (data) => data?.results ?? [],
  });
}

export function useCreateStatus(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => statusesApi.create(orgSlug, projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.statuses(orgSlug, projectId) }),
  });
}

export function useReorderStatuses(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds) => statusesApi.reorder(orgSlug, projectId, orderedIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.statuses(orgSlug, projectId) }),
  });
}

export function useDeleteStatus(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (statusId) => statusesApi.delete(orgSlug, projectId, statusId),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.statuses(orgSlug, projectId) }),
  });
}

// ── Labels ────────────────────────────────────────────────────────────────────

export function useProjectLabels(orgSlug, projectId) {
  return useQuery({
    queryKey: taskKeys.labels(orgSlug, projectId),
    queryFn: () => labelsApi.list(orgSlug, projectId),
    enabled: !!orgSlug && !!projectId,
    select: (data) => data?.results ?? [],
  });
}

export function useCreateLabel(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => labelsApi.create(orgSlug, projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.labels(orgSlug, projectId) }),
  });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function useTasks(orgSlug, projectId, filters) {
  return useQuery({
    queryKey: taskKeys.tasks(orgSlug, projectId, filters),
    queryFn: () => tasksApi.list(orgSlug, projectId, filters),
    enabled: !!orgSlug && !!projectId,
    select: (data) => data?.results ?? [],
  });
}

export function useTask(orgSlug, projectId, taskId) {
  return useQuery({
    queryKey: taskKeys.task(orgSlug, projectId, taskId),
    queryFn: () => tasksApi.get(orgSlug, projectId, taskId),
    enabled: !!orgSlug && !!projectId && !!taskId,
  });
}

export function useCreateTask(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tasksApi.create(orgSlug, projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", orgSlug, projectId] }),
  });
}

export function useUpdateTask(orgSlug, projectId, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tasksApi.update(orgSlug, projectId, taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", orgSlug, projectId] });
      qc.invalidateQueries({ queryKey: taskKeys.task(orgSlug, projectId, taskId) });
    },
  });
}

export function useDeleteTask(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => tasksApi.delete(orgSlug, projectId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", orgSlug, projectId] }),
  });
}

export function useMoveTask(orgSlug, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...data }) => tasksApi.move(orgSlug, projectId, taskId, data),
    // Optimistic update is handled by the Kanban board component directly
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", orgSlug, projectId] }),
  });
}

// ── SubTasks ──────────────────────────────────────────────────────────────────

export function useSubtasks(orgSlug, taskId) {
  return useQuery({
    queryKey: taskKeys.subtasks(orgSlug, taskId),
    queryFn: () => subtasksApi.list(orgSlug, taskId),
    enabled: !!orgSlug && !!taskId,
    select: (data) => data?.results ?? [],
  });
}

export function useCreateSubtask(orgSlug, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => subtasksApi.create(orgSlug, taskId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.subtasks(orgSlug, taskId) }),
  });
}

export function useToggleSubtask(orgSlug, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subtaskId, completed }) =>
      subtasksApi.update(orgSlug, taskId, subtaskId, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.subtasks(orgSlug, taskId) }),
  });
}

export function useDeleteSubtask(orgSlug, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subtaskId) => subtasksApi.delete(orgSlug, taskId, subtaskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.subtasks(orgSlug, taskId) }),
  });
}

// ── Comments ──────────────────────────────────────────────────────────────────

export function useComments(orgSlug, taskId) {
  return useQuery({
    queryKey: taskKeys.comments(orgSlug, taskId),
    queryFn: () => commentsApi.list(orgSlug, taskId),
    enabled: !!orgSlug && !!taskId,
    select: (data) => data?.results ?? [],
  });
}

export function useCreateComment(orgSlug, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => commentsApi.create(orgSlug, taskId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.comments(orgSlug, taskId) }),
  });
}

export function useDeleteComment(orgSlug, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => commentsApi.delete(orgSlug, taskId, commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.comments(orgSlug, taskId) }),
  });
}

// ── Activity Log ──────────────────────────────────────────────────────────────

export function useActivityLog(orgSlug, taskId) {
  return useQuery({
    queryKey: taskKeys.activity(orgSlug, taskId),
    queryFn: () => activityApi.list(orgSlug, taskId),
    enabled: !!orgSlug && !!taskId,
    select: (data) => data?.results ?? [],
  });
}
