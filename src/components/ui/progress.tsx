import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full border border-foreground/40 bg-muted", className)}>
      <div
        className={cn("h-full rounded-full bg-success transition-all", indicatorClassName)}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
