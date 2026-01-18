import { NextResponse } from "next/server";

import { addWaitlistEntry, getInventorySnapshot } from "@/lib/store.server";

export async function GET() {
  const snapshot = await getInventorySnapshot();
  return NextResponse.json({ waitlist: snapshot.waitlist });
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const entry = await addWaitlistEntry({
      productId: body?.productId,
      customerName: body?.customerName,
      customerPhone: body?.customerPhone,
      qty: body?.qty,
      notes: body?.notes,
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to add waitlist";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
