"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Slider } from "@/components/ui/slider";
import type { Analysis, FinancialProfile, ScenarioOutcome } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ScenarioSimulator({
  analysis,
  profile,
}: {
  analysis: Analysis;
  profile: FinancialProfile;
}) {
  const [saveBoost, setSaveBoost] = useState(20);
  const [expenseTrim, setExpenseTrim] = useState(5);
  const [result, setResult] = useState<ScenarioOutcome>(analysis.scenarioBaseline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResult(analysis.scenarioBaseline);
    setSaveBoost(20);
    setExpenseTrim(5);
  }, [analysis.scenarioBaseline]);

  async function runScenario() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          saveBoostPercent: saveBoost,
          expenseTrimPercent: expenseTrim,
        }),
      });
      const data = (await response.json()) as { scenario?: ScenarioOutcome; error?: string };
      if (!response.ok || !data.scenario) {
        throw new Error(data.error || "Scenario request failed.");
      }
      setResult(data.scenario);
    } catch (scenarioError) {
      setError(scenarioError instanceof Error ? scenarioError.message : "Unable to run scenario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-card rounded-[2rem] p-6">
      <SectionHeading
        eyebrow="Scenario simulator"
        title="What if you save a little more?"
        description="This lets the user experiment with tradeoffs before they commit to them."
      />
      <div className="mt-6 space-y-5">
        <Slider label="Increase monthly savings effort" min={0} max={40} value={saveBoost} onChange={setSaveBoost} />
        <Slider label="Trim flexible spending" min={0} max={20} value={expenseTrim} onChange={setExpenseTrim} />
        <Button onClick={runScenario} disabled={loading} variant="primary">
          {loading ? "Running scenario..." : "Run scenario"}
        </Button>
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold text-white">{result.label}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monthly savings now</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(result.monthlySavingsBefore)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monthly savings after</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(result.monthlySavingsAfter)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Savings in 6 months</p>
            <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(result.projectedSavingsIn6Months)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{result.explanation}</p>
        <p className="mt-3 text-sm leading-7 text-sky-100/80">{result.recommendedMove}</p>
      </div>
    </Card>
  );
}
