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
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { thisMonthKey } from "@/lib/utils";
import type { BudgetRecord, CategoryRecord } from "@/types";

const budgetSchema = z.object({
  category_id: z.string().min(1, "Pilih kategori"),
  amount: z.coerce.number().positive("Nominal budget harus lebih dari 0"),
  month: z.string().min(7, "Periode wajib diisi"),
  alert_threshold: z.coerce.number().min(50).max(100)
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;
type BudgetFormInput = z.input<typeof budgetSchema>;

interface BudgetDialogProps {
  open: boolean;
  budget?: BudgetRecord | null;
  categories: CategoryRecord[];
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
}

function defaults(budget?: BudgetRecord | null): BudgetFormValues {
  return {
    category_id: budget?.category_id ?? "",
    amount: budget?.amount ?? 0,
    month: budget?.month ?? thisMonthKey(),
    alert_threshold: budget?.alert_threshold ?? 80
  };
}

export function BudgetDialog({ open, budget, categories, loading, onOpenChange, onSubmit }: BudgetDialogProps) {
  const form = useForm<BudgetFormInput, unknown, BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: defaults(budget)
  });

  useEffect(() => {
    form.reset(defaults(budget));
  }, [budget, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{budget ? "Edit budget" : "Tambah budget"}</DialogTitle>
          <DialogDescription>Pasang batas bulanan dan CatetIn akan memberi warning mendekati limit.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Kategori" error={form.formState.errors.category_id?.message}>
              <Select {...form.register("category_id")}>
                <option value="">Pilih kategori</option>
                {categories
                  .filter((category) => category.type !== "income")
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </Select>
            </FormField>
            <FormField label="Periode bulanan" error={form.formState.errors.month?.message}>
              <Input type="month" {...form.register("month")} />
            </FormField>
            <FormField label="Nominal budget" error={form.formState.errors.amount?.message}>
              <CurrencyInput {...form.register("amount", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Warning saat (%)" error={form.formState.errors.alert_threshold?.message}>
              <Input type="number" min="50" max="100" {...form.register("alert_threshold", { valueAsNumber: true })} />
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
