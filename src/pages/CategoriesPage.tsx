import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { CategoryDialog, type CategoryFormValues } from "@/components/forms/CategoryDialog";
import { IconByName } from "@/components/shared/IconByName";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { CategoryRecord } from "@/types";

interface CategoriesPageProps {
  userId?: string;
}

export function CategoriesPage({ userId }: CategoriesPageProps) {
  const { categories } = useFinanceData(userId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<CategoryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);

  async function save(values: CategoryFormValues) {
    if (selected) {
      await categories.update({ id: selected.id, values });
    } else {
      await categories.create(values);
    }
    setDialogOpen(false);
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl font-extrabold">Kategori</h2>
          <p className="text-sm font-medium text-muted-foreground">Default tersedia, tapi kamu bebas bikin versi personal.</p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setDialogOpen(true);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah kategori
        </Button>
      </div>

      {categories.items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.items.map((category) => (
            <article key={category.id} className="rounded-lg bg-white p-4 sketch-border-soft">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-foreground"
                  style={{ backgroundColor: category.color }}
                >
                  <IconByName name={category.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-heading text-xl font-bold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description || "Tanpa deskripsi"}</p>
                    </div>
                    {category.favorite ? <Star className="h-5 w-5 fill-primary text-foreground" /> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-secondary/35">{category.type}</Badge>
                    {category.sync_status !== "synced" ? <Badge className="bg-primary/30">{category.sync_status}</Badge> : null}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(category);
                        setDialogOpen(true);
                      }}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                      Detail/Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(category)} type="button">
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Kategori kosong" description="Tambahkan kategori agar laporan pengeluaran lebih mudah dibaca." />
      )}

      <CategoryDialog
        open={dialogOpen}
        category={selected}
        loading={categories.isMutating}
        onOpenChange={setDialogOpen}
        onSubmit={save}
      />
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Hapus kategori?"
        description="Kategori akan soft delete dan disinkronkan saat online."
        loading={categories.isMutating}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void categories.remove(deleteTarget.id).then(() => setDeleteTarget(null));
          }
        }}
      />
    </div>
  );
}
