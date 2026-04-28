import { cn } from "@/lib/utils";

export function Badge({
  label,
  variant = "emerald",
  className,
}: {
  label: string;
  variant?: "emerald" | "amber" | "blue" | "rose";
  className?: string;
}) {
  const variants = {
    emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-50",
    blue: "border-sky-400/30 bg-sky-500/10 text-sky-100",
    rose: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]",
        variants[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
