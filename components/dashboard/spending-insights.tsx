import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Analysis } from "@/lib/types";
import { severityClasses } from "@/lib/utils";

export function SpendingInsights({ analysis }: { analysis: Analysis }) {
  return (
    <Card className="glass-card rounded-[2rem] p-6">
      <SectionHeading
        eyebrow="Insights and risk alerts"
        title="Know what needs a quick fix versus what just needs consistency"
        description="FinPath AI separates urgent signals from steady habit improvements so users do not feel overwhelmed."
      />
      <div className="mt-6 grid gap-4">
        {analysis.riskAlerts.map((alert) => (
          <div key={alert.title} className={`rounded-[1.5rem] border p-4 ${severityClasses(alert.severity)}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{alert.title}</p>
              <Badge label={alert.severity} variant={alert.severity === "high" ? "rose" : alert.severity === "medium" ? "amber" : "emerald"} />
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-100/90">{alert.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {analysis.spendingInsights.map((insight) => (
          <div key={insight.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">{insight.title}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{insight.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
