import { NextResponse } from "next/server";

import { fulfillStockRequest } from "@/lib/store.server";

export async function POST(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    const result = await fulfillStockRequest(id);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fulfill request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
