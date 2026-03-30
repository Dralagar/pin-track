// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/store.server';
import { setAuthCookie } from '@/lib/auth/utils';
import { salespersonToUser } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, pin } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    const db = await readDb();
    
    // Find user by name (case insensitive)
    const salesperson = db.salespeople.find(
      s => s.name.toLowerCase() === identifier.toLowerCase() && s.active
    );

    if (!salesperson) {
      return NextResponse.json(
        { error: 'Invalid name or PIN' },
        { status: 401 }
      );
    }

    // Verify PIN
    if (salesperson.pin !== pin) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Convert to User type using the helper function
    const user = salespersonToUser(salesperson);

    // Set auth cookie
    await setAuthCookie(user);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}