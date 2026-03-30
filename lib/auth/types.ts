// lib/auth/types.ts
export type User = {
    id: string;
    name: string;
    email?: string;
    role: "BOSS" | "SALESPERSON" | "NIGHT_SHIFT";
    pin?: string; // PIN for quick login
    createdAt: string;
  };
  
  export type AuthSession = {
    user: User;
    expiresAt: string;
  };
  
  export type LoginCredentials = {
    identifier: string; // name or email
    password?: string;
    pin?: string;
  };