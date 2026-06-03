/**
 * API functions for the notifications app.
 *
 * - Notifications: list, unread count, mark read, mark all read
 * - Attachments: list, request presigned upload URL, local upload (dev), delete
 * - Export Jobs: create, poll status, download URL
 */
import { apiClient } from "./client";

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  /** Paginated list of notifications for the current user, newest first. */
  list: (params = {}) =>
    apiClient.get("/notifications/", { params }),

  /** { count: N } — number of unread notifications */
  unreadCount: () =>
    apiClient.get("/notifications/unread-count/"),

  /** Mark a single notification as read. */
  markRead: (id) =>
    apiClient.post(`/notifications/${id}/read/`),

  /** Mark every notification as read. Returns { marked_read: N }. */
  markAllRead: () =>
    apiClient.post("/notifications/mark-all-read/"),
};

// ── Attachments ───────────────────────────────────────────────────────────────

export const attachmentsApi = {
  /** List all attachments on a task. */
  list: (taskId) =>
    apiClient.get(`/tasks/${taskId}/attachments/`),

  /**
   * Request a presigned upload URL (or null in dev).
   * Returns { upload_url, file_key, attachment_id }.
   */
  requestUpload: (taskId, { fileName, contentType, fileSize }) =>
    apiClient.post(`/tasks/${taskId}/attachments/upload/`, {
      file_name: fileName,
      content_type: contentType,
      file_size: fileSize,
    }),

  /**
   * Dev-only: upload the actual file bytes via multipart POST.
   * In production, the client PUTs directly to the S3 presigned URL.
   */
  uploadLocal: (taskId, file, attachmentId = null) => {
    const form = new FormData();
    form.append("file", file);
    if (attachmentId) form.append("attachment_id", attachmentId);

    // Use native fetch so we can track progress and avoid JSON serialisation
    return import("./client").then(({ apiClient: _, ...rest }) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/tasks/${taskId}/attachments/upload-local/`,
        {
          method: "POST",
          headers: buildAuthHeaders(),
          body: form,
        }
      ).then((r) => r.json())
    );
  },

  /**
   * Upload file to S3 presigned URL directly from browser.
   * Returns true on success.
   */
  uploadToS3: async (presignedUrl, file, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        });
      }
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.onload = () => (xhr.status < 300 ? resolve(true) : reject(new Error(`S3 upload failed: ${xhr.status}`)));
      xhr.onerror = () => reject(new Error("S3 upload network error"));
      xhr.send(file);
    });
  },

  /** Delete an attachment. */
  delete: (taskId, attachmentId) =>
    apiClient.del(`/tasks/${taskId}/attachments/${attachmentId}/`),
};

// ── Export Jobs ───────────────────────────────────────────────────────────────

export const exportApi = {
  /** Create an export job for a project. Returns the ExportJob. */
  create: (projectId) =>
    apiClient.post("/reports/", { project_id: projectId }),

  /** Poll an export job's status. */
  poll: (jobId) =>
    apiClient.get(`/reports/${jobId}/`),

  /** Get the presigned download URL for a completed job. */
  downloadUrl: (jobId) =>
    apiClient.get(`/reports/${jobId}/download/`),
};

// ── Internal helper ───────────────────────────────────────────────────────────

function buildAuthHeaders() {
  const headers = {};
  try {
    const raw = localStorage.getItem("taskforge_auth");
    if (raw) {
      const access = JSON.parse(raw)?.state?.tokens?.access;
      if (access) headers["Authorization"] = `Bearer ${access}`;
    }
  } catch { /* ignore */ }
  return headers;
}
