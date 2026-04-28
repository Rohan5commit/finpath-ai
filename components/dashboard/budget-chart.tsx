import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Analysis } from "@/lib/types";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

const toneClasses = {
  blue: "bg-sky-400/80",
  amber: "bg-amber-400/80",
  emerald: "bg-emerald-400/80",
  rose: "bg-rose-400/80",
} as const;

export function BudgetChart({ analysis }: { analysis: Analysis }) {
  return (
    <Card className="glass-card rounded-[2rem] p-6">
      <SectionHeading
        eyebrow="Budget breakdown"
        title="See where the monthly money room goes"
        description="The dashboard shows both the current spending mix and the areas most likely to change goal speed."
      />
      <div className="mt-6 space-y-5">
        {analysis.budgetBreakdown.map((bucket) => (
          <div key={bucket.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{bucket.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{bucket.description}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-lg font-semibold text-white">{formatCurrency(bucket.amount)}</p>
                <p className="text-sm text-slate-400">
                  {formatPercent(bucket.percent)} · target {bucket.target}
                </p>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
              <div className={cn("h-full rounded-full", toneClasses[bucket.tone])} style={{ width: `${Math.min(bucket.percent, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-5">
        <p className="text-sm font-semibold text-emerald-50">FinPath budget guidance</p>
        <ul className="mt-3 space-y-3 text-sm leading-7 text-emerald-50/90">
          {analysis.budgetAdvice.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
