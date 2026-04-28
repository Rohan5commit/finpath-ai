import { NextResponse } from "next/server";
import { buildScenarioOutcome } from "@/lib/finance";
import { parseScenarioRequest } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = parseScenarioRequest(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const scenario = buildScenarioOutcome(
      parsed.data.profile,
      parsed.data.saveBoostPercent,
      parsed.data.expenseTrimPercent,
    );

    return NextResponse.json({ scenario });
  } catch {
    return NextResponse.json({ error: "Unable to parse scenario request." }, { status: 400 });
  }
}
