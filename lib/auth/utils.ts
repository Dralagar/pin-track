// lib/auth/utils.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthSession, User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'pintrack2025';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  const session: AuthSession = {
    user,
    expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
  };
  return jwt.sign(session, JWT_SECRET);
}

export function verifyToken(token: string): AuthSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthSession;
    if (new Date(decoded.expiresAt) < new Date()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) return null;
  
  const session = verifyToken(token);
  return session?.user || null;
}

export async function setAuthCookie(user: User): Promise<void> {
  const token = generateToken(user);
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

export function isBoss(user: User | null): boolean {
  return user?.role === 'BOSS';
}

export function isSalesperson(user: User | null): boolean {
  return user?.role === 'SALESPERSON' || user?.role === 'NIGHT_SHIFT';
}