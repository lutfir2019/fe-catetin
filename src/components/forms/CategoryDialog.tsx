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
import { Textarea } from "@/components/ui/textarea";
import type { CategoryRecord } from "@/types";

const categorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  type: z.enum(["income", "expense", "both"]),
  icon: z.string().min(1),
  color: z.string().min(1),
  description: z.string().optional(),
  favorite: z.boolean().default(false)
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
type CategoryFormInput = z.input<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  category?: CategoryRecord | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

function defaults(category?: CategoryRecord | null): CategoryFormValues {
  return {
    name: category?.name ?? "",
    type: category?.type ?? "expense",
    icon: category?.icon ?? "WalletCards",
    color: category?.color ?? pastelColors[0],
    description: category?.description ?? "",
    favorite: category?.favorite ?? false
  };
}

export function CategoryDialog({ open, category, loading, onOpenChange, onSubmit }: CategoryDialogProps) {
  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaults(category)
  });

  useEffect(() => {
    form.reset(defaults(category));
  }, [category, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit kategori" : "Tambah kategori"}</DialogTitle>
          <DialogDescription>Kategori membantu laporan dan budget tetap rapi.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nama kategori" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Contoh: Makan siang" />
            </FormField>
            <FormField label="Tipe kategori">
              <Select {...form.register("type")}>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
                <option value="both">Keduanya</option>
              </Select>
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
          <FormField label="Deskripsi opsional">
            <Textarea {...form.register("description")} />
          </FormField>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" className="h-5 w-5" {...form.register("favorite")} />
            Jadikan kategori favorit
          </label>
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
