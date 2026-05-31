"use client";

/**
 * Project list page for an organization.
 * Route: /orgs/[slug]/projects
 */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects, useCreateProject, useArchiveProject, useDeleteProject } from "@/lib/hooks/useTasks";
import styles from "./page.module.css";

function ProjectCard({ project, orgSlug, onArchive, onDelete }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={[styles.card, project.archived ? styles.cardArchived : ""].join(" ")}>
      <div className={styles.cardTop}>
        <div
          className={styles.cardIcon}
          style={{ background: `hsl(${(project.name.charCodeAt(0) * 37) % 360}, 55%, 25%)` }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.cardMeta}>
          {project.archived && <span className={styles.archivedBadge}>Archived</span>}
          <div className={styles.cardMenuWrap}>
            <button
              className={styles.menuBtn}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
              aria-label="Project options"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className={styles.menu} onMouseLeave={() => setMenuOpen(false)}>
                <button onClick={() => { setMenuOpen(false); onArchive(project.id); }}>
                  {project.archived ? "Unarchive" : "Archive"}
                </button>
                <button
                  className={styles.menuDanger}
                  onClick={() => { setMenuOpen(false); onDelete(project.id); }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href={`/orgs/${orgSlug}/projects/${project.id}/board`} className={styles.cardLink}>
        <h3 className={styles.cardName}>{project.name}</h3>
        {project.description && (
          <p className={styles.cardDesc}>{project.description}</p>
        )}
      </Link>

      <div className={styles.cardFooter}>
        <span className={styles.stat}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
            <rect x="1" y="1" width="14" height="14" rx="2" />
            <path d="M5 8h6M5 5h6M5 11h3" />
          </svg>
          {project.task_count ?? 0} tasks
        </span>
        <span className={styles.statDate}>
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function CreateProjectModal({ orgSlug, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ name: name.trim(), description: description.trim() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>New project</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome project"
              autoFocus
              required
            />
          </label>
          <label className={styles.label}>
            Description (optional)
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={3}
            />
          </label>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting || !name.trim()}>
              {submitting ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { slug } = useParams();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("active"); // active | archived | all

  const { data: projects = [], isLoading } = useProjects(slug);
  const createProject = useCreateProject(slug);
  const archiveProject = useArchiveProject(slug);
  const deleteProject = useDeleteProject(slug);

  const filtered = projects.filter((p) => {
    if (filter === "active") return !p.archived;
    if (filter === "archived") return p.archived;
    return true;
  });

  const handleArchive = (id) => archiveProject.mutate(id);
  const handleDelete = (id) => {
    if (confirm("Delete this project? This cannot be undone.")) {
      deleteProject.mutate(id);
    }
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Projects</h1>
          <p className={styles.pageSubtitle}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} in this organization
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowCreate(true)} id="create-project-btn">
          + New project
        </button>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {["active", "archived", "all"].map((f) => (
          <button
            key={f}
            className={[styles.filterTab, filter === f ? styles.filterTabActive : ""].join(" ")}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className={styles.skeletonGrid}>
          {[1, 2, 3].map((n) => <div key={n} className={styles.skeleton} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 64 64" fill="none" className={styles.emptyIcon}>
            <rect x="8" y="8" width="48" height="48" rx="8" stroke="currentColor" strokeWidth="2" />
            <path d="M20 32h24M20 24h16M20 40h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p className={styles.emptyTitle}>
            {filter === "archived" ? "No archived projects" : "No projects yet"}
          </p>
          {filter === "active" && (
            <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              orgSlug={slug}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
          <button className={styles.newCard} onClick={() => setShowCreate(true)}>
            <span className={styles.newCardPlus}>+</span>
            <span>New project</span>
          </button>
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          orgSlug={slug}
          onClose={() => setShowCreate(false)}
          onCreate={(data) => createProject.mutateAsync(data)}
        />
      )}
    </div>
  );
}
