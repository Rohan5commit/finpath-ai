import type {
  AIAnalysisPatch,
  ActionItem,
  Analysis,
  ExplainerCard,
  Insight,
  RiskAlert,
  Severity,
  ImpactLevel,
} from "@/lib/types";

interface JsonCallArgs {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface TextCallArgs {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

function getBaseUrl() {
  return (process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
}

function getModel() {
  return process.env.NVIDIA_NIM_MODEL || "openai/gpt-oss-120b";
}

export function nimConfigured() {
  return Boolean(process.env.NVIDIA_NIM_API_KEY);
}

function stripCodeFences(content: string) {
  return content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

function extractJson(content: string) {
  const cleaned = stripCodeFences(content);
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  const candidate = first >= 0 && last >= 0 ? cleaned.slice(first, last + 1) : cleaned;
  return JSON.parse(candidate);
}

async function requestNim(body: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${getBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NIM request failed (${response.status}): ${text}`);
    }

    return (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function callNimJson({
  systemPrompt,
  userPrompt,
  temperature = 0.2,
  maxTokens = 1400,
}: JsonCallArgs) {
  const payload = {
    model: getModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
    response_format: {
      type: "json_object",
    },
  };

  const json = await requestNim(payload);
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("NIM returned no message content");
  }
  return extractJson(content);
}

export async function callNimText({
  messages,
  temperature = 0.2,
  maxTokens = 220,
}: TextCallArgs) {
  const json = await requestNim({
    model: getModel(),
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("NIM returned no assistant text");
  }
  return content;
}

function toSeverity(value: unknown): Severity {
  return value === "high" || value === "medium" ? value : "low";
}

function toImpact(value: unknown): ImpactLevel {
  return value === "high" || value === "medium" ? value : "low";
}

function stringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized.slice(0, 4) : fallback;
}

function normalizeRiskAlerts(value: unknown, fallback: RiskAlert[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const risk = item as Record<string, unknown>;
      if (typeof risk.title !== "string" || typeof risk.detail !== "string") return null;
      return {
        title: risk.title.trim(),
        detail: risk.detail.trim(),
        severity: toSeverity(risk.severity),
      } satisfies RiskAlert;
    })
    .filter(Boolean) as RiskAlert[];
  return normalized.length > 0 ? normalized.slice(0, 4) : fallback;
}

function normalizeInsights(value: unknown, fallback: Insight[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const insight = item as Record<string, unknown>;
      if (typeof insight.title !== "string" || typeof insight.detail !== "string") return null;
      return {
        title: insight.title.trim(),
        detail: insight.detail.trim(),
        severity: toSeverity(insight.severity),
      } satisfies Insight;
    })
    .filter(Boolean) as Insight[];
  return normalized.length > 0 ? normalized.slice(0, 4) : fallback;
}

function normalizeLearningCards(value: unknown, fallback: ExplainerCard[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const card = item as Record<string, unknown>;
      if (typeof card.title !== "string" || typeof card.body !== "string" || typeof card.whyItMatters !== "string") return null;
      return {
        title: card.title.trim(),
        body: card.body.trim(),
        whyItMatters: card.whyItMatters.trim(),
      } satisfies ExplainerCard;
    })
    .filter(Boolean) as ExplainerCard[];
  return normalized.length > 0 ? normalized.slice(0, 4) : fallback;
}

function normalizeActionChecklist(value: unknown, fallback: ActionItem[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const action = item as Record<string, unknown>;
      if (
        typeof action.label !== "string" ||
        typeof action.timeframe !== "string" ||
        typeof action.reason !== "string"
      ) {
        return null;
      }
      return {
        label: action.label.trim(),
        timeframe: action.timeframe.trim(),
        reason: action.reason.trim(),
        impact: toImpact(action.impact),
      } satisfies ActionItem;
    })
    .filter(Boolean) as ActionItem[];
  return normalized.length > 0 ? normalized.slice(0, 5) : fallback;
}

export function normalizeAiAnalysisPatch(raw: unknown, fallback: Analysis): AIAnalysisPatch {
  const candidate = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const savingsPlanCandidate =
    candidate.savingsPlan && typeof candidate.savingsPlan === "object"
      ? (candidate.savingsPlan as Record<string, unknown>)
      : {};

  return {
    summary: typeof candidate.summary === "string" && candidate.summary.trim() ? candidate.summary.trim() : fallback.summary,
    coachMessage:
      typeof candidate.coachMessage === "string" && candidate.coachMessage.trim()
        ? candidate.coachMessage.trim()
        : fallback.coachMessage,
    budgetAdvice: stringArray(candidate.budgetAdvice, fallback.budgetAdvice),
    savingsPlan: {
      headline:
        typeof savingsPlanCandidate.headline === "string" && savingsPlanCandidate.headline.trim()
          ? savingsPlanCandidate.headline.trim()
          : fallback.savingsPlan.headline,
      milestones: stringArray(savingsPlanCandidate.milestones, fallback.savingsPlan.milestones),
      recommendedAutomation:
        typeof savingsPlanCandidate.recommendedAutomation === "string" && savingsPlanCandidate.recommendedAutomation.trim()
          ? savingsPlanCandidate.recommendedAutomation.trim()
          : fallback.savingsPlan.recommendedAutomation,
    },
    riskAlerts: normalizeRiskAlerts(candidate.riskAlerts, fallback.riskAlerts),
    spendingInsights: normalizeInsights(candidate.spendingInsights, fallback.spendingInsights),
    learningCards: normalizeLearningCards(candidate.learningCards, fallback.learningCards),
    actionChecklist: normalizeActionChecklist(candidate.actionChecklist, fallback.actionChecklist),
    topWins: stringArray(candidate.topWins, fallback.topWins),
    topGaps: stringArray(candidate.topGaps, fallback.topGaps),
  };
}

export function mergeAnalysisPatch(fallback: Analysis, patch: AIAnalysisPatch): Analysis {
  return {
    ...fallback,
    source: "nim",
    generatedAt: new Date().toISOString(),
    summary: patch.summary,
    coachMessage: patch.coachMessage,
    budgetAdvice: patch.budgetAdvice,
    savingsPlan: patch.savingsPlan,
    riskAlerts: patch.riskAlerts,
    spendingInsights: patch.spendingInsights,
    learningCards: patch.learningCards,
    actionChecklist: patch.actionChecklist,
    topWins: patch.topWins,
    topGaps: patch.topGaps,
  };
}
