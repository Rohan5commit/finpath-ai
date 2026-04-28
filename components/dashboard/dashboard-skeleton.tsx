import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="glass-card rounded-[2rem] p-8">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-12 w-3/4" />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[1.5rem]" />
          ))}
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="glass-card rounded-[2rem] p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-4 h-40 rounded-[1.5rem]" />
          </Card>
        ))}
      </div>
      <Card className="glass-card rounded-[2rem] p-6">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-4 h-28 rounded-[1.5rem]" />
      </Card>
    </div>
  );
}
