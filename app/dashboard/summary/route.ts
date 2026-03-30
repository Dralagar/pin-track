// app/api/dashboard/summary/route.ts
import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/store.server";

export async function GET() {
  try {
    const summary = await getDashboardSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}