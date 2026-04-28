import { NextResponse } from "next/server";
import { buildHeuristicAnalysis } from "@/lib/finance";
import { buildAnalysisPrompt, ANALYSIS_SYSTEM_PROMPT } from "@/lib/prompts";
import { callNimJson, mergeAnalysisPatch, nimConfigured, normalizeAiAnalysisPatch } from "@/lib/ai";
import type { FinancialProfile } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { profile?: FinancialProfile };
    if (!body.profile) {
      return NextResponse.json({ error: "Missing financial profile." }, { status: 400 });
    }

    const fallback = buildHeuristicAnalysis(body.profile);

    if (!nimConfigured()) {
      return NextResponse.json({ analysis: fallback, usedFallback: true, reason: "missing_api_key" });
    }

    try {
      const raw = await callNimJson({
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        userPrompt: buildAnalysisPrompt(body.profile, fallback),
        temperature: 0.2,
        maxTokens: 1400,
      });
      const patch = normalizeAiAnalysisPatch(raw, fallback);
      const analysis = mergeAnalysisPatch(fallback, patch);
      return NextResponse.json({ analysis, usedFallback: false });
    } catch (error) {
      return NextResponse.json({
        analysis: fallback,
        usedFallback: true,
        reason: error instanceof Error ? error.message : "nim_request_failed",
      });
    }
  } catch {
    return NextResponse.json({ error: "Unable to parse request payload." }, { status: 400 });
  }
}
