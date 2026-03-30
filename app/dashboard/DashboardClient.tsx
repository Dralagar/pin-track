// app/dashboard/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CreditCard, 
  ShoppingBag, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  Bell,
  AlertTriangle,
  Activity
} from "lucide-react";

type DashboardSummary = {
  todayPins: number;
  mpesaTotal: number;
  cashTotal: number;
  creditOutstanding: number;
  commissionOwed: number;
  unmatchedMpesa: number;
};

type Props = {
  initialSummary: DashboardSummary;
};

export default function DashboardClient({ initialSummary }: Props) {
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date());
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/summary", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setSummary(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total revenue safely
  const totalRevenue = summary.mpesaTotal + summary.cashTotal + summary.creditOutstanding;

  const stats = [
    {
      title: "Today's Sales",
      value: summary.todayPins,
      subValue: formatCurrency(summary.mpesaTotal + summary.cashTotal),
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      trend: summary.todayPins > 0 ? "+" + summary.todayPins : "0",
      trendUp: summary.todayPins > 0,
    },
    {
      title: "Revenue Today",
      value: formatCurrency(summary.mpesaTotal + summary.cashTotal),
      icon: DollarSign,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      subValue: `M-PESA: ${formatCurrency(summary.mpesaTotal)} | Cash: ${formatCurrency(summary.cashTotal)}`,
    },
    {
      title: "Credit Outstanding",
      value: formatCurrency(summary.creditOutstanding),
      icon: CreditCard,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      trend: summary.creditOutstanding > 0 ? "+" + formatCurrency(summary.creditOutstanding) : "None",
      trendUp: summary.creditOutstanding > 0,
    },
    {
      title: "Commission Owed",
      value: formatCurrency(summary.commissionOwed),
      icon: Users,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      subValue: "To salespeople",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Real-time sales overview and analytics</p>
        </div>
        <div className="flex items-center gap-4">
          {mounted && lastUpdated && (
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.split(" ")[0].replace("from-", "text-")}`} />
                </div>
                {stat.trend && (
                  <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? "text-emerald-400" : "text-red-400"}`}>
                    {stat.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-slate-400">{stat.title}</h3>
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              {stat.subValue && (
                <p className="text-xs text-slate-400 mt-2">{stat.subValue}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            Payment Methods
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">M-PESA</span>
                <span className="text-white font-semibold">{formatCurrency(summary.mpesaTotal)}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: totalRevenue > 0 ? `${(summary.mpesaTotal / totalRevenue) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Cash</span>
                <span className="text-white font-semibold">{formatCurrency(summary.cashTotal)}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: totalRevenue > 0 ? `${(summary.cashTotal / totalRevenue) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Credit</span>
                <span className="text-white font-semibold">{formatCurrency(summary.creditOutstanding)}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: totalRevenue > 0 ? `${(summary.creditOutstanding / totalRevenue) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            {summary.unmatchedMpesa > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">Unmatched M-PESA Transactions</p>
                  <p className="text-xs text-slate-300 mt-1">
                    {summary.unmatchedMpesa} transaction(s) need receipt numbers
                  </p>
                </div>
              </div>
            )}
            {summary.creditOutstanding > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <CreditCard className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-400">Outstanding Credit</p>
                  <p className="text-xs text-slate-300 mt-1">
                    {formatCurrency(summary.creditOutstanding)} in credit sales to collect
                  </p>
                </div>
              </div>
            )}
            {summary.todayPins === 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400">No Sales Today</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Start recording pins to see activity
                  </p>
                </div>
              </div>
            )}
            {summary.unmatchedMpesa === 0 && summary.creditOutstanding === 0 && summary.todayPins > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">All Systems Green</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Everything is running smoothly
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <p className="text-slate-400">Recent transactions will appear here</p>
          <p className="text-sm text-slate-500 mt-2">
            Check back soon for more detailed analytics
          </p>
        </div>
      </div>
    </div>
  );
}