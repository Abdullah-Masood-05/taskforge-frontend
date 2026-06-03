"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import styles from "./NotificationBell.module.css";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  // Poll unread count every 30 seconds
  const { data } = useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const count = data?.count ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        id="notification-bell-btn"
        className={styles.bellBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${count > 0 ? ` — ${count} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg
          className={styles.bellIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          onMarkAll={() => markAll.mutate()}
        />
      )}
    </div>
  );
}

function NotificationDropdown({ onClose, onMarkAll }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationsApi.list({ page_size: 20 }),
    staleTime: 10_000,
  });

  const markOne = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.results ?? [];

  return (
    <div
      className={styles.dropdown}
      role="dialog"
      aria-label="Notifications"
      aria-modal="false"
    >
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownTitle}>Notifications</span>
        <button
          className={styles.markAllBtn}
          onClick={onMarkAll}
          disabled={notifications.every((n) => n.is_read)}
        >
          Mark all read
        </button>
      </div>

      <div className={styles.list}>
        {isLoading && <p className={styles.empty}>Loading…</p>}
        {!isLoading && notifications.length === 0 && (
          <p className={styles.empty}>You're all caught up 🎉</p>
        )}
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onRead={() => markOne.mutate(n.id)}
          />
        ))}
      </div>
    </div>
  );
}

function NotificationItem({ notification: n, onRead }) {
  const verb = n.verb.replace(/_/g, " ");
  const time = formatRelative(n.created_at);

  return (
    <button
      className={[styles.item, n.is_read ? styles.itemRead : ""].join(" ")}
      onClick={onRead}
      title={n.description}
    >
      <div className={styles.itemDot} data-read={n.is_read} />
      <div className={styles.itemBody}>
        <span className={styles.itemDesc}>{n.description}</span>
        <span className={styles.itemMeta}>
          {n.actor?.full_name && (
            <span className={styles.itemActor}>{n.actor.full_name}</span>
          )}
          <span className={styles.itemTime}>{time}</span>
        </span>
      </div>
    </button>
  );
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
