import { NextResponse } from "next/server";
import { buildScenarioOutcome } from "@/lib/finance";
import type { FinancialProfile } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile?: FinancialProfile;
      saveBoostPercent?: number;
      expenseTrimPercent?: number;
    };

    if (!body.profile) {
      return NextResponse.json({ error: "Missing profile." }, { status: 400 });
    }

    const scenario = buildScenarioOutcome(
      body.profile,
      Number(body.saveBoostPercent ?? 20),
      Number(body.expenseTrimPercent ?? 5),
    );

    return NextResponse.json({ scenario });
  } catch {
    return NextResponse.json({ error: "Unable to parse scenario request." }, { status: 400 });
  }
}
