import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const features = [
  {
    title: "Financial health snapshot",
    detail: "A clear score, monthly cash flow view, and plain-English summary of the user’s current financial position.",
  },
  {
    title: "AI budgeting assistant",
    detail: "Follow-up Q&A that stays practical, understandable, and grounded in the live profile context.",
  },
  {
    title: "Savings-goal planner",
    detail: "Goal-by-goal pacing, projected completion timing, and automation recommendations.",
  },
  {
    title: "Risk alerts",
    detail: "Flags negative cash flow, thin emergency cushions, high debt burden, and other core planning risks.",
  },
  {
    title: "Learning explainers",
    detail: "Financial literacy cards teach core concepts while the user is already motivated to learn them.",
  },
  {
    title: "Scenario simulator",
    detail: "Lets users test how saving more or trimming spending changes the timeline before they commit.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10">
      <SectionHeading
        eyebrow="Core feature set"
        title="A complete, demo-ready fintech learning experience"
        description="Every section is there to make the app useful immediately while also telling a clear innovation and scalability story."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="glass-card rounded-[1.75rem] p-6">
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{feature.detail}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
