// app/dashboard/page.tsx
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";
import { getDashboardSummary } from "@/lib/store.server";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DashboardLoading />}>
          <DashboardClient initialSummary={summary} />
        </Suspense>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="mt-4 text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  );
}