import { NextResponse } from "next/server";

import { getAllSalespersonProfiles } from "@/lib/store.server";

export async function GET() {
  try {
    const profiles = await getAllSalespersonProfiles();
    return NextResponse.json(profiles);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load profiles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
