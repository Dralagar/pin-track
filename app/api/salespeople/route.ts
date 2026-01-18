import { NextResponse } from "next/server";

import { listSalespeople } from "@/lib/store.server";

export async function GET() {
  const salespeople = await listSalespeople();
  return NextResponse.json({ salespeople });
}
