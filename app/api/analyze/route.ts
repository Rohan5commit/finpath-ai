import { NextResponse } from "next/server";
import { callNimJson, mergeAnalysisPatch, nimConfigured, normalizeAiAnalysisPatch } from "@/lib/ai";
import { buildHeuristicAnalysis } from "@/lib/finance";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from "@/lib/prompts";
import { parseAnalyzeRequest } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = parseAnalyzeRequest(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { profile } = parsed.data;
    const fallback = buildHeuristicAnalysis(profile);

    if (!nimConfigured()) {
      return NextResponse.json({ analysis: fallback, usedFallback: true, reason: "demo_mode" });
    }

    try {
      const raw = await callNimJson({
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        userPrompt: buildAnalysisPrompt(profile, fallback),
        temperature: 0.2,
        maxTokens: 1100,
      });
      const patch = normalizeAiAnalysisPatch(raw, fallback);
      const analysis = mergeAnalysisPatch(fallback, patch);
      return NextResponse.json({ analysis, usedFallback: false });
    } catch {
      return NextResponse.json({
        analysis: fallback,
        usedFallback: true,
        reason: "live_ai_unavailable",
      });
    }
  } catch {
    return NextResponse.json({ error: "Unable to parse request payload." }, { status: 400 });
  }
}
