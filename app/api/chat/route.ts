import { NextResponse } from "next/server";
import { callNimText, nimConfigured } from "@/lib/ai";
import { buildFallbackChatReply } from "@/lib/finance";
import { buildChatMessages, CHAT_DISCLAIMER, MAX_CHAT_WORDS } from "@/lib/prompts";
import { parseChatRequest } from "@/lib/validation";

export const runtime = "nodejs";

const FALLBACK_REASON = "live_ai_unavailable";
const INVALID_OUTPUT_REASON = "invalid_model_output";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function countWords(value: string) {
  const normalized = collapseWhitespace(value);
  return normalized ? normalized.split(" ").length : 0;
}

function looksLikeList(value: string) {
  return /(^|\n)\s*[-*•]\s/.test(value) || /(^|\n)\s*\d+\.\s/.test(value);
}

function ensureDisclaimer(value: string) {
  const singleParagraph = value.replace(/\s*\n+\s*/g, " ");
  const normalized = collapseWhitespace(singleParagraph);
  const withoutExisting = normalized.replace(
    new RegExp(`${escapeRegExp(CHAT_DISCLAIMER)}[.!?]*$`),
    "",
  ).trim();
  const trimmed = withoutExisting.replace(/[\s,;:!?\.]+$/, "");
  return `${trimmed}. ${CHAT_DISCLAIMER}`;
}

function isValidAnswer(value: string) {
  const normalized = collapseWhitespace(value);
  return Boolean(normalized) && normalized.endsWith(CHAT_DISCLAIMER) && countWords(normalized) <= MAX_CHAT_WORDS;
}

async function generateAnswer(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const answer = await callNimText({
        messages,
        temperature: attempt === 0 ? 0.2 : 0,
        maxTokens: 180,
      });

      if (looksLikeList(answer)) {
        lastError = new Error(INVALID_OUTPUT_REASON);
        continue;
      }

      const normalized = ensureDisclaimer(answer);
      if (isValidAnswer(normalized)) {
        return normalized;
      }

      lastError = new Error(INVALID_OUTPUT_REASON);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(FALLBACK_REASON);
    }
  }

  throw lastError ?? new Error(INVALID_OUTPUT_REASON);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = parseChatRequest(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { profile, analysis, question, history } = parsed.data;
    const fallbackAnswer = buildFallbackChatReply(profile, analysis, question);

    if (!nimConfigured()) {
      return NextResponse.json({ answer: fallbackAnswer, usedFallback: true, reason: "demo_mode" });
    }

    try {
      const answer = await generateAnswer(buildChatMessages(profile, analysis, history, question));
      return NextResponse.json({ answer, usedFallback: false });
    } catch (error) {
      const reason = error instanceof Error && error.message === INVALID_OUTPUT_REASON ? INVALID_OUTPUT_REASON : FALLBACK_REASON;
      return NextResponse.json({
        answer: fallbackAnswer,
        usedFallback: true,
        reason,
      });
    }
  } catch {
    return NextResponse.json({ error: "Unable to parse chat request." }, { status: 400 });
  }
}
