// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/store.server';
import { setAuthCookie } from '@/lib/auth/utils';
import { User } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, pin } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      );
    }

    const db = await readDb();
    
    // Find user by name or email
    const user = db.salespeople.find(
      s => s.name.toLowerCase() === identifier.toLowerCase() || 
           (s.email && s.email.toLowerCase() === identifier.toLowerCase())
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify PIN if provided, otherwise check if user has a password
    if (pin) {
      if (user.pin !== pin) {
        return NextResponse.json(
          { error: 'Invalid PIN' },
          { status: 401 }
        );
      }
    } else if (!user.active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      );
    }

    // Create session user
    const sessionUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: new Date().toISOString(),
    };

    await setAuthCookie(sessionUser);

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}