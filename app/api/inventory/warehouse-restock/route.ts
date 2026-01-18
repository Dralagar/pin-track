import { NextResponse } from "next/server";

import { warehouseRestock } from "@/lib/store.server";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const warehouse = await warehouseRestock({
      productId: body?.productId,
      qty: body?.qty,
      notes: body?.notes,
    });
    return NextResponse.json({ warehouse }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to restock warehouse";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
