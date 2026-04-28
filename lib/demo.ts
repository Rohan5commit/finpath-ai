import demoAccounts from "@/data/demo-accounts.json";
import { buildHeuristicAnalysis } from "@/lib/finance";
import type { Analysis, DemoAccount } from "@/lib/types";

export type DemoSeed = DemoAccount & { analysis: Analysis };

export const demoProfiles = demoAccounts as DemoAccount[];

export const demoSeeds: DemoSeed[] = demoProfiles.map((account) => ({
  ...account,
  analysis: buildHeuristicAnalysis(account.profile),
}));

export function getDemoSeed(id: string) {
  return demoSeeds.find((account) => account.id === id) ?? demoSeeds[0];
}

export function getDemoAccount(id: string) {
  const { analysis, ...account } = getDemoSeed(id);
  return account;
}
