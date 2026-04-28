"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { FinancialProfile, SavingsGoal } from "@/lib/types";

function monthOffset(offset: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function createGoal(name = "Emergency fund"): SavingsGoal {
  return {
    name,
    targetAmount: 2000,
    currentAmount: 0,
    targetDate: monthOffset(8),
  };
}

const initialProfile: FinancialProfile = {
  name: "",
  stage: "student",
  monthlyIncome: 1800,
  fixedExpenses: 700,
  variableExpenses: 450,
  debtPayments: 100,
  currentSavings: 500,
  savingsRateGoal: 20,
  goals: [createGoal()],
  habits: {
    impulseSpending: "medium",
    tracksSpending: true,
    emergencyFundMonths: 1,
    debtStress: "medium",
    confidence: 3,
    paydaySplurges: false,
  },
  concern: "I want a simple plan that helps me save without feeling deprived.",
};

const selectClassName =
  "h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-emerald-400/50 focus:outline-none";

export function OnboardingForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (profile: FinancialProfile) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<FinancialProfile>(initialProfile);
  const [error, setError] = useState<string | null>(null);

  const monthlyBalance = useMemo(
    () => draft.monthlyIncome - draft.fixedExpenses - draft.variableExpenses - draft.debtPayments,
    [draft.monthlyIncome, draft.fixedExpenses, draft.variableExpenses, draft.debtPayments],
  );

  function updateGoal(index: number, patch: Partial<SavingsGoal>) {
    setDraft((current) => ({
      ...current,
      goals: current.goals.map((goal, goalIndex) => (goalIndex === index ? { ...goal, ...patch } : goal)),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const filteredGoals = draft.goals.filter((goal) => goal.name.trim() && goal.targetAmount > 0);
    if (!draft.name.trim()) {
      setError("Add a name so the dashboard feels personal.");
      return;
    }
    if (draft.monthlyIncome <= 0) {
      setError("Monthly income needs to be above zero.");
      return;
    }
    if (filteredGoals.length === 0) {
      setError("Add at least one savings goal.");
      return;
    }

    await onSubmit({ ...draft, goals: filteredGoals });
  }

  return (
    <Card className="glass-card rounded-[2rem] p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Onboarding</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Build your financial profile</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Enter a lightweight monthly snapshot. FinPath AI uses this to create a personalized budget plan,
          savings roadmap, explainers, and scenario suggestions.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Name</span>
            <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Maya" />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Life stage</span>
            <select className={selectClassName} value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value as FinancialProfile["stage"] })}>
              <option value="student">Student</option>
              <option value="intern">Intern</option>
              <option value="early-career">Early career</option>
              <option value="career-switcher">Career switcher</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Monthly income</span>
            <Input type="number" min={0} step={50} value={draft.monthlyIncome} onChange={(event) => setDraft({ ...draft, monthlyIncome: Number(event.target.value) })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Fixed expenses</span>
            <Input type="number" min={0} step={50} value={draft.fixedExpenses} onChange={(event) => setDraft({ ...draft, fixedExpenses: Number(event.target.value) })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Variable expenses</span>
            <Input type="number" min={0} step={25} value={draft.variableExpenses} onChange={(event) => setDraft({ ...draft, variableExpenses: Number(event.target.value) })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Debt payments</span>
            <Input type="number" min={0} step={25} value={draft.debtPayments} onChange={(event) => setDraft({ ...draft, debtPayments: Number(event.target.value) })} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Current savings</span>
            <Input type="number" min={0} step={50} value={draft.currentSavings} onChange={(event) => setDraft({ ...draft, currentSavings: Number(event.target.value) })} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Desired savings rate</span>
            <Input type="number" min={0} max={60} step={1} value={draft.savingsRateGoal} onChange={(event) => setDraft({ ...draft, savingsRateGoal: Number(event.target.value) })} />
          </label>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Savings goals</h3>
              <p className="mt-1 text-sm text-slate-300">Add one or more goals so the roadmap has a real target.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDraft((current) => ({ ...current, goals: [...current.goals, createGoal(`Goal ${current.goals.length + 1}`)] }))}
            >
              Add goal
            </Button>
          </div>
          <div className="mt-5 space-y-4">
            {draft.goals.map((goal, index) => (
              <div key={`${goal.name}-${index}`} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="space-y-2 text-sm text-slate-300 xl:col-span-1">
                    <span>Goal name</span>
                    <Input value={goal.name} onChange={(event) => updateGoal(index, { name: event.target.value })} />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Target amount</span>
                    <Input type="number" min={0} step={50} value={goal.targetAmount} onChange={(event) => updateGoal(index, { targetAmount: Number(event.target.value) })} />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Saved so far</span>
                    <Input type="number" min={0} step={25} value={goal.currentAmount} onChange={(event) => updateGoal(index, { currentAmount: Number(event.target.value) })} />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Target date</span>
                    <Input type="month" value={goal.targetDate} onChange={(event) => updateGoal(index, { targetDate: event.target.value })} />
                  </label>
                </div>
                {draft.goals.length > 1 ? (
                  <button
                    type="button"
                    className="mt-4 text-sm font-medium text-rose-200 hover:text-rose-100"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        goals: current.goals.filter((_, goalIndex) => goalIndex !== index),
                      }))
                    }
                  >
                    Remove this goal
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Habits and confidence</h3>
            <div className="mt-4 space-y-5">
              <label className="space-y-2 text-sm text-slate-300">
                <span>Impulse spending</span>
                <select className={selectClassName} value={draft.habits.impulseSpending} onChange={(event) => setDraft({ ...draft, habits: { ...draft.habits, impulseSpending: event.target.value as FinancialProfile["habits"]["impulseSpending"] } })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Debt stress</span>
                <select className={selectClassName} value={draft.habits.debtStress} onChange={(event) => setDraft({ ...draft, habits: { ...draft.habits, debtStress: event.target.value as FinancialProfile["habits"]["debtStress"] } })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Current emergency cushion (months)</span>
                <Input type="number" min={0} max={12} step={0.1} value={draft.habits.emergencyFundMonths} onChange={(event) => setDraft({ ...draft, habits: { ...draft.habits, emergencyFundMonths: Number(event.target.value) } })} />
              </label>
              <Slider label="Budgeting confidence" min={1} max={5} step={1} suffix="/5" value={draft.habits.confidence} onChange={(value) => setDraft({ ...draft, habits: { ...draft.habits, confidence: value } })} />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Context that shapes the plan</h3>
            <div className="mt-4 space-y-5">
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
                <span>Do you track spending regularly?</span>
                <input type="checkbox" checked={draft.habits.tracksSpending} onChange={(event) => setDraft({ ...draft, habits: { ...draft.habits, tracksSpending: event.target.checked } })} />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
                <span>Do payday splurges usually happen?</span>
                <input type="checkbox" checked={draft.habits.paydaySplurges} onChange={(event) => setDraft({ ...draft, habits: { ...draft.habits, paydaySplurges: event.target.checked } })} />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>What is your biggest money concern right now?</span>
                <Textarea value={draft.concern} onChange={(event) => setDraft({ ...draft, concern: event.target.value })} />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm text-emerald-50">
          <p className="font-semibold">Live profile preview</p>
          <p className="mt-2 leading-7">
            Monthly balance: <span className="font-semibold">{monthlyBalance >= 0 ? `$${Math.round(monthlyBalance)}` : `-$${Math.abs(Math.round(monthlyBalance))}`}</span>. 
            FinPath AI will use this to generate a health snapshot, goal pacing, risk alerts, explainers, and an action checklist.
          </p>
        </div>

        {error ? <p className="text-sm text-rose-200">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            FinPath AI is educational, not regulated financial advice. It focuses on budgeting, savings behavior, and financial literacy.
          </p>
          <Button type="submit" variant="primary" size="lg" disabled={busy}>
            {busy ? "Building your plan..." : "Generate my FinPath plan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
