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
import type { GoalRecord } from "@/types";

const goalSchema = z.object({
  name: z.string().min(2, "Nama goal minimal 2 karakter"),
  target_amount: z.coerce.number().positive("Target harus lebih dari 0"),
  current_amount: z.coerce.number().min(0),
  deadline: z.string().min(1, "Deadline wajib diisi"),
  icon: z.string().min(1),
  color: z.string().min(1)
});

export type GoalFormValues = z.infer<typeof goalSchema>;
type GoalFormInput = z.input<typeof goalSchema>;

interface GoalDialogProps {
  open: boolean;
  goal?: GoalRecord | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GoalFormValues) => Promise<void>;
}

function defaults(goal?: GoalRecord | null): GoalFormValues {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return {
    name: goal?.name ?? "",
    target_amount: goal?.target_amount ?? 0,
    current_amount: goal?.current_amount ?? 0,
    deadline: goal?.deadline ?? nextMonth.toISOString().slice(0, 10),
    icon: goal?.icon ?? "Target",
    color: goal?.color ?? pastelColors[4]
  };
}

export function GoalDialog({ open, goal, loading, onOpenChange, onSubmit }: GoalDialogProps) {
  const form = useForm<GoalFormInput, unknown, GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: defaults(goal)
  });

  useEffect(() => {
    form.reset(defaults(goal));
  }, [form, goal, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? "Edit goal" : "Tambah goal"}</DialogTitle>
          <DialogDescription>Catat target tabungan dengan progress yang mudah dipantau.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nama goal" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Contoh: Dana liburan" />
            </FormField>
            <FormField label="Deadline" error={form.formState.errors.deadline?.message}>
              <Input type="date" {...form.register("deadline")} />
            </FormField>
            <FormField label="Target nominal" error={form.formState.errors.target_amount?.message}>
              <CurrencyInput {...form.register("target_amount", { valueAsNumber: true })} />
            </FormField>
            <FormField label="Nominal terkumpul" error={form.formState.errors.current_amount?.message}>
              <CurrencyInput {...form.register("current_amount", { valueAsNumber: true })} />
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
