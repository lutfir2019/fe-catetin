import { useState } from "react";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { BudgetDialog, type BudgetFormValues } from "@/components/forms/BudgetDialog";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { BudgetRecord } from "@/types";

interface BudgetsPageProps {
  userId?: string;
}

export function BudgetsPage({ userId }: BudgetsPageProps) {
  const { budgets, categories, summary } = useFinanceData(userId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<BudgetRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetRecord | null>(null);

  async function save(values: BudgetFormValues) {
    const category = categories.items.find((item) => item.id === values.category_id);
    const payload = {
      ...values,
      category_name: category?.name ?? null
    };
    if (selected) {
      await budgets.update({ id: selected.id, values: payload });
    } else {
      await budgets.create(payload);
    }
    setDialogOpen(false);
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl font-extrabold">Budget</h2>
          <p className="text-sm font-medium text-muted-foreground">Warning mendekati limit dan alert saat melewati batas.</p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setDialogOpen(true);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah budget
        </Button>
      </div>

      {summary.budgetProgress.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {summary.budgetProgress.map((budget) => (
            <article key={budget.id} className="rounded-lg bg-white p-4 sketch-border-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl font-bold">{budget.category_name ?? "Budget"}</h3>
                  <p className="text-sm font-semibold text-muted-foreground">{monthLabel(budget.month)}</p>
                </div>
                {budget.percent >= 100 ? (
                  <Badge className="bg-expense/20">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Lewat limit
                  </Badge>
                ) : budget.percent >= budget.alert_threshold ? (
                  <Badge className="bg-primary/30">Mendekati limit</Badge>
                ) : (
                  <Badge className="bg-success/25">Aman</Badge>
                )}
              </div>
              <div className="mt-4">
                <Progress
                  value={budget.percent}
                  indicatorClassName={budget.percent >= 100 ? "bg-expense" : budget.percent >= budget.alert_threshold ? "bg-primary" : "bg-success"}
                />
                <div className="mt-2 flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>{formatCurrency(budget.used)}</span>
                  <span>{formatCurrency(budget.amount)}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelected(budget);
                    setDialogOpen(true);
                  }}
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(budget)} type="button">
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Budget belum dibuat" description="Pilih kategori pengeluaran dan pasang limit bulanan." />
      )}

      <BudgetDialog
        open={dialogOpen}
        budget={selected}
        categories={categories.items}
        loading={budgets.isMutating}
        onOpenChange={setDialogOpen}
        onSubmit={save}
      />
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Hapus budget?"
        description="Budget akan soft delete dan disinkronkan saat online."
        loading={budgets.isMutating}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void budgets.remove(deleteTarget.id).then(() => setDeleteTarget(null));
          }
        }}
      />
    </div>
  );
}
