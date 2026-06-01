import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { WalletDialog, type WalletFormValues } from "@/components/forms/WalletDialog";
import { IconByName } from "@/components/shared/IconByName";
import { formatCurrency } from "@/lib/utils";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { WalletRecord } from "@/types";

interface WalletsPageProps {
  userId?: string;
}

export function WalletsPage({ userId }: WalletsPageProps) {
  const { wallets, transactions } = useFinanceData(userId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<WalletRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WalletRecord | null>(null);

  async function save(values: WalletFormValues) {
    if (selected) {
      await wallets.update({ id: selected.id, values });
    } else {
      await wallets.create(values);
    }
    setDialogOpen(false);
    setSelected(null);
  }

  function currentBalance(wallet: WalletRecord) {
    return (
      wallet.initial_balance +
      transactions.items
        .filter((transaction) => transaction.wallet_id === wallet.id)
        .reduce((sum, transaction) => sum + (transaction.type === "income" ? transaction.amount : -transaction.amount), 0)
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl font-extrabold">Wallet / Akun</h2>
          <p className="text-sm font-medium text-muted-foreground">Multi-wallet untuk cash, bank, e-wallet, dan kartu kredit.</p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setDialogOpen(true);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah wallet
        </Button>
      </div>

      {wallets.items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {wallets.items.map((wallet) => (
            <article key={wallet.id} className="rounded-lg bg-white p-4 sketch-border-soft">
              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-foreground"
                  style={{ backgroundColor: wallet.color }}
                >
                  <IconByName name={wallet.icon} className="h-5 w-5" />
                </span>
                {wallet.sync_status !== "synced" ? <Badge className="bg-primary/30">{wallet.sync_status}</Badge> : null}
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold">{wallet.name}</h3>
              <p className="font-number text-2xl font-extrabold">{formatCurrency(currentBalance(wallet))}</p>
              <p className="text-xs font-semibold text-muted-foreground">Saldo awal {formatCurrency(wallet.initial_balance)}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelected(wallet);
                    setDialogOpen(true);
                  }}
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(wallet)} type="button">
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Wallet kosong" description="Tambahkan cash, bank, e-wallet, atau kartu kredit yang kamu pakai." />
      )}

      <WalletDialog open={dialogOpen} wallet={selected} loading={wallets.isMutating} onOpenChange={setDialogOpen} onSubmit={save} />
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Hapus wallet?"
        description="Wallet akan disembunyikan dan masuk antrean sync delete."
        loading={wallets.isMutating}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void wallets.remove(deleteTarget.id).then(() => setDeleteTarget(null));
          }
        }}
      />
    </div>
  );
}
