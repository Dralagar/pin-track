import { NextResponse } from "next/server";

import { getSalespersonProfile } from "@/lib/store.server";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    const profile = await getSalespersonProfile(id);
    return NextResponse.json(profile);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
