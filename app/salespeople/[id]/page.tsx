import { notFound } from "next/navigation";

import SalespersonProfileClient from "./SalespersonProfileClient";
import { getSalespersonProfile } from "@/lib/store.server";

export default async function SalespersonProfilePage({ params }: { params: { id: string } }) {
  try {
    const profile = await getSalespersonProfile(params.id);
    // Ensure missing properties are included with sensible defaults or computed values
    // Add the missing computed/composed fields instead of reading possibly-missing properties
    const withRequiredFields = {
      ...profile, 
      commissionOwed:
        typeof (profile as any).commissionOwed === "number"
          ? (profile as any).commissionOwed
          : (profile.commissionEarned ?? 0),
      stockReceivedToday:
        typeof (profile as any).stockReceivedToday === "number"
          ? (profile as any).stockReceivedToday
          : (Array.isArray(profile.stockAllocations)
              ? profile.stockAllocations.reduce(
                  (sum, a) => sum + (a?.totalReceivedToday ?? 0),
                  0
                )
              : 0),
    };
    return <SalespersonProfileClient initial={withRequiredFields} />;
  } catch {
    notFound();
  }
}
