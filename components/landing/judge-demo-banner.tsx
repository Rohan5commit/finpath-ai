import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DemoAccount } from "@/lib/types";

export function JudgeDemoBanner({ demoAccounts }: { demoAccounts: DemoAccount[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-6">
      <Card className="glass-card rounded-[2rem] p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <Badge label="Judge mode" variant="amber" />
            <h2 className="mt-4 text-3xl font-semibold text-white">No sign-up. No dead-end demo flow.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              FinPath ships with realistic demo personas so judges can test the product immediately. If live AI is unavailable,
              deterministic fallback outputs keep the full experience intact.
            </p>
          </div>
          <div className="grid w-full gap-4 lg:max-w-3xl lg:grid-cols-3">
            {demoAccounts.map((account) => (
              <div key={account.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">{account.label}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{account.persona}</p>
                <Link
                  href={`/dashboard?demo=${account.id}`}
                  className={buttonClasses({ variant: "secondary", size: "sm", className: "mt-5 w-full" })}
                >
                  Open {account.profile.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
