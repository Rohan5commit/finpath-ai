import { describe, expect, it } from "vitest";
import { getDemoSeed } from "@/lib/demo";
import { parseAnalyzeRequest, parseChatRequest, parseScenarioRequest } from "@/lib/validation";

describe("request validation", () => {
  const maya = getDemoSeed("maya-campus");

  it("accepts a valid analysis request", () => {
    const parsed = parseAnalyzeRequest({ profile: maya.profile });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid financial profile values", () => {
    const parsed = parseAnalyzeRequest({
      profile: {
        ...maya.profile,
        monthlyIncome: -10,
      },
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      throw new Error("Expected validation failure.");
    }
    expect(parsed.error).toContain("monthlyIncome");
  });

  it("accepts a valid chat payload", () => {
    const parsed = parseChatRequest({
      profile: maya.profile,
      analysis: maya.analysis,
      question: "What should I cut first?",
      history: [{ role: "assistant", content: "You can start with a small recurring cut." }],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an oversized question", () => {
    const parsed = parseChatRequest({
      profile: maya.profile,
      analysis: maya.analysis,
      question: "x".repeat(400),
      history: [],
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      throw new Error("Expected validation failure.");
    }
    expect(parsed.error).toContain("question");
  });

  it("rejects impossible scenario percentages", () => {
    const parsed = parseScenarioRequest({
      profile: maya.profile,
      saveBoostPercent: 140,
      expenseTrimPercent: 5,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      throw new Error("Expected validation failure.");
    }
    expect(parsed.error).toContain("saveBoostPercent");
  });
});
