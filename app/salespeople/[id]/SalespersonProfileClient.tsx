"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Package, 
  Clock,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

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

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SalespersonProfileClient({ initial }: Props) {
  const [profile, setProfile] = useState<SalespersonProfile>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllPins, setShowAllPins] = useState(false);

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

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const totalSales = profile.totalRevenue;
    const avgPerPin = profile.totalPins > 0 ? totalSales / profile.totalPins : 0;
    const commissionRate = totalSales > 0 ? (profile.commissionEarned / totalSales) * 100 : 0;
    
    return {
      avgPerPin,
      commissionRate,
      totalSales,
    };
  }, [profile]);

  // Calculate debt/credit metrics
  const debtMetrics = useMemo(() => {
    const totalCredit = profile.creditOutstanding;
    const paidPins = profile.totalPins - (profile.creditPinsCount || 0);
    const paidRevenue = totalSales - totalCredit;
    
    return {
      totalCredit,
      paidPins,
      paidRevenue,
      creditPercentage: totalSales > 0 ? (totalCredit / totalSales) * 100 : 0,
    };
  }, [profile]);

  // Group pins by payment type
  const pinsByPaymentType = useMemo(() => {
    const counts = {
      cash: 0,
      mpesa: 0,
      credit: 0,
    };
    const totals = {
      cash: 0,
      mpesa: 0,
      credit: 0,
    };
    
    profile.recentPins.forEach(pin => {
      if (pin.paymentType === "CASH") {
        counts.cash++;
        totals.cash += pin.total;
      } else if (pin.paymentType === "MPESA") {
        counts.mpesa++;
        totals.mpesa += pin.total;
      } else if (pin.paymentType === "CREDIT") {
        counts.credit++;
        totals.credit += pin.total;
      }
    });
    
    return { counts, totals };
  }, [profile.recentPins]);

  const displayedPins = showAllPins ? profile.recentPins : profile.recentPins.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-2xl font-bold text-slate-950 shadow-lg">
              {profile.salesperson.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">{profile.salesperson.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  profile.salesperson.role === "BOSS" 
                    ? "bg-purple-500/20 text-purple-300"
                    : profile.salesperson.role === "NIGHT_SHIFT"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-emerald-500/20 text-emerald-300"
                }`}>
                  {profile.salesperson.role === "BOSS" 
                    ? "👑 Boss" 
                    : profile.salesperson.role === "NIGHT_SHIFT"
                    ? `🌙 Night Shift${profile.salesperson.nightPickTime ? ` (${profile.salesperson.nightPickTime})` : ""}`
                    : "👤 Salesperson"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400">{profile.totalPins} total pins</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/salespeople"
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40 transition-all hover:bg-white/5"
            >
              Team List
            </Link>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40 disabled:opacity-60 transition-all hover:bg-white/5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Today's Sales</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-semibold">{profile.todayPins}</p>
            <p className="text-sm text-slate-300">pins sold</p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">{formatCurrency(profile.todayRevenue)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total Sales</p>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-semibold">{profile.totalPins}</p>
            <p className="text-sm text-slate-300">pins sold</p>
            <p className="mt-2 text-lg font-semibold text-blue-400">{formatCurrency(performanceMetrics.totalSales)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Commission</p>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-semibold text-purple-400">{formatCurrency(profile.commissionEarned)}</p>
            <p className="text-sm text-slate-300">earned</p>
            <p className="mt-2 text-xs text-slate-400">{performanceMetrics.commissionRate.toFixed(1)}% of sales</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Credit Outstanding</p>
              <CreditCard className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-3xl font-semibold text-orange-400">{formatCurrency(debtMetrics.totalCredit)}</p>
            <p className="text-sm text-slate-300">to collect</p>
            <p className="mt-2 text-xs text-slate-400">{debtMetrics.creditPercentage.toFixed(1)}% of total sales</p>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Payment Methods Breakdown</h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Cash</span>
                  <span className="text-white font-semibold">{formatCurrency(pinsByPaymentType.totals.cash)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${(pinsByPaymentType.totals.cash / performanceMetrics.totalSales) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{pinsByPaymentType.counts.cash} pins</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">M-PESA</span>
                  <span className="text-white font-semibold">{formatCurrency(pinsByPaymentType.totals.mpesa)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${(pinsByPaymentType.totals.mpesa / performanceMetrics.totalSales) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{pinsByPaymentType.counts.mpesa} pins</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Credit</span>
                  <span className="text-white font-semibold">{formatCurrency(pinsByPaymentType.totals.credit)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                    style={{ width: `${(pinsByPaymentType.totals.credit / performanceMetrics.totalSales) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{pinsByPaymentType.counts.credit} pins</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Performance Stats</h3>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">Average per Pin</p>
                <p className="text-2xl font-semibold text-emerald-400">{formatCurrency(performanceMetrics.avgPerPin)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Paid vs Credit</p>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Paid: {formatCurrency(debtMetrics.paidRevenue)}</span>
                  <span className="text-orange-400">Credit: {formatCurrency(debtMetrics.totalCredit)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full transition-all"
                    style={{ width: `${debtMetrics.creditPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Total Commission Rate</p>
                <p className="text-lg font-semibold text-purple-400">{performanceMetrics.commissionRate.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Received Today */}
        {(profile.stockReceivedToday !== undefined && profile.stockReceivedToday > 0) && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-semibold text-emerald-400">Stock Received Today</h2>
                <p className="text-3xl font-bold text-emerald-300">{profile.stockReceivedToday}</p>
                <p className="text-sm text-emerald-300/70">items received for today's allocation</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Stock Allocations */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Current Stock Allocations</h2>
          <div className="overflow-x-auto">
            <div className="min-w-full rounded-xl border border-white/10">
              <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                <div className="col-span-5 sm:col-span-6">Product</div>
                <div className="col-span-2 text-right">Remaining</div>
                <div className="col-span-2 text-right">Given</div>
                <div className="col-span-3 text-right">Received Today</div>
              </div>
              {profile.stockAllocations.length ? (
                profile.stockAllocations.map((a) => (
                  <div key={a.productId} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm even:bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="col-span-5 sm:col-span-6 font-medium">{a.productName || a.productId}</div>
                    <div className="col-span-2 text-right text-emerald-300 font-semibold">{a.qty}</div>
                    <div className="col-span-2 text-right text-slate-400">{a.totalGiven ?? 0}</div>
                    <div className="col-span-3 text-right text-slate-400">{a.totalReceivedToday ?? 0}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-sm text-slate-300 text-center">No stock allocated.</div>
              )}
            </div>
          </div>
        </section>

        {/* Items Sold by Product */}
        {profile.itemsSoldByProduct && profile.itemsSoldByProduct.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold mb-4">Items Sold by Product</h2>
            <div className="overflow-x-auto">
              <div className="min-w-full rounded-xl border border-white/10">
                <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                  <div className="col-span-5 sm:col-span-6">Product</div>
                  <div className="col-span-3 text-right">Qty Sold</div>
                  <div className="col-span-4 text-right">Revenue</div>
                </div>
                {profile.itemsSoldByProduct.map((item) => (
                  <div key={item.productId} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm even:bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="col-span-5 sm:col-span-6 font-medium">{item.productName}</div>
                    <div className="col-span-3 text-right font-semibold">{item.qty}</div>
                    <div className="col-span-4 text-right text-emerald-400">{formatCurrency(item.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Merchandise Types */}
        {profile.merchandiseTypes && profile.merchandiseTypes.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold mb-4">Merchandise Types</h2>
            <div className="flex flex-wrap gap-2">
              {profile.merchandiseTypes.map((type, idx) => (
                <span key={idx} className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-sm text-emerald-300 font-medium">
                  {type}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Recent Pins */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            {profile.recentPins.length > 5 && (
              <button
                onClick={() => setShowAllPins(!showAllPins)}
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {showAllPins ? "Show Less" : `View All (${profile.recentPins.length})`}
                <ChevronRight className={`w-4 h-4 transition-transform ${showAllPins ? "rotate-90" : ""}`} />
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full rounded-xl border border-white/10">
              <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                <div className="col-span-3">Date</div>
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              {displayedPins.length ? (
                displayedPins.map((p) => (
                  <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm even:bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="col-span-3 text-slate-300">{formatDateTime(p.createdAt)}</div>
                    <div className="col-span-4 font-medium">{p.productName || p.productId}</div>
                    <div className="col-span-2 text-right font-semibold">{p.qty}</div>
                    <div className="col-span-3 text-right text-emerald-400">{formatCurrency(p.total)}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-sm text-slate-300 text-center">No transactions yet.</div>
              )}
            </div>
          </div>
        </section>

        {/* Credit/Debt Summary */}
        {profile.creditOutstanding > 0 && (
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-orange-400">Credit Summary</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Outstanding credit: <span className="font-semibold text-orange-400">{formatCurrency(profile.creditOutstanding)}</span>
                </p>
                {profile.creditTransactions && profile.creditTransactions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2">Recent credit transactions:</p>
                    <div className="space-y-1">
                      {profile.creditTransactions.slice(0, 3).map((tx, idx) => (
                        <div key={idx} className="text-xs text-slate-300">
                          {formatDate(tx.date)} - {formatCurrency(tx.amount)} ({tx.status})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}