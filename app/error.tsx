"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-6 py-12">
      <Card className="glass-card w-full rounded-[2rem] p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-200/80">FinPath recovery mode</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Something interrupted the planning flow.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The app caught the error safely. You can retry immediately or jump back to a seeded demo account.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button className={buttonClasses({ variant: "primary" })} onClick={() => reset()}>
            Retry page
          </button>
          <Link href="/dashboard?demo=maya-campus" className={buttonClasses({ variant: "secondary" })}>
            Open seeded demo
          </Link>
        </div>
      </Card>
    </div>
  );
}
