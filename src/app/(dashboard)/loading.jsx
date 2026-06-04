import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Route-level loading fallback for dashboard segments. Shown during navigation
 * while the target page's code/data resolves. Pages also keep their own
 * in-component skeletons for client-side React Query fetches.
 */
export default function DashboardLoading() {
  return (
    <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "24px" }}>
      <Skeleton height={120} radius="lg" style={{ marginBottom: 32 }} />
      <Skeleton height={12} width={160} style={{ marginBottom: 16 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} height={172} radius="lg" />
        ))}
      </div>
    </div>
  );
}
