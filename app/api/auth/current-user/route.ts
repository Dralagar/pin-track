// app/api/auth/current-user/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/utils';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}