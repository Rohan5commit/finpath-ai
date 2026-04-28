import type { Analysis, ChatMessage, FinancialProfile } from "@/lib/types";

    export const ANALYSIS_SYSTEM_PROMPT = `You are FinPath AI, a financial planning and financial literacy assistant for students and young adults.
    Rules:
    - Output valid JSON only.
    - Be practical, kind, and simple.
    - Stay educational and non-regulated.
    - Do not give investment recommendations, tax advice, legal advice, or guaranteed outcomes.
    - Use plain English with short sentences.
    - Ground all guidance in the provided profile and deterministic metrics.`;

    export const ANALYSIS_SCHEMA_PROMPT = `Return this JSON shape exactly:
    {
      "summary": "string",
      "coachMessage": "string",
      "budgetAdvice": ["string", "string", "string"],
      "savingsPlan": {
        "headline": "string",
        "milestones": ["string", "string", "string"],
        "recommendedAutomation": "string"
      },
      "riskAlerts": [
        { "title": "string", "severity": "low|medium|high", "detail": "string" }
      ],
      "spendingInsights": [
        { "title": "string", "detail": "string", "severity": "low|medium|high" }
      ],
      "learningCards": [
        { "title": "string", "body": "string", "whyItMatters": "string" }
      ],
      "actionChecklist": [
        { "label": "string", "timeframe": "string", "impact": "low|medium|high", "reason": "string" }
      ],
      "topWins": ["string", "string", "string"],
      "topGaps": ["string", "string", "string"]
    }`;

    export function buildAnalysisPrompt(profile: FinancialProfile, fallback: Analysis) {
      return `Profile:
${JSON.stringify(profile, null, 2)}

Deterministic baseline (keep financial math aligned to this context):
${JSON.stringify(
        {
          healthScore: fallback.healthScore,
          healthLabel: fallback.healthLabel,
          snapshot: fallback.snapshot,
          budgetBreakdown: fallback.budgetBreakdown,
          savingsRoadmap: fallback.savingsRoadmap,
          riskAlerts: fallback.riskAlerts,
          spendingInsights: fallback.spendingInsights,
        },
        null,
        2,
      )}

${ANALYSIS_SCHEMA_PROMPT}

Keep each array to 2-4 useful items. Use no jargon. Mention tradeoffs clearly. Do not contradict the math.`;
    }

    export const CHAT_SYSTEM_PROMPT = `You are FinPath AI, an educational financial planning coach for students and young adults.
    Rules:
    - Answer in under 140 words.
    - Stay grounded in the supplied profile and dashboard context.
    - Keep language non-jargony and practical.
    - Do not provide regulated financial advice or guarantees.
    - End with a brief educational disclaimer sentence.`;

    export function buildChatMessages(
      profile: FinancialProfile,
      analysis: Analysis,
      history: ChatMessage[],
      question: string,
    ) {
      const context = `Profile: ${JSON.stringify(profile)}
Analysis summary: ${analysis.summary}
Budget advice: ${analysis.budgetAdvice.join(" | ")}
Savings plan: ${analysis.savingsPlan.headline}
Risk alerts: ${analysis.riskAlerts.map((alert) => `${alert.title}: ${alert.detail}`).join(" | ")}`;

      return [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        { role: "user", content: `${context}

Conversation so far: ${JSON.stringify(history)}

User question: ${question}` },
      ];
    }
