import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Analysis } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ProgressTracker({ analysis }: { analysis: Analysis }) {
  const maxValue = Math.max(...analysis.progressSeries.map((point) => Math.max(point.saved, point.target)), 1);

  return (
    <Card className="glass-card rounded-[2rem] p-6">
      <SectionHeading
        eyebrow="Progress tracker"
        title="What the next six months can look like"
        description="This view helps users visualize momentum, not just month-end totals."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-6">
        {analysis.progressSeries.map((point) => (
          <div key={point.month} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="flex h-40 items-end gap-3">
              <div className="flex-1 rounded-full bg-white/8">
                <div
                  className="w-full rounded-full bg-emerald-400/80"
                  style={{ height: `${Math.max((point.saved / maxValue) * 120, 8)}px` }}
                />
              </div>
              <div className="flex-1 rounded-full bg-white/8">
                <div
                  className="w-full rounded-full bg-sky-400/70"
                  style={{ height: `${Math.max((point.target / maxValue) * 120, 8)}px` }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-white">{point.month}</p>
            <p className="mt-2 text-xs leading-6 text-slate-300">Saved: {formatCurrency(point.saved)}</p>
            <p className="text-xs leading-6 text-slate-400">Target path: {formatCurrency(point.target)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
