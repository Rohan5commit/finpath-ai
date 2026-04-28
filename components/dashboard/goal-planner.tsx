import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Analysis } from "@/lib/types";
import { formatCurrency, formatMonthLabel } from "@/lib/utils";

export function GoalPlanner({ analysis }: { analysis: Analysis }) {
  return (
    <Card className="glass-card rounded-[2rem] p-6">
      <SectionHeading
        eyebrow="Savings roadmap"
        title="Turn goals into a monthly pace"
        description="Each goal shows whether the current plan is on track and how much monthly saving it realistically needs."
      />
      <div className="mt-6 space-y-4">
        {analysis.savingsRoadmap.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          return (
            <div key={goal.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-white">{goal.name}</p>
                    <Badge label={goal.onTrack ? "On track" : "Needs more monthly room"} variant={goal.onTrack ? "emerald" : "amber"} />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    Target {formatCurrency(goal.targetAmount)} by {formatMonthLabel(goal.targetDate)}.
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-slate-400">Projected completion</p>
                  <p className="text-base font-semibold text-white">{goal.projectedCompletion}</p>
                </div>
              </div>
              <Progress value={progress} tone={goal.onTrack ? "emerald" : "amber"} className="mt-4" />
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved so far</p>
                  <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(goal.currentAmount)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current monthly pace</p>
                  <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(goal.monthlyContribution)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monthly pace required</p>
                  <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(goal.monthlyNeeded)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-[1.5rem] border border-sky-400/20 bg-sky-500/10 p-5">
        <p className="text-sm font-semibold text-sky-50">Savings plan headline</p>
        <p className="mt-2 text-sm leading-7 text-sky-50/90">{analysis.savingsPlan.headline}</p>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-sky-50/90">
          {analysis.savingsPlan.milestones.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-7 text-sky-50/90">{analysis.savingsPlan.recommendedAutomation}</p>
      </div>
    </Card>
  );
}
