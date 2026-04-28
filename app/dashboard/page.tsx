import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <DashboardSkeleton />
        </div>
      }
    >
      <DashboardShell />
    </Suspense>
  );
}
