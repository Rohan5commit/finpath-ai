import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <DashboardSkeleton />
    </div>
  );
}
