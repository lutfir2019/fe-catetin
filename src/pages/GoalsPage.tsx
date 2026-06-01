import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { GoalDialog, type GoalFormValues } from "@/components/forms/GoalDialog";
import { IconByName } from "@/components/shared/IconByName";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { GoalRecord } from "@/types";

interface GoalsPageProps {
  userId?: string;
}

export function GoalsPage({ userId }: GoalsPageProps) {
  const { goals } = useFinanceData(userId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<GoalRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GoalRecord | null>(null);

  async function save(values: GoalFormValues) {
    if (selected) {
      await goals.update({ id: selected.id, values });
    } else {
      await goals.create(values);
    }
    setDialogOpen(false);
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl font-extrabold">Goals / Target Tabungan</h2>
          <p className="text-sm font-medium text-muted-foreground">Target nominal, progress terkumpul, dan deadline.</p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setDialogOpen(true);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah goal
        </Button>
      </div>

      {goals.items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {goals.items.map((goal) => {
            const percent = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
            return (
              <article key={goal.id} className="rounded-lg bg-white p-4 sketch-border-soft">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-foreground"
                    style={{ backgroundColor: goal.color }}
                  >
                    <IconByName name={goal.icon} className="h-5 w-5" />
                  </span>
                  <Badge>{formatShortDate(goal.deadline)}</Badge>
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold">{goal.name}</h3>
                <p className="text-sm font-semibold text-muted-foreground">
                  {formatCurrency(goal.current_amount)} dari {formatCurrency(goal.target_amount)}
                </p>
                <div className="mt-3">
                  <Progress value={percent} indicatorClassName={percent >= 100 ? "bg-success" : "bg-purple"} />
                  <p className="mt-1 text-right font-number text-sm font-extrabold">{percent}%</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(goal);
                      setDialogOpen(true);
                    }}
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(goal)} type="button">
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Goal masih kosong" description="Buat target tabungan pertama, lalu update nominal terkumpul secara berkala." />
      )}

      <GoalDialog open={dialogOpen} goal={selected} loading={goals.isMutating} onOpenChange={setDialogOpen} onSubmit={save} />
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Hapus goal?"
        description="Goal akan dihapus dari tampilan dan masuk antrean sync delete."
        loading={goals.isMutating}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void goals.remove(deleteTarget.id).then(() => setDeleteTarget(null));
          }
        }}
      />
    </div>
  );
}
