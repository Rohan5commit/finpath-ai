"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Analysis } from "@/lib/types";

export function ActionChecklist({ analysis }: { analysis: Analysis }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const completed = useMemo(
    () => analysis.actionChecklist.filter((item) => done[item.label]).length,
    [analysis.actionChecklist, done],
  );

  return (
    <Card className="glass-card rounded-[2rem] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Action checklist"
          title="The product should end with clear next moves"
          description="This is the bridge from insight to behavior change."
        />
        <Badge label={`${completed}/${analysis.actionChecklist.length} completed`} variant="emerald" />
      </div>
      <div className="mt-6 grid gap-4">
        {analysis.actionChecklist.map((item) => {
          const checked = Boolean(done[item.label]);
          return (
            <label key={item.label} className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setDone((current) => ({ ...current, [item.label]: !current[item.label] }))}
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <Badge label={item.impact} variant={item.impact === "high" ? "emerald" : item.impact === "medium" ? "amber" : "blue"} />
                </div>
                <p className="mt-2 text-sm text-slate-300">Timeframe: {item.timeframe}</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">{item.reason}</p>
              </div>
            </label>
          );
        })}
      </div>
    </Card>
  );
}
