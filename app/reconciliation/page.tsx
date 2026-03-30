import Link from "next/link";

import { listPins, listProducts, listSalespeople } from "@/lib/store.server";

export default async function ReconciliationPage() {
  const [pins, products, salespeople] = await Promise.all([listPins(), listProducts(), listSalespeople()]);

  const bySalesperson = new Map(salespeople.map((s) => [s.id, s.name] as const));
  const byProduct = new Map(products.map((p) => [p.id, p] as const));

  const mpesaMissingReceipt = pins.filter((p) => p.paymentType === "MPESA" && !p.mpesaReceipt && p.status !== "CANCELED");
  const creditOutstanding = pins.filter((p) => p.paymentType === "CREDIT" && p.status !== "CANCELED");

  const creditTotal = creditOutstanding.reduce((acc, p) => acc + p.total, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Reconciliation</h1>
            <p className="mt-1 text-slate-300">
              This MVP view highlights items that need attention: missing Mpesa receipts and pay-later balances.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/pins/new"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              New pin
            </Link>
            <Link 
              href="/dashboard" 
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40 transition-colors hover:bg-white/5"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Mpesa pins missing receipt</h2>
          <p className="mt-1 text-sm text-slate-300">
            Count: <span className="text-white">{mpesaMissingReceipt.length}</span>
          </p>

          {mpesaMissingReceipt.length ? (
            <div className="mt-4 space-y-3">
              {mpesaMissingReceipt.slice(0, 20).map((pin) => {
                const salesperson = bySalesperson.get(pin.salespersonId) ?? "Unknown";
                const product = byProduct.get(pin.productId);
                const sku = product?.sku ?? "?";
                return (
                  <div key={pin.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {salesperson} · {pin.qty} × {sku}
                      </p>
                      <p className="text-slate-300">Ksh {pin.total.toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">Created: {pin.createdAt.replace("T", " ").slice(0, 16)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No missing receipts right now.</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Credit (pay later) outstanding</h2>
          <p className="mt-1 text-sm text-slate-300">
            Total: <span className="text-white">Ksh {creditTotal.toLocaleString()}</span> · Count: {creditOutstanding.length}
          </p>

          {creditOutstanding.length ? (
            <div className="mt-4 space-y-3">
              {creditOutstanding.slice(0, 20).map((pin) => {
                const salesperson = bySalesperson.get(pin.salespersonId) ?? "Unknown";
                const product = byProduct.get(pin.productId);
                const sku = product?.sku ?? "?";
                return (
                  <div key={pin.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {pin.customerName ?? "Customer"} · {pin.customerPhone ?? ""}
                      </p>
                      <p className="text-slate-300">Ksh {pin.total.toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {salesperson} · {pin.qty} × {sku} · Due: {pin.dueDate ?? "(not set)"}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No credit balance right now.</p>
          )}
        </section>
      </main>
    </div>
  );
}