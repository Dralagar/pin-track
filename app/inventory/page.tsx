import Link from "next/link";

import InventoryClient from "./InventoryClient";
import { getInventorySnapshot } from "@/lib/store.server";

export default async function InventoryPage() {
  const snapshot = await getInventorySnapshot();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">PinTrack</p>
            <h1 className="mt-2 text-3xl font-semibold">Stock supplies</h1>
            <p className="mt-1 text-slate-300">
              Warehouse stock, salesperson allocations, restock requests, and customer waitlist.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/pins/new"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              New pin
            </Link>
            <Link href="/" className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40">
              Dashboard
            </Link>
          </div>
        </header>

        <InventoryClient initial={snapshot as any} />
      </main>
    </div>
  );
}
