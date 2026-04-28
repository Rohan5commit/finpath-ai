import { NextResponse } from "next/server";
import { buildFallbackChatReply } from "@/lib/finance";
import { buildChatMessages } from "@/lib/prompts";
import { callNimText, nimConfigured } from "@/lib/ai";
import type { Analysis, ChatMessage, FinancialProfile } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile?: FinancialProfile;
      analysis?: Analysis;
      question?: string;
      history?: ChatMessage[];
    };

    if (!body.profile || !body.analysis || !body.question?.trim()) {
      return NextResponse.json({ error: "Missing profile, analysis, or question." }, { status: 400 });
    }

    const fallbackAnswer = buildFallbackChatReply(body.profile, body.analysis, body.question);

    if (!nimConfigured()) {
      return NextResponse.json({ answer: fallbackAnswer, usedFallback: true });
    }

    try {
      const answer = await callNimText({
        messages: buildChatMessages(body.profile, body.analysis, body.history ?? [], body.question),
        temperature: 0.2,
        maxTokens: 320,
      });
      const normalizedAnswer = answer.trim();
      if (!/[.!?]$/.test(normalizedAnswer)) {
        return NextResponse.json({ answer: fallbackAnswer, usedFallback: true, reason: "incomplete_model_output" });
      }
      return NextResponse.json({ answer: normalizedAnswer, usedFallback: false });
    } catch (error) {
      return NextResponse.json({
        answer: fallbackAnswer,
        usedFallback: true,
        reason: error instanceof Error ? error.message : "nim_request_failed",
      });
    }
  } catch {
    return NextResponse.json({ error: "Unable to parse chat request." }, { status: 400 });
  }
}
