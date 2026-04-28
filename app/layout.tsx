import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: {
    default: "FinPath AI",
    template: "%s · FinPath AI",
  },
  description:
    "AI-powered financial planning and financial literacy platform for students and young adults.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_22%),radial-gradient(circle_at_right_top,rgba(16,185,129,0.14),transparent_18%)]" />
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-wide text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                  FP
                </span>
                <span>
                  <span className="block text-base">FinPath AI</span>
                  <span className="block text-xs font-normal text-slate-400">Budget clarity for students and young adults</span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <Link href="/dashboard?demo=maya-campus" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                  Try seeded demo
                </Link>
                <Link href="/dashboard" className={buttonClasses({ variant: "primary", size: "sm" })}>
                  Start planning
                </Link>
              </div>
            </div>
          </header>
          <main className="relative z-10">{children}</main>
          <footer className="border-t border-white/10 bg-slate-950/80">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
              <p>FinPath AI is an educational financial planning product — not regulated financial advice.</p>
              <p>Built for Nexforge judging: fast to understand, safe to demo, easy to scale.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
