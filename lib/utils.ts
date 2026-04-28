import type { LifeStage, Severity } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function safeNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatMonthLabel(dateInput: string) {
  const normalized = /\d{4}-\d{2}$/.test(dateInput) ? `${dateInput}-01` : dateInput;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function monthsUntil(dateInput: string) {
  const normalized = /\d{4}-\d{2}$/.test(dateInput) ? `${dateInput}-01` : dateInput;
  const target = new Date(normalized);
  if (Number.isNaN(target.getTime())) {
    return 1;
  }
  const now = new Date();
  const diffMonths =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  return Math.max(1, diffMonths + 1);
}

export function addMonthsToDate(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function formatFutureMonth(monthsAhead: number) {
  return formatMonthLabel(addMonthsToDate(new Date(), monthsAhead).toISOString());
}

export function stageLabel(stage: LifeStage) {
  const labels: Record<LifeStage, string> = {
    student: "Student",
    intern: "Intern",
    "early-career": "Early career",
    "career-switcher": "Career switcher",
  };
  return labels[stage];
}

export function severityClasses(severity: Severity) {
  switch (severity) {
    case "high":
      return "border-rose-400/30 bg-rose-500/10 text-rose-100";
    case "medium":
      return "border-amber-400/30 bg-amber-500/10 text-amber-50";
    default:
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-50";
  }
}
