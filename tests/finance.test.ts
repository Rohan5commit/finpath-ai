import { describe, expect, it } from "vitest";
import { getDemoSeed } from "@/lib/demo";
import { buildFallbackChatReply, buildScenarioOutcome, CHAT_DISCLAIMER } from "@/lib/finance";

describe("finance engine", () => {
  const maya = getDemoSeed("maya-campus");

  it("builds a stable seeded analysis for judge demos", () => {
    expect(maya.analysis.healthScore).toBeGreaterThanOrEqual(18);
    expect(maya.analysis.healthScore).toBeLessThanOrEqual(95);
    expect(maya.analysis.budgetBreakdown).toHaveLength(4);
    expect(maya.analysis.savingsRoadmap.length).toBeGreaterThan(0);
    expect(maya.analysis.disclaimer).toContain("educational guidance");
  });

  it("improves projected savings when the scenario gets more aggressive", () => {
    const scenario = buildScenarioOutcome(maya.profile, 20, 5);
    expect(scenario.monthlySavingsAfter).toBeGreaterThan(scenario.monthlySavingsBefore);
    expect(scenario.projectedSavingsIn6Months).toBeGreaterThan(maya.analysis.snapshot.currentSavings);
  });

  it("keeps fallback chat replies short and safely disclaimed", () => {
    const reply = buildFallbackChatReply(
      maya.profile,
      maya.analysis,
      "What should I cut first if I still want to go out with friends?",
    );
    expect(reply.endsWith(CHAT_DISCLAIMER)).toBe(true);
    expect(reply.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(90);
  });
});
