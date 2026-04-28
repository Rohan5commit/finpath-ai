"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ActionChecklist } from "@/components/dashboard/action-checklist";
import { BudgetChart } from "@/components/dashboard/budget-chart";
import { ChatAssistant } from "@/components/dashboard/chat-assistant";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { ExplainerCards } from "@/components/dashboard/explainer-cards";
import { GoalPlanner } from "@/components/dashboard/goal-planner";
import { HealthHero } from "@/components/dashboard/health-hero";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { ScenarioSimulator } from "@/components/dashboard/scenario-simulator";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { demoProfiles, getDemoSeed } from "@/lib/demo";
import { buildHeuristicAnalysis } from "@/lib/finance";
import type { Analysis, FinancialProfile } from "@/lib/types";

const STORAGE_KEY = "finpath-ai-session";
const ANALYSIS_REFRESH_ERROR =
  "Live AI refresh is unavailable right now. FinPath is showing the local plan instead.";

type StoredSession = {
  profile?: FinancialProfile;
  analysis?: Analysis;
  activeDemoId?: string | null;
};

export function DashboardShell() {
  const searchParams = useSearchParams();
  const initRef = useRef(false);
  const lastProfileRef = useRef<FinancialProfile | null>(null);
  const lastDemoIdRef = useRef<string | null>(null);
  const requestRef = useRef(0);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const demoId = searchParams.get("demo");
    if (demoId) {
      const demo = getDemoSeed(demoId);
      primeSession(demo.profile, demo.analysis, demo.id);
      void refreshAnalysis(demo.profile, demo.id, demo.analysis);
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredSession;
      if (!parsed.profile || !parsed.analysis) return;
      lastProfileRef.current = parsed.profile;
      lastDemoIdRef.current = parsed.activeDemoId ?? null;
      setProfile(parsed.profile);
      setAnalysis(parsed.analysis);
      setActiveDemoId(parsed.activeDemoId ?? null);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [searchParams]);

  function persistSession(nextProfile: FinancialProfile, nextAnalysis: Analysis, demoId: string | null) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ profile: nextProfile, analysis: nextAnalysis, activeDemoId: demoId }),
    );
  }

  function primeSession(nextProfile: FinancialProfile, nextAnalysis: Analysis, demoId: string | null) {
    lastProfileRef.current = nextProfile;
    lastDemoIdRef.current = demoId;
    setProfile(nextProfile);
    setAnalysis(nextAnalysis);
    setActiveDemoId(demoId);
    setError(null);
    persistSession(nextProfile, nextAnalysis, demoId);
  }

  async function refreshAnalysis(
    nextProfile: FinancialProfile,
    demoId: string | null,
    fallbackAnalysis: Analysis,
  ) {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile: nextProfile }),
      });

      const data = (await response.json()) as {
        analysis?: Analysis;
        error?: string;
        usedFallback?: boolean;
        reason?: string;
      };

      if (!response.ok || !data.analysis) {
        throw new Error(data.error || "Analysis request failed.");
      }

      if (requestId !== requestRef.current) {
        return;
      }

      setAnalysis(data.analysis);
      setActiveDemoId(demoId);
      persistSession(nextProfile, data.analysis, demoId);
      if (data.usedFallback && data.reason && data.reason !== "demo_mode") {
        setError(ANALYSIS_REFRESH_ERROR);
      }
    } catch {
      if (requestId !== requestRef.current) {
        return;
      }

      setAnalysis((current) => current ?? fallbackAnalysis);
      persistSession(nextProfile, fallbackAnalysis, demoId);
      setError(ANALYSIS_REFRESH_ERROR);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }

  function startAnalysis(nextProfile: FinancialProfile, demoId: string | null) {
    const fallbackAnalysis = demoId ? getDemoSeed(demoId).analysis : buildHeuristicAnalysis(nextProfile);
    primeSession(nextProfile, fallbackAnalysis, demoId);
    void refreshAnalysis(nextProfile, demoId, fallbackAnalysis);
  }

  function retryRefresh() {
    if (!lastProfileRef.current) return;
    const fallbackAnalysis = analysis ?? buildHeuristicAnalysis(lastProfileRef.current);
    void refreshAnalysis(lastProfileRef.current, lastDemoIdRef.current, fallbackAnalysis);
  }

  function resetSession() {
    requestRef.current += 1;
    lastProfileRef.current = null;
    lastDemoIdRef.current = null;
    setProfile(null);
    setAnalysis(null);
    setError(null);
    setActiveDemoId(null);
    setLoading(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  if (loading && !analysis) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      {error ? (
        <Card className="mb-6 rounded-[1.5rem] border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-50">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>{error}</p>
            <Button variant="secondary" size="sm" onClick={retryRefresh} disabled={loading || !lastProfileRef.current}>
              {loading ? "Refreshing..." : "Retry AI refresh"}
            </Button>
          </div>
        </Card>
      ) : null}

      {profile && analysis ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {activeDemoId ? (
                <Badge label={`Judge demo: ${activeDemoId}`} variant="amber" />
              ) : (
                <Badge label="Custom profile" variant="blue" />
              )}
              <Badge
                label={analysis.source === "nim" ? "NVIDIA NIM live" : "Fallback mode"}
                variant={analysis.source === "nim" ? "emerald" : "amber"}
              />
              {loading ? <Badge label="Refreshing AI guidance" variant="blue" /> : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                Back to landing page
              </Link>
              <Button variant="ghost" size="sm" onClick={resetSession}>
                Reset profile
              </Button>
            </div>
          </div>

          {loading ? (
            <Card className="rounded-[1.5rem] border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-50">
              Refreshing this dashboard with live NVIDIA NIM guidance in the background.
            </Card>
          ) : null}

          <HealthHero analysis={analysis} profile={profile} />

          <div className="grid gap-6 xl:grid-cols-2">
            <BudgetChart analysis={analysis} />
            <GoalPlanner analysis={analysis} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SpendingInsights analysis={analysis} />
            <ScenarioSimulator analysis={analysis} profile={profile} />
          </div>

          <ChatAssistant analysis={analysis} profile={profile} />

          <div className="grid gap-6 xl:grid-cols-2">
            <ProgressTracker analysis={analysis} />
            <ExplainerCards analysis={analysis} />
          </div>

          <ActionChecklist analysis={analysis} />

          <Card className="glass-card rounded-[1.5rem] p-5 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-white">Educational disclaimer</p>
            <p className="mt-2">{analysis.disclaimer}</p>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <OnboardingForm busy={loading} onSubmit={(nextProfile) => startAnalysis(nextProfile, null)} />

          <div className="space-y-6">
            <Card className="glass-card rounded-[2rem] p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Judge quick start</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Seeded profiles for instant testing</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                These demo accounts open instantly with a deterministic baseline, then refresh with live AI guidance in the background.
              </p>
              <div className="mt-5 space-y-4">
                {demoProfiles.map((account) => (
                  <div key={account.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">{account.label}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{account.blurb}</p>
                    <Button className="mt-4 w-full" variant="secondary" onClick={() => startAnalysis(account.profile, account.id)}>
                      Open {account.profile.name}&apos;s dashboard
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <EmptyState
              title="Why judges understand this quickly"
              description="FinPath shows a complete user story in one screen: score, budget, roadmap, explainers, scenarios, and follow-up AI guidance."
            />
          </div>
        </div>
      )}
    </div>
  );
}
