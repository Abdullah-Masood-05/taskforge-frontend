import { create } from "zustand";

/**
 * Toast store.
 *
 * Lives in Zustand (not React context) so that non-React code — notably the
 * React Query QueryCache/MutationCache error handlers in QueryProvider — can
 * push toasts via `useToastStore.getState().addToast(...)`.
 *
 * A toast: { id, variant: "error"|"success"|"info", title, description, duration }
 */
let _id = 0;
const nextId = () => `t${++_id}`;

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ variant = "info", title, description, duration = 5000 } = {}) => {
    const id = nextId();
    set((s) => ({ toasts: [...s.toasts, { id, variant, title, description, duration }] }));
    if (duration > 0) {
      // Auto-dismiss. setTimeout in module scope is fine — this only runs client-side.
      setTimeout(() => get().removeToast(id), duration);
    }
    return id;
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}));

/**
 * Convenience helpers usable from anywhere (React or not).
 *   toast.error("Title", "optional detail")
 */
export const toast = {
  error: (title, description, opts) =>
    useToastStore.getState().addToast({ variant: "error", title, description, ...opts }),
  success: (title, description, opts) =>
    useToastStore.getState().addToast({ variant: "success", title, description, ...opts }),
  info: (title, description, opts) =>
    useToastStore.getState().addToast({ variant: "info", title, description, ...opts }),
};
