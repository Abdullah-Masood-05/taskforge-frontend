"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { exportApi } from "@/lib/api/notifications";
import styles from "./ExportReport.module.css";

const POLL_INTERVAL_MS = 2000;

/**
 * ExportReport — "Export PDF" button that:
 * 1. Creates an ExportJob via POST /reports/
 * 2. Polls GET /reports/{id}/ every 2s until status = "completed" or "failed"
 * 3. Shows a download link when done
 */
export function ExportReport({ projectId }) {
  const [job, setJob] = useState(null); // ExportJob response
  const [polling, setPolling] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  // Step 1: create the job
  const create = useMutation({
    mutationFn: () => exportApi.create(projectId),
    onSuccess: (data) => {
      setJob(data);
      setPolling(true);
      setError(null);
      setDownloadUrl(null);
    },
    onError: (e) => setError(e.message ?? "Failed to start export"),
  });

  // Step 2: poll for completion
  useEffect(() => {
    if (!polling || !job?.id) return;

    let timer;
    const poll = async () => {
      try {
        const updated = await exportApi.poll(job.id);
        setJob(updated);

        if (updated.status === "completed") {
          setPolling(false);
          // Fetch download URL
          const { download_url } = await exportApi.downloadUrl(job.id);
          setDownloadUrl(download_url);
        } else if (updated.status === "failed") {
          setPolling(false);
          setError(updated.error || "Export failed. Please try again.");
        } else {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (e) {
        setPolling(false);
        setError(e.message ?? "Polling failed");
      }
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [polling, job?.id]);

  const isRunning = create.isPending || polling;
  const isDone = job?.status === "completed" && downloadUrl;

  const reset = () => {
    setJob(null);
    setDownloadUrl(null);
    setError(null);
    setPolling(false);
  };

  return (
    <div className={styles.wrapper}>
      {!isRunning && !isDone && (
        <button
          id="export-report-btn"
          className={styles.exportBtn}
          onClick={() => create.mutate()}
          disabled={isRunning}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export PDF
        </button>
      )}

      {isRunning && (
        <div className={styles.status}>
          <span className={styles.spinner} aria-hidden="true" />
          <span className={styles.statusText}>
            {create.isPending
              ? "Starting export…"
              : job?.status === "processing"
                ? "Generating PDF…"
                : "Queued…"}
          </span>
        </div>
      )}

      {isDone && (
        <div className={styles.done}>
          <a
            href={downloadUrl}
            download
            className={styles.downloadBtn}
            id="export-download-link"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </a>
          <button className={styles.resetBtn} onClick={reset} title="Export again">
            ↺
          </button>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button className={styles.retryBtn} onClick={reset}>Retry</button>
        </div>
      )}
    </div>
  );
}
