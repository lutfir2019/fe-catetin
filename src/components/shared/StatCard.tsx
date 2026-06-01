import type { LucideIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "primary" | "income" | "expense" | "secondary";
  caption?: string;
}

const tones = {
  primary: "bg-primary",
  income: "bg-income",
  expense: "bg-expense",
  secondary: "bg-secondary"
};

export function StatCard({ label, value, icon: Icon, tone = "primary", caption }: StatCardProps) {
  return (
    <section className="rounded-lg bg-white p-4 sketch-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="mt-1 font-number text-2xl font-extrabold">{formatCurrency(value)}</p>
        </div>
        <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 border-foreground", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {caption ? <p className="mt-3 text-xs font-medium text-muted-foreground">{caption}</p> : null}
    </section>
  );
}
