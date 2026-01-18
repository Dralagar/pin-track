import { NextResponse } from "next/server";

import { getInventorySnapshot } from "@/lib/store.server";

export async function GET() {
  const snapshot = await getInventorySnapshot();
  return NextResponse.json(snapshot);
}
