import { apiClient } from "./client";

// ── Projects ──────────────────────────────────────────────────────────────────

export const projectsApi = {
  /** GET /projects/ */
  list(orgSlug, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiClient.get(`/projects/${qs ? "?" + qs : ""}`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** POST /projects/ */
  create(orgSlug, data) {
    return apiClient.post("/projects/", data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** GET /projects/{id}/ */
  get(orgSlug, projectId) {
    return apiClient.get(`/projects/${projectId}/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** PATCH /projects/{id}/ */
  update(orgSlug, projectId, data) {
    return apiClient.patch(`/projects/${projectId}/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** DELETE /projects/{id}/ */
  delete(orgSlug, projectId) {
    return apiClient.del(`/projects/${projectId}/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** POST /projects/{id}/archive/ */
  archive(orgSlug, projectId) {
    return apiClient.post(`/projects/${projectId}/archive/`, null, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },
};

// ── Task Statuses (Kanban columns) ────────────────────────────────────────────

export const statusesApi = {
  /** GET /projects/{id}/statuses/ */
  list(orgSlug, projectId) {
    return apiClient.get(`/projects/${projectId}/statuses/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** POST /projects/{id}/statuses/ */
  create(orgSlug, projectId, data) {
    return apiClient.post(`/projects/${projectId}/statuses/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** PATCH /projects/{id}/statuses/{statusId}/ */
  update(orgSlug, projectId, statusId, data) {
    return apiClient.patch(`/projects/${projectId}/statuses/${statusId}/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** DELETE /projects/{id}/statuses/{statusId}/ */
  delete(orgSlug, projectId, statusId) {
    return apiClient.del(`/projects/${projectId}/statuses/${statusId}/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** POST /projects/{id}/statuses/reorder/ */
  reorder(orgSlug, projectId, orderedIds) {
    return apiClient.post(
      `/projects/${projectId}/statuses/reorder/`,
      { ordered_ids: orderedIds },
      { headers: { "X-Organization-Slug": orgSlug } }
    );
  },
};

// ── Labels ────────────────────────────────────────────────────────────────────

export const labelsApi = {
  /** GET /projects/{id}/labels/ */
  list(orgSlug, projectId) {
    return apiClient.get(`/projects/${projectId}/labels/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** POST /projects/{id}/labels/ */
  create(orgSlug, projectId, data) {
    return apiClient.post(`/projects/${projectId}/labels/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** PATCH /projects/{id}/labels/{labelId}/ */
  update(orgSlug, projectId, labelId, data) {
    return apiClient.patch(`/projects/${projectId}/labels/${labelId}/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** DELETE /projects/{id}/labels/{labelId}/ */
  delete(orgSlug, projectId, labelId) {
    return apiClient.del(`/projects/${projectId}/labels/${labelId}/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },
};

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const tasksApi = {
  /**
   * GET /projects/{id}/tasks/
   * @param {object} filters — status, assignee, priority, label, due_before, due_after, search
   */
  list(orgSlug, projectId, filters = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ""))
    ).toString();
    return apiClient.get(`/projects/${projectId}/tasks/${qs ? "?" + qs : ""}`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** GET /projects/{id}/tasks/{taskId}/ */
  get(orgSlug, projectId, taskId) {
    return apiClient.get(`/projects/${projectId}/tasks/${taskId}/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** POST /projects/{id}/tasks/ */
  create(orgSlug, projectId, data) {
    return apiClient.post(`/projects/${projectId}/tasks/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** PATCH /projects/{id}/tasks/{taskId}/ */
  update(orgSlug, projectId, taskId, data) {
    return apiClient.patch(`/projects/${projectId}/tasks/${taskId}/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /** DELETE /projects/{id}/tasks/{taskId}/ */
  delete(orgSlug, projectId, taskId) {
    return apiClient.del(`/projects/${projectId}/tasks/${taskId}/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  /**
   * PATCH /projects/{id}/tasks/{taskId}/move/
   * @param {{ status_id: string, order: number }} data
   */
  move(orgSlug, projectId, taskId, data) {
    return apiClient.patch(`/projects/${projectId}/tasks/${taskId}/move/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },
};

// ── SubTasks ──────────────────────────────────────────────────────────────────

export const subtasksApi = {
  list(orgSlug, taskId) {
    return apiClient.get(`/tasks/${taskId}/subtasks/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  create(orgSlug, taskId, data) {
    return apiClient.post(`/tasks/${taskId}/subtasks/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  update(orgSlug, taskId, subtaskId, data) {
    return apiClient.patch(`/tasks/${taskId}/subtasks/${subtaskId}/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  delete(orgSlug, taskId, subtaskId) {
    return apiClient.del(`/tasks/${taskId}/subtasks/${subtaskId}/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },
};

// ── Comments ──────────────────────────────────────────────────────────────────

export const commentsApi = {
  list(orgSlug, taskId) {
    return apiClient.get(`/tasks/${taskId}/comments/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  create(orgSlug, taskId, data) {
    return apiClient.post(`/tasks/${taskId}/comments/`, data, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },

  delete(orgSlug, taskId, commentId) {
    return apiClient.del(`/tasks/${taskId}/comments/${commentId}/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },
};

// ── Activity Log ──────────────────────────────────────────────────────────────

export const activityApi = {
  list(orgSlug, taskId) {
    return apiClient.get(`/tasks/${taskId}/activity/`, {
      headers: { "X-Organization-Slug": orgSlug },
    });
  },
};
