"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attachmentsApi } from "@/lib/api/notifications";
import styles from "./FileUpload.module.css";

/**
 * FileUpload — drag-and-drop + file picker for a task.
 *
 * Upload flow (dev vs prod):
 *   Dev  (USE_S3=false): request_upload → get file_key + null upload_url
 *                        → POST to /upload-local/ with file bytes
 *   Prod (USE_S3=true):  request_upload → get presigned PUT url
 *                        → PUT file directly to S3
 */
export function FileUpload({ taskId }) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null); // 0-100 or null
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // ── List existing attachments ─────────────────────────────────────────────
  const { data } = useQuery({
    queryKey: ["attachments", taskId],
    queryFn: () => attachmentsApi.list(taskId),
    staleTime: 30_000,
  });
  const attachments = data?.results ?? [];

  // ── Delete attachment ─────────────────────────────────────────────────────
  const deleteAttachment = useMutation({
    mutationFn: (id) => attachmentsApi.delete(taskId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attachments", taskId] }),
  });

  // ── Upload logic ──────────────────────────────────────────────────────────
  const uploadFile = useCallback(async (file) => {
    if (!file) return;
    setError(null);
    setProgress(0);

    try {
      // Step 1: request presigned URL (creates Attachment record)
      const { upload_url, file_key, attachment_id } = await attachmentsApi.requestUpload(
        taskId,
        { fileName: file.name, contentType: file.type || "application/octet-stream", fileSize: file.size }
      );

      // Step 2: upload the file
      if (upload_url) {
        // Production: PUT directly to S3
        await attachmentsApi.uploadToS3(upload_url, file, setProgress);
      } else {
        // Dev: POST to local upload endpoint
        await attachmentsApi.uploadLocal(taskId, file, attachment_id);
        setProgress(100);
      }

      await queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
      setTimeout(() => setProgress(null), 800);
    } catch (e) {
      setError(e.message ?? "Upload failed");
      setProgress(null);
    }
  }, [taskId, queryClient]);

  // ── Drag-and-drop handlers ────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = ""; // reset so same file can be re-selected
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Attachments</h3>

      {/* Drop zone */}
      <div
        className={[styles.dropzone, dragging ? styles.dragging : ""].join(" ")}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload file"
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        id="file-drop-zone"
      >
        <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M3 16.5v1A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5v-1" />
        </svg>
        <span className={styles.dropText}>
          <strong>Click to upload</strong> or drag & drop
        </span>
        <span className={styles.dropHint}>Any file up to 50 MB</span>
        <input
          ref={fileInputRef}
          type="file"
          className={styles.hiddenInput}
          onChange={onInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Upload progress */}
      {progress !== null && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Error */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Attachment list */}
      {attachments.length > 0 && (
        <ul className={styles.list}>
          {attachments.map((att) => (
            <li key={att.id} className={styles.listItem}>
              <div className={styles.fileInfo}>
                <FileIcon contentType={att.content_type} />
                <div>
                  <a
                    href={att.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileName}
                  >
                    {att.file_name}
                  </a>
                  <span className={styles.fileMeta}>
                    {formatBytes(att.file_size)}
                    {att.uploaded_by_name && ` · ${att.uploaded_by_name}`}
                  </span>
                </div>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteAttachment.mutate(att.id)}
                aria-label={`Delete ${att.file_name}`}
                title="Delete attachment"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FileIcon({ contentType }) {
  const isPdf = contentType?.includes("pdf");
  const isImage = contentType?.startsWith("image/");
  return (
    <svg className={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      {isPdf
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        : isImage
          ? <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      }
    </svg>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
