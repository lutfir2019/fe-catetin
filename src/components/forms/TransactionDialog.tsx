import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import type { CategoryRecord, TransactionRecord, WalletRecord } from "@/types";

const transactionSchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter"),
  amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  category_id: z.string().optional(),
  wallet_id: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().optional(),
  receipt_url: z.string().optional(),
  recurring_interval: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  is_pinned: z.boolean().default(false)
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
type TransactionFormInput = z.input<typeof transactionSchema>;

interface TransactionDialogProps {
  open: boolean;
  mode: "create" | "edit" | "detail";
  transaction?: TransactionRecord | null;
  categories: CategoryRecord[];
  wallets: WalletRecord[];
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onSwitchToEdit?: () => void;
}

function defaultValues(transaction?: TransactionRecord | null): TransactionFormValues {
  return {
    title: transaction?.title ?? "",
    amount: transaction?.amount ?? 0,
    type: transaction?.type ?? "expense",
    category_id: transaction?.category_id ?? "",
    wallet_id: transaction?.wallet_id ?? "",
    date: transaction?.date ?? new Date().toISOString().slice(0, 10),
    notes: transaction?.notes ?? "",
    receipt_url: transaction?.receipt_url ?? "",
    recurring_interval: transaction?.recurring_interval ?? "none",
    is_pinned: transaction?.is_pinned ?? false
  };
}

export function TransactionDialog({
  open,
  mode,
  transaction,
  categories,
  wallets,
  loading,
  onOpenChange,
  onSubmit,
  onSwitchToEdit
}: TransactionDialogProps) {
  const readonly = mode === "detail";
  const form = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues(transaction)
  });

  useEffect(() => {
    form.reset(defaultValues(transaction));
  }, [form, transaction, open]);

  async function handleSubmit(values: TransactionFormValues) {
    await onSubmit(values);
    form.reset(defaultValues(null));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah transaksi" : mode === "edit" ? "Edit transaksi" : "Detail transaksi"}
          </DialogTitle>
          <DialogDescription>
            Data akan disinkronkan otomatis saat internet kembali. Kamu bisa tetap mencatat saat offline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Judul" error={form.formState.errors.title?.message}>
              <Input readOnly={readonly} {...form.register("title")} placeholder="Contoh: Kopi pagi" />
            </FormField>
            <FormField label="Jumlah" error={form.formState.errors.amount?.message}>
              <CurrencyInput readOnly={readonly} {...form.register("amount", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Tipe">
              <Select disabled={readonly} {...form.register("type")}>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </Select>
            </FormField>
            <FormField label="Tanggal" error={form.formState.errors.date?.message}>
              <Input readOnly={readonly} type="date" {...form.register("date")} />
            </FormField>
            <FormField label="Kategori">
              <Select disabled={readonly} {...form.register("category_id")}>
                <option value="">Tanpa kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Wallet/Akun">
              <Select disabled={readonly} {...form.register("wallet_id")}>
                <option value="">Tanpa wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Transaksi berulang">
              <Select disabled={readonly} {...form.register("recurring_interval")}>
                <option value="none">Tidak berulang</option>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </Select>
            </FormField>
            <FormField label="Lampiran struk opsional">
              <Input
                disabled={readonly}
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => form.setValue("receipt_url", event.target.files?.[0]?.name ?? "")}
              />
            </FormField>
          </div>
          <FormField label="Catatan">
            <Textarea readOnly={readonly} {...form.register("notes")} placeholder="Catatan kecil biar ingat konteksnya" />
          </FormField>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input disabled={readonly} type="checkbox" className="h-5 w-5" {...form.register("is_pinned")} />
            Pin transaksi penting
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
            {readonly ? (
              <Button type="button" onClick={onSwitchToEdit}>
                Edit
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
