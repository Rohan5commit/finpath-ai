import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-6 py-12">
      <Card className="glass-card w-full rounded-[2rem] p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">This page is off the current money map.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The route could not be found, but the product demo is still one click away.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonClasses({ variant: "secondary" })}>
            Back to landing page
          </Link>
          <Link href="/dashboard?demo=jordan-grad" className={buttonClasses({ variant: "primary" })}>
            Launch judge demo
          </Link>
        </div>
      </Card>
    </div>
  );
}
