// app/api/auth/current-user/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}