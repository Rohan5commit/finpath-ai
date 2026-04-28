import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Analysis, FinancialProfile } from "@/lib/types";
import { formatCurrency, formatPercent, stageLabel } from "@/lib/utils";

export function HealthHero({ analysis, profile }: { analysis: Analysis; profile: FinancialProfile }) {
  const tone = analysis.healthScore >= 78 ? "emerald" : analysis.healthScore >= 60 ? "blue" : "rose";

  return (
    <Card className="glass-card rounded-[2rem] p-8">
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge label={`${analysis.source === "nim" ? "Live AI guidance" : "Demo fallback mode"}`} variant={analysis.source === "nim" ? "emerald" : "amber"} />
            <Badge label={stageLabel(profile.stage)} variant="blue" />
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white">{profile.name}&apos;s financial health snapshot</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{analysis.summary}</p>
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">AI coach highlight</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{analysis.coachMessage}</p>
          </div>
        </div>

        <div className="grid w-full gap-4 xl:max-w-xl xl:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Financial health score</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-5xl font-semibold text-white">{analysis.healthScore}</span>
              <span className="pb-1 text-sm text-slate-300">/ 100 · {analysis.healthLabel}</span>
            </div>
            <Progress value={analysis.healthScore} tone={tone} className="mt-4" />
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Monthly room after bills</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(analysis.snapshot.disposableIncome)}</p>
            <p className="mt-2 text-sm text-slate-300">Cash left after fixed, variable, and debt payments.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Current savings rate</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatPercent(analysis.snapshot.savingsRate)}</p>
            <p className="mt-2 text-sm text-slate-300">Share of monthly income currently available for future goals.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Emergency cushion</p>
            <p className="mt-3 text-3xl font-semibold text-white">{analysis.snapshot.emergencyFundMonths.toFixed(1)} mo</p>
            <p className="mt-2 text-sm text-slate-300">Stress buffer before one surprise turns into a bigger setback.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-5">
          <p className="text-sm font-semibold text-emerald-50">What is working</p>
          <ul className="mt-3 space-y-3 text-sm leading-7 text-emerald-50/90">
            {analysis.topWins.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.75rem] border border-amber-400/20 bg-amber-500/10 p-5">
          <p className="text-sm font-semibold text-amber-50">What needs attention</p>
          <ul className="mt-3 space-y-3 text-sm leading-7 text-amber-50/90">
            {analysis.topGaps.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
