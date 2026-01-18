import { redirect } from "next/navigation";

import TeamClient from "./TeamClient";
import { getAllSalespersonProfiles } from "@/lib/store.server";
import { getCurrentUserServer, isBoss } from "@/lib/auth.server";

export default async function TeamPage() {
  const user = await getCurrentUserServer();
  if (!user || !isBoss(user)) redirect("/");

  const profiles = await getAllSalespersonProfiles();
  return <TeamClient initial={profiles} />;
}
