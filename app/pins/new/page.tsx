import Link from "next/link";

import PinForm from "./PinForm";
import { listProducts, listSalespeople } from "@/lib/store.server";

export default async function NewPinPage() {
  const [products, salespeople] = await Promise.all([listProducts(), listSalespeople()]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Log a new pin</h1>
            <Link href="/" className="text-sm text-emerald-300 hover:text-emerald-200">
              Back to dashboard
            </Link>
          </div>
          <p className="text-slate-300">
            Pick salesperson, product, quantity, and payment type. Credit captures pay-later details.
          </p>
        </header>

        <PinForm products={products} salespeople={salespeople} />

        <div className="flex justify-between">
          <Link href="/pins" className="text-sm text-slate-300 hover:text-white">
            View all pins
          </Link>
          <Link href="/reconciliation" className="text-sm text-slate-300 hover:text-white">
            Go to reconciliation
          </Link>
        </div>
      </main>
    </div>
  );
}
