import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterBar } from "@/components/shared/FilterBar";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { TransactionDialog, type TransactionFormValues } from "@/components/forms/TransactionDialog";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { TransactionRecord, TransactionType } from "@/types";

interface TransactionsPageProps {
  userId?: string;
  quickAddOpen?: boolean;
  onQuickAddHandled?: () => void;
}

export function TransactionsPage({ userId, quickAddOpen, onQuickAddHandled }: TransactionsPageProps) {
  const { transactions, categories, wallets } = useFinanceData(userId);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "detail">("create");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    if (quickAddOpen && !dialogOpen) {
      setDialogMode("create");
      setSelected(null);
      setDialogOpen(true);
      onQuickAddHandled?.();
    }
  }, [dialogOpen, onQuickAddHandled, quickAddOpen]);

  const filtered = useMemo(() => {
    return transactions.items.filter((transaction) => {
      const category = categories.items.find((item) => item.id === transaction.category_id);
      const wallet = wallets.items.find((item) => item.id === transaction.wallet_id);
      const haystack = `${transaction.title} ${transaction.notes ?? ""} ${category?.name ?? ""} ${wallet?.name ?? ""}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) return false;
      if (type !== "all" && transaction.type !== type) return false;
      if (categoryId && transaction.category_id !== categoryId) return false;
      if (startDate && transaction.date < startDate) return false;
      if (endDate && transaction.date > endDate) return false;
      return true;
    });
  }, [categories.items, categoryId, endDate, search, startDate, transactions.items, type, wallets.items]);

  async function save(values: TransactionFormValues) {
    const category = categories.items.find((item) => item.id === values.category_id);
    const wallet = wallets.items.find((item) => item.id === values.wallet_id);
    const payload = {
      ...values,
      category_id: values.category_id || null,
      category_name: category?.name ?? null,
      wallet_id: values.wallet_id || null,
      wallet_name: wallet?.name ?? null,
      notes: values.notes || null,
      receipt_url: values.receipt_url || null
    };
    if (dialogMode === "edit" && selected) {
      await transactions.update({ id: selected.id, values: payload });
    } else {
      await transactions.create(payload);
    }
    setDialogOpen(false);
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl font-extrabold">Transaksi</h2>
          <p className="text-sm font-medium text-muted-foreground">Tambah, edit, hapus, filter, dan cari transaksi.</p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setDialogMode("create");
            setDialogOpen(true);
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah transaksi
        </Button>
      </div>

      <FilterBar
        search={search}
        type={type}
        categoryId={categoryId}
        startDate={startDate}
        endDate={endDate}
        categories={categories.items}
        onSearchChange={setSearch}
        onTypeChange={setType}
        onCategoryChange={setCategoryId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={() => {
          setSearch("");
          setType("all");
          setCategoryId("");
          setStartDate("");
          setEndDate("");
        }}
      />

      {filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              category={categories.items.find((category) => category.id === transaction.category_id)}
              wallet={wallets.items.find((wallet) => wallet.id === transaction.wallet_id)}
              onDetail={() => {
                setSelected(transaction);
                setDialogMode("detail");
                setDialogOpen(true);
              }}
              onEdit={() => {
                setSelected(transaction);
                setDialogMode("edit");
                setDialogOpen(true);
              }}
              onDelete={() => setDeleteTarget(transaction)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Transaksi belum ada"
          description="Catat pemasukan atau pengeluaran pertama. Semua perubahan tetap aman meski offline."
          action={
            <Button onClick={() => setDialogOpen(true)} type="button">
              <Plus className="h-4 w-4" />
              Tambah transaksi
            </Button>
          }
        />
      )}

      <TransactionDialog
        open={dialogOpen}
        mode={dialogMode}
        transaction={selected}
        categories={categories.items}
        wallets={wallets.items}
        loading={transactions.isMutating}
        onOpenChange={setDialogOpen}
        onSubmit={save}
        onSwitchToEdit={() => setDialogMode("edit")}
      />
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Hapus transaksi?"
        description="Transaksi akan disembunyikan dulu, lalu dihapus permanen lokal setelah sync delete berhasil."
        loading={transactions.isMutating}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void transactions.remove(deleteTarget.id).then(() => setDeleteTarget(null));
          }
        }}
      />
    </div>
  );
}
