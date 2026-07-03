"use client";

/**
 * ImportProjectModal — upload a TaskForge project export (.json),
 * preview what's inside, then create the project via the import endpoint.
 */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/lib/store/toastStore";
import { useImportProject } from "@/lib/hooks/useTasks";
import styles from "./ImportProjectModal.module.css";

export function ImportProjectModal({ orgSlug, onClose }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parseError, setParseError] = useState(null);
  const importProject = useImportProject(orgSlug);

  const handleFile = async (picked) => {
    setFile(null);
    setPreview(null);
    setParseError(null);
    if (!picked) return;

    try {
      const text = await picked.text();
      const data = JSON.parse(text);
      if (data.format !== "taskforge.project") {
        setParseError("This file is not a TaskForge project export.");
        return;
      }
      setFile(picked);
      setPreview({
        name: data.project?.name ?? "Untitled project",
        statuses: data.statuses?.length ?? 0,
        labels: data.labels?.length ?? 0,
        tasks: data.tasks?.length ?? 0,
      });
    } catch {
      setParseError("Could not read this file as JSON.");
    }
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      const result = await importProject.mutateAsync(file);
      toast.success(`Imported "${result.project?.name}" (${result.imported?.tasks} tasks)`);
      onClose();
      if (result.project?.id) {
        router.push(`/orgs/${orgSlug}/projects/${result.project.id}/board`);
      }
    } catch (err) {
      toast.error(err?.message || "Import failed — check the file and try again.");
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Import Project"
      footer={
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleImport}
            disabled={!file || importProject.isPending}
          >
            {importProject.isPending ? "Importing…" : "Import Project"}
          </button>
        </div>
      }
    >
      <div className={styles.body}>
        <p className={styles.hint}>
          Upload a project file created with <strong>Export JSON</strong>. Statuses, labels,
          tasks and assignees (matched by email) are recreated in this workspace.
        </p>

        <button
          type="button"
          className={styles.dropzone}
          onClick={() => fileRef.current?.click()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" />
          </svg>
          {file ? file.name : "Choose a .json export file"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className={styles.hiddenInput}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {parseError && <p className={styles.error}>{parseError}</p>}

        {preview && (
          <div className={styles.preview}>
            <p className={styles.previewName}>{preview.name}</p>
            <div className={styles.previewStats}>
              <span className={styles.stat}>
                <strong>{preview.tasks}</strong> tasks
              </span>
              <span className={styles.stat}>
                <strong>{preview.statuses}</strong> columns
              </span>
              <span className={styles.stat}>
                <strong>{preview.labels}</strong> labels
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
