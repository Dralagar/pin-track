// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/utils';

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}