"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { PaymentType, Product, Salesperson } from "@/lib/types";

type Props = {
  products: Product[];
  salespeople: Salesperson[];
};

export default function PinForm({ products, salespeople }: Props) {
  const router = useRouter();

  const [salespersonId, setSalespersonId] = useState(salespeople[0]?.id ?? "");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState<number>(1);
  const [paymentType, setPaymentType] = useState<PaymentType>("MPESA");
  const [mpesaReceipt, setMpesaReceipt] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
  const total = (product?.unitPrice ?? 0) * (Number.isFinite(qty) ? qty : 0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!salespersonId || !productId || !qty || qty <= 0) {
      setError("Please select salesperson, product, and quantity > 0");
      return;
    }

    if (paymentType === "CREDIT" && (!customerName.trim() || !customerPhone.trim())) {
      setError("Credit pins require customer name and phone");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          salespersonId,
          productId,
          qty,
          paymentType,
          mpesaReceipt: paymentType === "MPESA" ? mpesaReceipt : undefined,
          customerName: paymentType === "CREDIT" ? customerName : undefined,
          customerPhone: paymentType === "CREDIT" ? customerPhone : undefined,
          dueDate: paymentType === "CREDIT" ? dueDate : undefined,
          notes,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json?.error === "string" ? json.error : "Failed to create pin");
        return;
      }

      router.push("/pins");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pin");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Salesperson</span>
          <select
            value={salespersonId}
            onChange={(e) => setSalespersonId(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          >
            {salespeople.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Product</span>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} - {p.name} (Ksh {p.unitPrice})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Quantity</span>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Payment type</span>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as PaymentType)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          >
            <option value="MPESA">Mpesa</option>
            <option value="CASH">Cash</option>
            <option value="CREDIT">Pay later (Credit)</option>
          </select>
        </label>

        {paymentType === "MPESA" ? (
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Mpesa receipt (optional)</span>
            <input
              value={mpesaReceipt}
              onChange={(e) => setMpesaReceipt(e.target.value)}
              placeholder="e.g. 72AA..."
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
          </label>
        ) : null}

        {paymentType === "CREDIT" ? (
          <>
            <label className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Customer name</span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Customer phone</span>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Due date (optional)</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
            </label>
          </>
        ) : null}

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm uppercase tracking-[0.25em] text-slate-400">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Total</p>
          <p className="text-2xl font-semibold">Ksh {total.toLocaleString()}</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save pin"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}
