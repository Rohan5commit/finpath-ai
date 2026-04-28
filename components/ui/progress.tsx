import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "emerald",
}: {
  value: number;
  className?: string;
  tone?: "emerald" | "blue" | "amber" | "rose";
}) {
  const colors = {
    emerald: "from-emerald-400 to-emerald-300",
    blue: "from-sky-400 to-cyan-300",
    amber: "from-amber-400 to-yellow-300",
    rose: "from-rose-400 to-pink-300",
  } as const;

  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all", colors[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
