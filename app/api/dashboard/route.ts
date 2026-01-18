import { NextResponse } from "next/server";

import { getDashboardSummary } from "@/lib/store.server";

export async function GET() {
  const summary = await getDashboardSummary();
  return NextResponse.json({ summary });
}
