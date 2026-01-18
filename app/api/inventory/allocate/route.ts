import { NextResponse } from "next/server";

import { allocateStock } from "@/lib/store.server";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await allocateStock({
      salespersonId: body?.salespersonId,
      productId: body?.productId,
      qty: body?.qty,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to allocate stock";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
