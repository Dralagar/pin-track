"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { SalespersonProfile } from "@/lib/types";

type Props = {
  initial: SalespersonProfile;
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v);
}

function formatDateTime(s: string) {
  return new Date(s).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SalespersonProfileClient({ initial }: Props) {
  const [profile, setProfile] = useState<SalespersonProfile>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/salespeople/${profile.salesperson.id}/profile`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load profile");
      setProfile(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  const byProduct = useMemo(
    () => new Map(profile.stockAllocations.map((a) => [a.productId, a.qty] as const)),
    [profile.stockAllocations]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500 text-2xl font-bold text-slate-950">
              {profile.salesperson.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-semibold">{profile.salesperson.name}</h1>
              <p className="text-sm text-slate-300">
                {profile.salesperson.role === "BOSS" 
                  ? "Boss" 
                  : profile.salesperson.role === "NIGHT_SHIFT"
                  ? `Night Shift${profile.salesperson.nightPickTime ? ` (${profile.salesperson.nightPickTime})` : ""}`
                  : "Salesperson"} · {profile.totalPins} pins sold
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/salespeople"
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40"
            >
              Team
            </Link>
            <button
              onClick={refresh}
              disabled={loading}
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Today</p>
            <p className="mt-2 text-3xl font-semibold">{profile.todayPins}</p>
            <p className="text-sm text-slate-300">pins sold</p>
            <p className="mt-1 text-lg text-emerald-300">{formatCurrency(profile.todayRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total</p>
            <p className="mt-2 text-3xl font-semibold">{profile.totalPins}</p>
            <p className="text-sm text-slate-300">pins sold</p>
            <p className="mt-1 text-lg text-emerald-300">{formatCurrency(profile.totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Commission</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(profile.commissionEarned)}</p>
            <p className="text-sm text-slate-300">earned</p>
            {profile.creditOutstanding > 0 ? (
              <p className="mt-1 text-sm text-rose-300">Credit: {formatCurrency(profile.creditOutstanding)}</p>
            ) : null}
          </div>
        </section>

        {profile.stockReceivedToday !== undefined && profile.stockReceivedToday > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Stock Received Today</h2>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{profile.stockReceivedToday}</p>
            <p className="text-sm text-slate-300">items received today</p>
          </section>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Current stock allocations</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-right">Remaining</div>
              <div className="col-span-2 text-right">Given</div>
              <div className="col-span-2 text-right">Received Today</div>
            </div>
            {profile.stockAllocations.length ? (
              profile.stockAllocations.map((a) => (
                <div key={a.productId} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm even:bg-white/5">
                  <div className="col-span-6">{a.productId}</div>
                  <div className="col-span-2 text-right">{a.qty}</div>
                  <div className="col-span-2 text-right text-slate-400">{a.totalGiven ?? 0}</div>
                  <div className="col-span-2 text-right text-slate-400">{a.totalReceivedToday ?? 0}</div>
                </div>
              ))
            ) : (
              <div className="px-4 py-5 text-sm text-slate-300">No stock allocated.</div>
            )}
          </div>
        </section>

        {profile.itemsSoldByProduct && profile.itemsSoldByProduct.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Items Sold by Product</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-right">Qty Sold</div>
                <div className="col-span-4 text-right">Revenue</div>
              </div>
              {profile.itemsSoldByProduct.map((item) => (
                <div key={item.productId} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm even:bg-white/5">
                  <div className="col-span-6">{item.productName}</div>
                  <div className="col-span-2 text-right">{item.qty}</div>
                  <div className="col-span-4 text-right text-emerald-300">{formatCurrency(item.revenue)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.merchandiseTypes && profile.merchandiseTypes.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Merchandise Types</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.merchandiseTypes.map((type, idx) => (
                <span key={idx} className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-300">
                  {type}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Recent pins</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
              <div className="col-span-3">Date</div>
              <div className="col-span-4">Product</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            {profile.recentPins.length ? (
              profile.recentPins.map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm even:bg-white/5">
                  <div className="col-span-3">{formatDateTime(p.createdAt)}</div>
                  <div className="col-span-4 text-slate-300">{p.productId}</div>
                  <div className="col-span-2 text-right">{p.qty}</div>
                  <div className="col-span-3 text-right">{formatCurrency(p.total)}</div>
                </div>
              ))
            ) : (
              <div className="px-4 py-5 text-sm text-slate-300">No pins yet.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
