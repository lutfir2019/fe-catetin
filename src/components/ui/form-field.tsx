import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <span className="text-xs font-semibold text-expense">{error}</span> : null}
    </label>
  );
}
