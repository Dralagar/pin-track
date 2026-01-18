import type { Salesperson } from "./types";

export const CURRENT_USER_NAME = "Bunny";

export async function getCurrentUserServer(): Promise<Salesperson | null> {
  const { listSalespeople } = await import("./store.server");
  const salespeople = await listSalespeople();
  return salespeople.find((s) => s.name === CURRENT_USER_NAME && s.active) ?? null;
}

export function isBoss(user: Salesperson | null): boolean {
  return user?.role === "BOSS";
}
