import { NextResponse } from "next/server";

import { createPin, listPins } from "@/lib/store.server";

export async function GET() {
  const pins = await listPins();
  return NextResponse.json({ pins });
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const salespersonId = typeof body?.salespersonId === "string" ? body.salespersonId : "";
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const qty = typeof body?.qty === "number" || typeof body?.qty === "string" ? Number(body.qty) : NaN;
  const paymentType = typeof body?.paymentType === "string" ? body.paymentType : "";

  if (!salespersonId || !productId || !Number.isFinite(qty) || qty <= 0 || !paymentType) {
    return NextResponse.json(
      { error: "salespersonId, productId, qty (>0) and paymentType are required" },
      { status: 400 }
    );
  }

  try {
    const pin = await createPin({
      salespersonId,
      productId,
      qty,
      paymentType,
      mpesaReceipt: typeof body?.mpesaReceipt === "string" ? body.mpesaReceipt : undefined,
      customerName: typeof body?.customerName === "string" ? body.customerName : undefined,
      customerPhone: typeof body?.customerPhone === "string" ? body.customerPhone : undefined,
      dueDate: typeof body?.dueDate === "string" ? body.dueDate : undefined,
      notes: typeof body?.notes === "string" ? body.notes : undefined,
    } as any);

    return NextResponse.json({ pin }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create pin";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
