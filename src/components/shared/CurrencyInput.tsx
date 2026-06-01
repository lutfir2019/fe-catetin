import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

type CurrencyInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>((props, ref) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
      Rp
    </span>
    <Input ref={ref} type="number" min="0" step="1000" className="pl-10 font-number font-bold" {...props} />
  </div>
));
CurrencyInput.displayName = "CurrencyInput";
