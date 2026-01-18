import Link from "next/link";

import { listPins, listProducts, listSalespeople } from "@/lib/store.server";

export default async function PinsPage() {
  const [pins, products, salespeople] = await Promise.all([listPins(), listProducts(), listSalespeople()]);

  const bySalesperson = new Map(salespeople.map((s) => [s.id, s.name] as const));
  const byProduct = new Map(products.map((p) => [p.id, p] as const));

  const totalValue = pins.reduce((acc, p) => acc + (p.status === "CANCELED" ? 0 : p.total), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Pins</h1>
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
          </div>
          <p className="text-slate-300">
            Total recorded value: <span className="text-white">Ksh {totalValue.toLocaleString()}</span>
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-12 gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
            <div className="col-span-2">Time</div>
            <div className="col-span-2">Salesperson</div>
            <div className="col-span-2">Product</div>
            <div className="col-span-1 text-right">Qty</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2">Payment</div>
            <div className="col-span-1">Status</div>
          </div>

          {pins.length ? (
            pins.map((pin) => {
              const t = `${pin.createdAt.slice(0, 10)} ${pin.createdAt.slice(11, 16)}`;
              const salesperson = bySalesperson.get(pin.salespersonId) ?? "Unknown";
              const product = byProduct.get(pin.productId);
              const productLabel = product ? `${product.sku}` : "?";
              return (
                <div
                  key={pin.id}
                  className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-slate-200 odd:bg-white/0 even:bg-white/5"
                >
                  <div className="col-span-2 text-slate-300">{t}</div>
                  <div className="col-span-2">{salesperson}</div>
                  <div className="col-span-2">{productLabel}</div>
                  <div className="col-span-1 text-right">{pin.qty}</div>
                  <div className="col-span-2 text-right">Ksh {pin.total.toLocaleString()}</div>
                  <div className="col-span-2">
                    {pin.paymentType}
                    {pin.mpesaReceipt ? <span className="text-slate-400"> ({pin.mpesaReceipt})</span> : null}
                    {pin.paymentType === "CREDIT" && pin.customerName ? (
                      <span className="text-slate-400"> ({pin.customerName})</span>
                    ) : null}
                  </div>
                  <div className="col-span-1 text-slate-300">{pin.status}</div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-slate-300">
              No pins yet. <Link href="/pins/new" className="text-emerald-300 hover:text-emerald-200">Create one</Link>.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
