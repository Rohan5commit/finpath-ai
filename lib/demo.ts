import demoAccounts from "@/data/demo-accounts.json";
import type { DemoAccount } from "@/lib/types";

export const demoProfiles = demoAccounts as DemoAccount[];

export function getDemoAccount(id: string) {
  return demoProfiles.find((account) => account.id === id) ?? demoProfiles[0];
}
