import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DemoAccount } from "@/lib/types";

export function Hero({ demoAccounts }: { demoAccounts: DemoAccount[] }) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-14 lg:flex-row lg:items-center">
      <div className="max-w-3xl flex-1">
        <Badge label="AI fintech · education · social impact" variant="emerald" />
        <h1 className="mt-6 text-5xl font-semibold leading-tight text-white md:text-6xl">
          Financial clarity for young adults who need a plan, not just a spreadsheet.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          FinPath AI turns income, expenses, habits, and savings goals into a personalized money snapshot,
          a practical savings roadmap, learning explainers, and grounded follow-up guidance.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className={buttonClasses({ variant: "primary", size: "lg" })}>
            Start with your own profile
          </Link>
          <Link href={`/dashboard?demo=${demoAccounts[0]?.id ?? "maya-campus"}`} className={buttonClasses({ variant: "secondary", size: "lg" })}>
            Launch judge demo instantly
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
          {[
            "Structured AI outputs",
            "Seeded demo accounts",
            "Scenario planning",
            "Graceful fallback mode",
          ].map((pill) => (
            <span key={pill} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {pill}
            </span>
          ))}
        </div>
      </div>

      <Card className="glass-card w-full rounded-[2rem] p-8 lg:max-w-xl">
        <div className="grid gap-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">What FinPath AI delivers</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["Health snapshot", "Understand where money stress is coming from."],
                ["Budget guidance", "See the categories that create or destroy monthly room."],
                ["Goal roadmap", "Know if each savings target is realistic on the current path."],
                ["Financial literacy", "Learn core money concepts in plain English while you plan."],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-5">
            <p className="text-sm font-semibold text-emerald-100">Judge shortcut</p>
            <p className="mt-2 text-sm leading-7 text-emerald-50/90">
              Open a seeded profile, run a “save 20% more” scenario, and ask one follow-up question. The full value
              proposition lands in under three minutes.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
