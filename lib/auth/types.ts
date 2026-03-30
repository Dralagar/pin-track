// lib/auth/types.ts
import type { Salesperson } from '@/lib/types';

export type User = {
  id: string;
  name: string;
  email?: string;
  role: "BOSS" | "SALESPERSON" | "NIGHT_SHIFT";
  createdAt: string;
};

export type AuthSession = {
  user: User;
  expiresAt: string;
};

export type LoginCredentials = {
  identifier: string; // name or email
  pin?: string;
};

// Helper function to convert Salesperson to User
export function salespersonToUser(salesperson: Salesperson): User {
  return {
    id: salesperson.id,
    name: salesperson.name,
    email: salesperson.email,
    role: salesperson.role || "SALESPERSON",
    createdAt: new Date().toISOString(),
  };
}