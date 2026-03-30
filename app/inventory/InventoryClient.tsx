"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { DbData, Product, Salesperson, WaitlistEntry } from "@/lib/types";

type InventorySnapshot = Pick<DbData, "warehouseStock" | "salespersonStock" | "stockRequests" | "waitlist"> & {
  products: Product[];
  salespeople: Salesperson[];
};

type Props = {
  initial: InventorySnapshot;
};

function productLabel(p?: Product) {
  if (!p) return "Unknown";
  return `${p.sku} - ${p.name}`;
}

export default function InventoryClient({ initial }: Props) {
  const router = useRouter();

  const [data, setData] = useState<InventorySnapshot>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [restockProductId, setRestockProductId] = useState(data.products[0]?.id ?? "");
  const [restockQty, setRestockQty] = useState(10);

  const [allocSalespersonId, setAllocSalespersonId] = useState(data.salespeople[0]?.id ?? "");
  const [allocProductId, setAllocProductId] = useState(data.products[0]?.id ?? "");
  const [allocQty, setAllocQty] = useState(10);

  const [reqSalespersonId, setReqSalespersonId] = useState(data.salespeople[0]?.id ?? "");
  const [reqProductId, setReqProductId] = useState(data.products[0]?.id ?? "");
  const [reqQty, setReqQty] = useState(10);
  const [reqNotes, setReqNotes] = useState("");

  const [wlProductId, setWlProductId] = useState(data.products[0]?.id ?? "");
  const [wlQty, setWlQty] = useState(1);
  const [wlCustomerName, setWlCustomerName] = useState("");
  const [wlCustomerPhone, setWlCustomerPhone] = useState("");
  const [wlNotes, setWlNotes] = useState("");

  const byProduct = useMemo(() => new Map(data.products.map((p) => [p.id, p] as const)), [data.products]);
  const bySalesperson = useMemo(
    () => new Map(data.salespeople.map((s) => [s.id, s.name] as const)),
    [data.salespeople]
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load inventory");
      setData(json);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  async function postJson(url: string, payload: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Request failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function patchJson(url: string, payload: any) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Request failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const warehouseRows = data.products.map((p) => {
    const qty = data.warehouseStock.find((x) => x.productId === p.id)?.qty ?? 0;
    return { product: p, qty };
  });

  const salespersonStockRows = data.salespersonStock
    .slice()
    .sort((a, b) => (a.salespersonId + a.productId).localeCompare(b.salespersonId + b.productId))
    .map((row) => ({
      salesperson: bySalesperson.get(row.salespersonId) ?? "Unknown",
      product: byProduct.get(row.productId),
      qty: row.qty,
      totalGiven: row.totalGiven ?? 0,
      batches: row.batches ?? [],
    }));

  const openRequests = data.stockRequests
    .filter((r) => r.status === "OPEN")
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const waiting = data.waitlist.filter((w) => w.status === "WAITING");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Inventory</h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40 disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Warehouse stock</h2>
        <p className="mt-1 text-sm text-slate-300">The boss/supplier stock pool used for morning allocations and restocks.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {warehouseRows.map(({ product, qty }) => {
            const warehouseItem = data.warehouseStock.find((x) => x.productId === product.id);
            const totalGiven = warehouseItem?.totalGiven ?? 0;
            const totalRestocked = warehouseItem?.totalRestocked ?? 0;
            return (
              <div key={product.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{product.sku}</p>
                  <div className="text-right">
                    <p className={qty <= 0 ? "text-rose-300" : "text-emerald-300"}>{qty} remaining</p>
                    {totalGiven > 0 && (
                      <p className="text-xs text-slate-400">Given: {totalGiven}</p>
                    )}
                    {totalRestocked > 0 && (
                      <p className="text-xs text-slate-400">Restocked: {totalRestocked}</p>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">{product.name}</p>
                {warehouseItem?.batches && warehouseItem.batches.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-500">Recent activity:</p>
                    {warehouseItem.batches.slice(-3).reverse().map((batch) => (
                      <p key={batch.batchId} className="text-xs text-slate-500">
                        {batch.qty > 0 ? `+${batch.qty}` : batch.qty} at {new Date(batch.timestamp).toLocaleString()}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Warehouse restock</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <select
              value={restockProductId}
              onChange={(e) => setRestockProductId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            >
              {data.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {productLabel(p)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
            <button
              onClick={() => postJson("/api/inventory/warehouse-restock", { productId: restockProductId, qty: restockQty })}
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              Add to warehouse
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Morning allocations (salesperson stock)</h2>
        <p className="mt-1 text-sm text-slate-300">Allocate from warehouse to each salesperson. Pins deduct from this automatically.</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Allocate stock</p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <select
              value={allocSalespersonId}
              onChange={(e) => setAllocSalespersonId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            >
              {data.salespeople.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={allocProductId}
              onChange={(e) => setAllocProductId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            >
              {data.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {productLabel(p)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={allocQty}
              onChange={(e) => setAllocQty(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
            <button
              onClick={() => postJson("/api/inventory/allocate", { salespersonId: allocSalespersonId, productId: allocProductId, qty: allocQty })}
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              Allocate
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
          <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
            <div className="col-span-3">Salesperson</div>
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-right">Remaining</div>
            <div className="col-span-2 text-right">Given</div>
            <div className="col-span-1"></div>
          </div>
          {salespersonStockRows.length ? (
            salespersonStockRows.map((row, idx) => (
              <div key={`${row.salesperson}-${row.product?.id ?? idx}`} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm even:bg-white/5 group relative">
                <div className="col-span-3">{row.salesperson}</div>
                <div className="col-span-4 text-slate-300">{productLabel(row.product)}</div>
                <div className="col-span-2 text-right">{row.qty}</div>
                <div className="col-span-2 text-right text-slate-400">{row.totalGiven}</div>
                <div className="col-span-1">
                  {row.batches.length > 0 && (
                    <details className="cursor-pointer">
                      <summary className="text-xs text-slate-500 hover:text-slate-300">📅</summary>
                      <div className="absolute z-10 mt-2 right-0 rounded-lg border border-white/20 bg-slate-900 p-3 shadow-lg min-w-[300px]">
                        <p className="text-xs font-semibold mb-2 text-emerald-300">Stock History:</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {row.batches.slice().reverse().map((batch) => (
                            <p key={batch.batchId} className="text-xs text-slate-300 border-b border-white/10 pb-1">
                              <span className="text-emerald-400">+{batch.qty}</span> at {new Date(batch.timestamp).toLocaleString()}
                              {batch.notes && <span className="text-slate-500 ml-2">({batch.notes})</span>}
                            </p>
                          ))}
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-5 text-sm text-slate-300">No allocations yet.</div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Restock requests</h2>
        <p className="mt-1 text-sm text-slate-300">Salespeople request restocks; boss fulfills from warehouse.</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Create request</p>
          <div className="mt-3 grid gap-3 md:grid-cols-5">
            <select
              value={reqSalespersonId}
              onChange={(e) => setReqSalespersonId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            >
              {data.salespeople.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={reqProductId}
              onChange={(e) => setReqProductId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            >
              {data.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {productLabel(p)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={reqQty}
              onChange={(e) => setReqQty(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
            <input
              value={reqNotes}
              onChange={(e) => setReqNotes(e.target.value)}
              placeholder="notes (optional)"
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
            <button
              onClick={() => postJson("/api/inventory/requests", { salespersonId: reqSalespersonId, productId: reqProductId, qty: reqQty, notes: reqNotes })}
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              Request
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {openRequests.length ? (
            openRequests.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      {bySalesperson.get(r.salespersonId) ?? "Unknown"} requests {r.qty} × {byProduct.get(r.productId)?.sku ?? "?"}
                    </p>
                    <p className="text-sm text-slate-400">{r.createdAt.replace("T", " ").slice(0, 16)}</p>
                    {r.notes ? <p className="text-sm text-slate-300">{r.notes}</p> : null}
                  </div>
                  <button
                    onClick={() => postJson(`/api/inventory/requests/${r.id}/fulfill`, {})}
                    disabled={loading}
                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    Fulfill
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No open restock requests.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Customer waitlist (out of stock)</h2>
        <p className="mt-1 text-sm text-slate-300">When an item is out, add the customer here. When stock returns, the system marks entries as NOTIFIED.</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Add waitlist</p>
          <div className="mt-3 grid gap-3 md:grid-cols-5">
            <select
              value={wlProductId}
              onChange={(e) => setWlProductId(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            >
              {data.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {productLabel(p)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={wlQty}
              onChange={(e) => setWlQty(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
            <input
              value={wlCustomerName}
              onChange={(e) => setWlCustomerName(e.target.value)}
              placeholder="customer name"
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
            <input
              value={wlCustomerPhone}
              onChange={(e) => setWlCustomerPhone(e.target.value)}
              placeholder="phone"
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
            <button
              onClick={() =>
                postJson("/api/inventory/waitlist", {
                  productId: wlProductId,
                  qty: wlQty,
                  customerName: wlCustomerName,
                  customerPhone: wlCustomerPhone,
                  notes: wlNotes,
                })
              }
              disabled={loading}
              className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              Add
            </button>
          </div>
          <div className="mt-3">
            <input
              value={wlNotes}
              onChange={(e) => setWlNotes(e.target.value)}
              placeholder="notes (optional)"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
          </div>
        </div>

        <WaitlistTable
          items={data.waitlist}
          byProduct={byProduct}
          loading={loading}
          onClose={(id) => patchJson(`/api/inventory/waitlist/${id}`, { status: "CLOSED" })}
        />

        {waiting.length ? (
          <p className="mt-3 text-sm text-emerald-300">
            Waiting customers: {waiting.length}. When you restock warehouse, affected entries are marked as NOTIFIED.
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No customers waiting right now.</p>
        )}
      </section>
    </div>
  );
}

function WaitlistTable({
  items,
  byProduct,
  loading,
  onClose,
}: {
  items: WaitlistEntry[];
  byProduct: Map<string, Product>;
  loading: boolean;
  onClose: (id: string) => void;
}) {
  const rows = items.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
      <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
        <div className="col-span-3">Product</div>
        <div className="col-span-3">Customer</div>
        <div className="col-span-2">Phone</div>
        <div className="col-span-1 text-right">Qty</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1"></div>
      </div>

      {rows.length ? (
        rows.map((w) => (
          <div key={w.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm even:bg-white/5">
            <div className="col-span-3 text-slate-300">{productLabel(byProduct.get(w.productId))}</div>
            <div className="col-span-3">{w.customerName}</div>
            <div className="col-span-2 text-slate-300">{w.customerPhone}</div>
            <div className="col-span-1 text-right">{w.qty}</div>
            <div className="col-span-2">
              <span
                className={
                  w.status === "WAITING"
                    ? "text-rose-300"
                    : w.status === "NOTIFIED"
                      ? "text-emerald-300"
                      : "text-slate-300"
                }
              >
                {w.status}
              </span>
            </div>
            <div className="col-span-1 text-right">
              {w.status !== "CLOSED" ? (
                <button
                  onClick={() => onClose(w.id)}
                  disabled={loading}
                  className="text-xs text-slate-300 hover:text-white disabled:opacity-60"
                >
                  Close
                </button>
              ) : null}
            </div>
          </div>
        ))
      ) : (
        <div className="px-4 py-5 text-sm text-slate-300">No waitlist entries.</div>
      )}
    </div>
  );
}