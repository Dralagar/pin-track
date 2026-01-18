import { NextResponse } from "next/server";

import { listProducts } from "@/lib/store.server";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ products });
}
