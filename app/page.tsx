import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { JudgeDemoBanner } from "@/components/landing/judge-demo-banner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { demoProfiles } from "@/lib/demo";

const judgingPillars = [
  {
    title: "Innovation",
    detail: "Deterministic financial math + structured AI explanations = guidance that feels personal without becoming flaky.",
  },
  {
    title: "Execution",
    detail: "Type-safe App Router codebase, server-routed AI, seeded demos, CI, and deployment workflow.",
  },
  {
    title: "Relevance",
    detail: "Built around student and young-adult money stress: rent, debt, emergency buffers, and uneven income.",
  },
  {
    title: "Scalability",
    detail: "Starts as a web app, grows into a financial wellness platform for universities, fintechs, and employers.",
  },
];

export default function HomePage() {
  return (
    <div className="finpath-grid">
      <Hero demoAccounts={demoProfiles} />
      <JudgeDemoBanner demoAccounts={demoProfiles} />
      <FeatureGrid />

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-stretch">
        <Card className="glass-card flex-1 rounded-[2rem] p-8">
          <Badge label="How it works" variant="emerald" />
          <h2 className="mt-4 text-3xl font-semibold text-white">Simple inputs. Clear outputs. Real next steps.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-5">
            {[
              "Income + spending snapshot",
              "Savings goals + habits",
              "Financial health analysis",
              "AI guidance + explainers",
              "Scenario planning + progress",
            ].map((step, index) => (
              <div key={step} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-sm font-semibold text-emerald-200">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card w-full rounded-[2rem] p-8 lg:max-w-md">
          <Badge label="Safety" variant="blue" />
          <h3 className="mt-4 text-2xl font-semibold text-white">Responsible-by-default guidance</h3>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
            <li>• FinPath AI stays educational and avoids regulated financial advice.</li>
            <li>• Numerical planning stays deterministic so the dashboard remains reliable.</li>
            <li>• If AI is unavailable, the product still works with demo-safe fallback guidance.</li>
          </ul>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge label="Built for judges" variant="amber" />
            <h2 className="mt-4 text-3xl font-semibold text-white">Optimized for the Nexforge rubric</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            FinPath AI is intentionally easy to understand in under three minutes while still telling a strong product,
            technical, and scalability story.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-4">
          {judgingPillars.map((pillar) => (
            <Card key={pillar.title} className="glass-card rounded-[1.75rem] p-6">
              <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.detail}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
