import { NextResponse } from "next/server";

import { createStockRequest, getInventorySnapshot } from "@/lib/store.server";

export async function GET() {
  const snapshot = await getInventorySnapshot();
  return NextResponse.json({ stockRequests: snapshot.stockRequests });
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const req = await createStockRequest({
      salespersonId: body?.salespersonId,
      productId: body?.productId,
      qty: body?.qty,
      notes: body?.notes,
    });
    return NextResponse.json({ request: req }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
