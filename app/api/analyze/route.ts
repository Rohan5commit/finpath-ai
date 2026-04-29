import { NextResponse } from "next/server";
import { ProfileSchema } from "@/lib/schemas";
import { buildHeuristicAnalysis } from "@/lib/finance";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = ProfileSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid profile data", details: result.error.format() }, { status: 400 });
    }

    const analysis = buildHeuristicAnalysis(result.data as any);
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json({ error: "Failed to process analysis" }, { status: 500 });
  }
}
