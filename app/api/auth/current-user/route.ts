import { NextResponse } from "next/server";

import { getCurrentUserServer } from "@/lib/auth.server";

export async function GET() {
  const user = await getCurrentUserServer();
  return NextResponse.json({ user });
}
