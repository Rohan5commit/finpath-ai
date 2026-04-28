import { describe, expect, it } from "vitest";
import { mergeAnalysisPatch, normalizeAiAnalysisPatch } from "@/lib/ai";
import { getDemoSeed } from "@/lib/demo";

describe("ai normalization", () => {
  const fallback = getDemoSeed("maya-campus").analysis;

  it("keeps fallback sections when the AI patch is malformed", () => {
    const patch = normalizeAiAnalysisPatch(
      {
        summary: "Better summary",
        budgetAdvice: ["Protect monthly margin"],
        learningCards: "not-an-array",
        actionChecklist: [
          {
            label: "Automate savings",
            timeframe: "This week",
            impact: "high",
            reason: "Consistency beats memory",
          },
        ],
        topWins: ["Existing savings base"],
        topGaps: ["Emergency buffer is still thin"],
      },
      fallback,
    );

    expect(patch.summary).toBe("Better summary");
    expect(patch.budgetAdvice).toEqual(["Protect monthly margin"]);
    expect(patch.learningCards).toEqual(fallback.learningCards);
    expect(patch.actionChecklist[0]?.label).toBe("Automate savings");
  });

  it("merges normalized AI guidance back into the deterministic baseline", () => {
    const patch = normalizeAiAnalysisPatch(
      {
        summary: "Fresh summary",
        coachMessage: "Fresh coach message",
        budgetAdvice: ["Keep lifestyle spending on a weekly cap"],
        savingsPlan: {
          headline: "New headline",
          milestones: ["Milestone one", "Milestone two", "Milestone three"],
          recommendedAutomation: "Auto-transfer within one day of payday",
        },
        riskAlerts: [{ title: "Thin cushion", severity: "medium", detail: "Build one month first." }],
        spendingInsights: [{ title: "Lifestyle", severity: "low", detail: "Trim one recurring cost." }],
        learningCards: [
          { title: "Emergency fund", body: "Start small.", whyItMatters: "Reduces panic decisions." },
        ],
        actionChecklist: [
          {
            label: "Automate savings",
            timeframe: "This week",
            impact: "high",
            reason: "Consistency beats memory",
          },
        ],
        topWins: ["Already saving"],
        topGaps: ["Spending visibility is low"],
      },
      fallback,
    );
    const merged = mergeAnalysisPatch(fallback, patch);

    expect(merged.source).toBe("nim");
    expect(merged.summary).toBe("Fresh summary");
    expect(merged.savingsPlan.headline).toBe("New headline");
    expect(merged.learningCards[0]?.title).toBe("Emergency fund");
  });
});
