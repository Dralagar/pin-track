import Link from "next/link";

import { getDashboardSummary, listPins, listProducts, listSalespeople } from "@/lib/store.server";

const milestones = [
  {
    title: "Quick Pin entry",
    description:
      "Select salesperson, product, quantity, and Mpesa or cash with one tap",
  } ,
  {
    title: "Live reconciliation",
    description:
      "Automated Mpesa upload suggests matches, highlights gaps, and signals missing cash details",
  },
  {
    title: "Commission-ready",
    description:
      "Track every pin, compute per-unit or percentage commissions, and send payout alerts",
  },
  {
    title: "Inventory mastery",
    description:
      "Map each incoming cohort, monitor sold vs remaining stock, and forecast restocking",
  },
];

export default async function Page() {
  const [summary, products, salespeople, pins] = await Promise.all([
    getDashboardSummary(),
    listProducts(),
    listSalespeople(),
    listPins(),
  ]);

  const bySalesperson = new Map(salespeople.map((s) => [s.id, s.name] as const));
  const byProduct = new Map(products.map((p) => [p.id, p] as const));
  const timeline = pins.slice(0, 8).map((pin) => {
    const time = pin.createdAt.slice(11, 16);
    const salesperson = bySalesperson.get(pin.salespersonId) ?? "Unknown";
    const product = byProduct.get(pin.productId);
    const label = product ? product.sku : "?";
    const payment = pin.paymentType;
    const receipt = pin.mpesaReceipt ? ` (receipt ${pin.mpesaReceipt})` : "";
    return {
      id: pin.id,
      time,
      event: `${salesperson} pins ${pin.qty} × ${label} via ${payment}${receipt}`,
    };
  });

  const summaryCards = [
    { label: "Today’s pins", value: String(summary.todayPins), detail: "Live" },
    {
      label: "Mpesa total (today)",
      value: `Ksh ${summary.mpesaTotal.toLocaleString()}`,
      detail: `${summary.unmatchedMpesa} missing receipt`,
    },
    { label: "Cash total (today)", value: `Ksh ${summary.cashTotal.toLocaleString()}`, detail: "Live" },
    {
      label: "Commission owed", 
      value: `Ksh ${summary.commissionOwed.toLocaleString()}`,
      detail: `Credit outstanding: Ksh ${summary.creditOutstanding.toLocaleString()}`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-900/70 p-10 shadow-2xl shadow-black/40">
          <div className="flex flex-col gap-6">
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">PinFlow</p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Track every Mpesa & cash pin, avoid missing totals, and reward your sales champions.
            </h1>
            <p className="max-w-3xl text-lg text-slate-300">
              PinFlow is purpose-built for the X merchandise team: quick product pickers, flexible payment types,
              two people on the ground, and a boss who needs clean numbers with every handover.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/pins/new"
                className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Log a new pin
              </Link>
              <Link
                href="/reconciliation"
                className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:border-emerald-400"
              >
                View reconciliation
              </Link>
              <Link
                href="/inventory"
                className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:border-emerald-400"
              >
                Inventory
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {summaryCards.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
              <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Products</p>
              <h2 className="text-2xl font-semibold text-white">Stock + price signal</h2>
            </div>
            <p className="text-sm text-slate-400">Updated live with each pin</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{product.sku}</span>
                  <span className="text-emerald-300">Commission: {product.commissionPerUnit}</span>
                </div>
                <p className="text-2xl font-semibold">Ksh {product.unitPrice}</p>
                <p className="text-sm text-slate-400">Active: {product.active ? "Yes" : "No"}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-800/70 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Process</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">From pin to payout</h3>
            <div className="mt-4 space-y-4">
              {milestones.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-800/70 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Daily log</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">Realtime timeline</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              {timeline.length ? (
                timeline.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span className="text-emerald-300">{item.time}</span>
                  <p>{item.event}</p>
                </div>
                ))
              ) : (
                <p className="text-slate-400">No pins yet. Create your first pin to see activity here.</p>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
