"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/authStore";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined"
    ? window.location.origin.replace(/^http/, "ws")
    : "ws://localhost:8000");

const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000;

/**
 * useProjectBoard(projectId)
 *
 * Opens a WebSocket connection to ws://.../ws/projects/{projectId}/board/?token=<jwt>
 * and keeps the React Query task cache in sync with real-time events.
 *
 * Event types handled:
 *   task.created → append to the status column's task list
 *   task.updated → patch the cached task in-place
 *   task.deleted → remove from every status column
 *   task.moved   → update status_id + order
 *
 * Returns { connected, lastEvent } for UI indicators.
 *
 * Design note (JWT in query-string):
 *   Passing the access token as ?token=<jwt> means it appears in server access logs.
 *   This is the standard Django Channels pattern and acceptable for a portfolio
 *   project. A more secure alternative is a short-lived "ticket" endpoint.
 */
export function useProjectBoard(projectId) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  const handleMessage = useCallback(
    (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      const { type: eventType, task } = data;
      setLastEvent(data);

      if (!task) return;

      const projectTasksKey = ["tasks", { project: projectId }];

      switch (eventType) {
        case "task.created":
          queryClient.setQueryData(projectTasksKey, (old) => {
            if (!old) return old;
            const results = old.results ?? old;
            // Avoid duplicates (e.g. the creator's own tab already has it)
            const exists = results.some((t) => t.id === task.id);
            if (exists) return old;
            const updated = [...results, task];
            return Array.isArray(old) ? updated : { ...old, results: updated };
          });
          break;

        case "task.updated":
        case "task.moved":
          queryClient.setQueryData(projectTasksKey, (old) => {
            if (!old) return old;
            const results = old.results ?? old;
            const updated = results.map((t) =>
              t.id === task.id ? { ...t, ...task } : t
            );
            return Array.isArray(old) ? updated : { ...old, results: updated };
          });
          break;

        case "task.deleted":
          queryClient.setQueryData(projectTasksKey, (old) => {
            if (!old) return old;
            const results = old.results ?? old;
            const updated = results.filter((t) => t.id !== task.id);
            return Array.isArray(old) ? updated : { ...old, results: updated };
          });
          break;

        default:
          break;
      }
    },
    [projectId, queryClient]
  );

  const connect = useCallback(() => {
    if (!projectId || !accessToken || !mountedRef.current) return;

    const url = `${WS_BASE}/ws/projects/${projectId}/board/?token=${accessToken}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      setConnected(true);
    };

    ws.onmessage = handleMessage;

    ws.onclose = (ev) => {
      setConnected(false);
      wsRef.current = null;

      // 4001 = unauthenticated, 4003 = not a member — don't retry
      if (ev.code === 4001 || ev.code === 4003 || !mountedRef.current) return;

      // Exponential backoff reconnect
      if (retriesRef.current < MAX_RETRIES) {
        const delay = INITIAL_BACKOFF_MS * 2 ** retriesRef.current;
        retriesRef.current += 1;
        timerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [projectId, accessToken, handleMessage]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "component unmounted");
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { connected, lastEvent };
}
