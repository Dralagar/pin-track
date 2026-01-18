import { NextResponse } from "next/server";

import { updateWaitlistStatus } from "@/lib/store.server";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const entry = await updateWaitlistStatus(id, body?.status);
    return NextResponse.json({ entry });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update waitlist";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
