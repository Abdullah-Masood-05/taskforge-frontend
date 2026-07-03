"use client";

/**
 * ProjectHeader — "mission control" header above the board.
 *
 * Name + inline rename, thin progress bar with %, meta line
 * (status / due / priority / owner), and right-aligned actions:
 * + Add Task, Share (copies board URL) and a More menu
 * (Rename / Export JSON / Import Project / Archive / Delete).
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "@/lib/store/toastStore";
import {
  useArchiveProject,
  useDeleteProject,
  useUpdateProject,
} from "@/lib/hooks/useTasks";
import { projectsApi } from "@/lib/api/tasks";
import { formatShortDate } from "@/lib/utils/format";
import { ImportProjectModal } from "./ImportProjectModal";
import styles from "./ProjectHeader.module.css";

const STATUS_LABELS = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
};

const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };

export function ProjectHeader({ project, orgSlug, projectId, onAddTask }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [showImport, setShowImport] = useState(false);
  const menuRef = useRef(null);
  const renameRef = useRef(null);

  const updateProject = useUpdateProject(orgSlug, projectId);
  const archiveProject = useArchiveProject(orgSlug);
  const deleteProject = useDeleteProject(orgSlug);

  // Close the More menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming) renameRef.current?.focus();
  }, [renaming]);

  if (!project) return null;

  const progress = project.progress_percent ?? 0;
  const owner = project.owner;

  const startRename = () => {
    setNameDraft(project.name);
    setRenaming(true);
    setMenuOpen(false);
  };

  const commitRename = async () => {
    const name = nameDraft.trim();
    setRenaming(false);
    if (!name || name === project.name) return;
    try {
      await updateProject.mutateAsync({ name });
      toast.success("Project renamed");
    } catch {
      toast.error("Could not rename the project");
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

  const handleExport = async () => {
    setMenuOpen(false);
    try {
      const data = await projectsApi.export(orgSlug, projectId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(project.name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Project exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleArchive = async () => {
    setMenuOpen(false);
    try {
      await archiveProject.mutateAsync(projectId);
      toast.success(project.archived ? "Project unarchived" : "Project archived");
    } catch {
      toast.error("Could not update the project");
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = window.confirm(
      `Delete "${project.name}"? Tasks stay recoverable by an admin, but the project disappears from the workspace.`
    );
    if (!ok) return;
    try {
      await deleteProject.mutateAsync(projectId);
      toast.success("Project deleted");
      router.push(`/orgs/${orgSlug}/projects`);
    } catch {
      toast.error("Could not delete the project");
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        {renaming ? (
          <input
            ref={renameRef}
            className={styles.renameInput}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setRenaming(false);
            }}
            maxLength={200}
          />
        ) : (
          <h1 className={styles.title} onDoubleClick={startRename} title="Double-click to rename">
            {project.name}
          </h1>
        )}

        <div className={styles.progressRow}>
          <div className={styles.progressBar} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressLabel}>{progress}%</span>
        </div>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.metaKey}>Status:</span>
            <span className={styles.statusPill} data-status={project.status}>
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          </span>
          <span className={styles.metaSep}>|</span>
          <span className={styles.metaItem}>
            <span className={styles.metaKey}>Due:</span>
            {project.due_date ? formatShortDate(project.due_date) : "—"}
          </span>
          <span className={styles.metaSep}>|</span>
          <span className={styles.metaItem}>
            <span className={styles.metaKey}>Priority:</span>
            <span className={styles.priorityText} data-priority={project.priority}>
              {PRIORITY_LABELS[project.priority] ?? project.priority}
            </span>
          </span>
          {owner && (
            <>
              <span className={styles.metaSep}>|</span>
              <span className={styles.metaItem}>
                <span className={styles.metaKey}>Owner:</span>
                <Avatar
                  src={owner.avatar_url || owner.avatar}
                  name={owner.full_name || owner.email}
                  size="sm"
                  className={styles.ownerAvatar}
                />
                {owner.full_name || owner.email}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={onAddTask}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.25" width="13" height="13">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Add Task
        </button>
        <button className={styles.ghostBtn} onClick={handleShare}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
            <circle cx="4" cy="8" r="2" /><circle cx="12" cy="4" r="2" /><circle cx="12" cy="12" r="2" />
            <path d="M5.8 7.1l4.4-2.2M5.8 8.9l4.4 2.2" />
          </svg>
          Share
        </button>

        <div className={styles.menuWrap} ref={menuRef}>
          <button
            className={styles.ghostBtn}
            onClick={() => setMenuOpen((p) => !p)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="More project actions"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" width="15" height="15">
              <circle cx="3" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="13" cy="8" r="1.4" />
            </svg>
          </button>
          {menuOpen && (
            <div className={styles.menu} role="menu">
              <button className={styles.menuItem} onClick={startRename}>Rename</button>
              <button className={styles.menuItem} onClick={handleExport}>Export JSON</button>
              <button
                className={styles.menuItem}
                onClick={() => { setMenuOpen(false); setShowImport(true); }}
              >
                Import Project…
              </button>
              <button className={styles.menuItem} onClick={handleArchive}>
                {project.archived ? "Unarchive" : "Archive"}
              </button>
              <div className={styles.menuDivider} />
              <button className={[styles.menuItem, styles.menuItemDanger].join(" ")} onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {showImport && (
        <ImportProjectModal orgSlug={orgSlug} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
