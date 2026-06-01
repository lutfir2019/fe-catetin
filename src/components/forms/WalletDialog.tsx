import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { iconOptions, pastelColors } from "@/data/defaults";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import type { WalletRecord } from "@/types";

const walletSchema = z.object({
  name: z.string().min(2, "Nama wallet minimal 2 karakter"),
  initial_balance: z.coerce.number().min(0, "Saldo awal tidak boleh minus"),
  icon: z.string().min(1),
  color: z.string().min(1)
});

export type WalletFormValues = z.infer<typeof walletSchema>;
type WalletFormInput = z.input<typeof walletSchema>;

interface WalletDialogProps {
  open: boolean;
  wallet?: WalletRecord | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WalletFormValues) => Promise<void>;
}

function defaults(wallet?: WalletRecord | null): WalletFormValues {
  return {
    name: wallet?.name ?? "",
    initial_balance: wallet?.initial_balance ?? 0,
    icon: wallet?.icon ?? "WalletCards",
    color: wallet?.color ?? pastelColors[1]
  };
}

export function WalletDialog({ open, wallet, loading, onOpenChange, onSubmit }: WalletDialogProps) {
  const form = useForm<WalletFormInput, unknown, WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: defaults(wallet)
  });

  useEffect(() => {
    form.reset(defaults(wallet));
  }, [form, open, wallet]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{wallet ? "Edit wallet" : "Tambah wallet"}</DialogTitle>
          <DialogDescription>Kelola cash, bank, e-wallet, atau kartu kredit dalam satu tempat.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nama wallet" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Contoh: Bank utama" />
            </FormField>
            <FormField label="Saldo awal" error={form.formState.errors.initial_balance?.message}>
              <CurrencyInput {...form.register("initial_balance", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Icon">
              <Select {...form.register("icon")}>
                {iconOptions.map((icon) => (
                  <option value={icon} key={icon}>
                    {icon}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Warna">
              <div className="flex flex-wrap gap-2">
                {pastelColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-9 w-9 rounded-full border-2 border-foreground"
                    style={{ backgroundColor: color }}
                    onClick={() => form.setValue("color", color)}
                    aria-label={`Pilih warna ${color}`}
                  />
                ))}
                <Input className="w-28" {...form.register("color")} />
              </div>
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
