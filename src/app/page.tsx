import { redirect } from "next/navigation";

/**
 * Root page — immediately redirects based on auth state.
 * The actual auth check lives in middleware.ts; this is just a convenience redirect.
 */
export default function RootPage() {
  redirect("/dashboard");
}
