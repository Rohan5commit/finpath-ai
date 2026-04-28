import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Analysis } from "@/lib/types";

export function ExplainerCards({ analysis }: { analysis: Analysis }) {
  return (
    <Card className="glass-card rounded-[2rem] p-6">
      <SectionHeading
        eyebrow="Financial literacy"
        title="Teach the concept while the motivation is already there"
        description="FinPath AI explains the money principles behind each recommendation so users learn while planning."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {analysis.learningCards.map((card) => (
          <div key={card.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-lg font-semibold text-white">{card.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
            <p className="mt-4 text-sm leading-7 text-sky-100/80">Why it matters: {card.whyItMatters}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
