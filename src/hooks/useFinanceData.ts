import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { toast } from "sonner";
import {
  createBaseEntity,
  getEntityTable,
  listActive,
  nowIso,
  softDeleteLocal,
  upsertLocal
} from "@/lib/db/indexedDb";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { enqueueSync } from "@/lib/sync/syncQueue";
import { syncService } from "@/lib/sync/syncService";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import { useOfflineQuery } from "@/hooks/useOfflineQuery";
import type {
  BaseEntity,
  BudgetRecord,
  CategoryRecord,
  DashboardInsight,
  EntityMap,
  EntityName,
  GoalRecord,
  TransactionRecord,
  WalletRecord
} from "@/types";

type EntityInput<T extends BaseEntity> = Omit<
  T,
  | "id"
  | "user_id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "sync_status"
  | "local_updated_at"
  | "server_updated_at"
  | "server_snapshot"
>;

const queryKeys = {
  transactions: (userId: string) => ["transactions", userId] as const,
  categories: (userId: string) => ["categories", userId] as const,
  wallets: (userId: string) => ["wallets", userId] as const,
  budgets: (userId: string) => ["budgets", userId] as const,
  goals: (userId: string) => ["goals", userId] as const
};

async function triggerSync(userId: string) {
  if (isSupabaseConfigured && (typeof navigator === "undefined" || navigator.onLine)) {
    syncService.scheduleSync(userId, "mutation");
  }
}

async function createRecord<T extends EntityName>(
  entity: T,
  userId: string,
  values: EntityInput<EntityMap[T]>
) {
  const record = {
    ...createBaseEntity(userId),
    ...values
  } as EntityMap[T];
  await upsertLocal(entity, record);
  await enqueueSync(entity, record.id, "create", record);
  await triggerSync(userId);
  return record;
}

async function updateRecord<T extends EntityName>(entity: T, id: string, patch: Partial<EntityInput<EntityMap[T]>>) {
  const table = getEntityTable(entity);
  const existing = await table.get(id);
  if (!existing) throw new Error("Data tidak ditemukan di perangkat ini.");

  const timestamp = nowIso();
  const nextRecord = {
    ...existing,
    ...patch,
    updated_at: timestamp,
    local_updated_at: timestamp,
    sync_status: existing.sync_status === "pending_create" ? "pending_create" : "pending_update"
  } as EntityMap[T];

  await upsertLocal(entity, nextRecord);
  await enqueueSync(entity, id, nextRecord.sync_status === "pending_create" ? "create" : "update", nextRecord);
  await triggerSync(nextRecord.user_id);
  return nextRecord;
}

async function deleteRecord<T extends EntityName>(entity: T, id: string) {
  const record = await softDeleteLocal(entity, id);
  if (!record) throw new Error("Data tidak ditemukan di perangkat ini.");
  await enqueueSync(entity, id, "delete", record);
  await triggerSync(record.user_id);
  return record;
}

export function useEntityResource<T extends EntityName>(entity: T, userId: string | undefined) {
  const queryKey = userId ? queryKeys[entity](userId) : [entity, "anonymous"];
  const queryClient = useQueryClient();

  const query = useOfflineQuery<EntityMap[T][]>({
    queryKey,
    enabled: Boolean(userId),
    localQuery: () => (userId ? listActive(entity, userId) : Promise.resolve([])),
    onlineSync: () => (userId ? syncService.syncNow(userId, "app_start") : Promise.resolve())
  });

  const createMutation = useOfflineMutation<EntityInput<EntityMap[T]>, EntityMap[T]>({
    mutationFn: (values) => {
      if (!userId) throw new Error("Kamu perlu masuk dulu.");
      return createRecord(entity, userId, values);
    },
    invalidate: [queryKey],
    successMessage: "Tersimpan. Kalau offline, nanti disinkronkan otomatis."
  });

  const updateMutation = useOfflineMutation<{ id: string; values: Partial<EntityInput<EntityMap[T]>> }, EntityMap[T]>({
    mutationFn: ({ id, values }) => updateRecord(entity, id, values),
    invalidate: [queryKey],
    successMessage: "Perubahan tersimpan."
  });

  const deleteMutation = useOfflineMutation<string, EntityMap[T]>({
    mutationFn: (id) => deleteRecord(entity, id),
    invalidate: [queryKey],
    successMessage: "Data dihapus dari tampilan."
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey });
  }

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    refresh
  };
}

export function useFinanceData(userId: string | undefined) {
  const transactions = useEntityResource("transactions", userId);
  const categories = useEntityResource("categories", userId);
  const wallets = useEntityResource("wallets", userId);
  const budgets = useEntityResource("budgets", userId);
  const goals = useEntityResource("goals", userId);

  const summary = useMemo(() => {
    const nowMonth = format(new Date(), "yyyy-MM");
    const currentMonthTransactions = transactions.items.filter((item) => item.date.startsWith(nowMonth));
    const monthlyIncome = currentMonthTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const monthlyExpense = currentMonthTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = transactions.items
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = transactions.items
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    const openingBalance = wallets.items.reduce((sum, wallet) => sum + wallet.initial_balance, 0);
    const balance = openingBalance + totalIncome - totalExpense;

    const chart = Array.from({ length: 6 }).map((_, index) => {
      const date = subMonths(new Date(), 5 - index);
      const key = format(date, "yyyy-MM");
      const label = format(date, "MMM");
      const monthTransactions = transactions.items.filter((item) => item.date.startsWith(key));
      return {
        month: label,
        pemasukan: monthTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
        pengeluaran: monthTransactions
          .filter((item) => item.type === "expense")
          .reduce((sum, item) => sum + item.amount, 0)
      };
    });

    const expenseByCategory = categories.items.map((category) => ({
      name: category.name,
      color: category.color,
      value: transactions.items
        .filter((transaction) => transaction.type === "expense" && transaction.category_id === category.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    }));

    const budgetProgress = budgets.items.map((budget) => {
      const used = transactions.items
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.category_id === budget.category_id &&
            transaction.date.startsWith(budget.month)
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return {
        ...budget,
        used,
        percent: budget.amount > 0 ? Math.min(140, Math.round((used / budget.amount) * 100)) : 0
      };
    });

    const insights: DashboardInsight[] = [];
    if (monthlyIncome > monthlyExpense) {
      insights.push({
        title: "Arus kas bulan ini positif",
        body: "Pemasukanmu masih lebih besar dari pengeluaran. Sisihkan sebagian ke target tabungan.",
        tone: "good"
      });
    } else if (monthlyExpense > 0) {
      insights.push({
        title: "Pengeluaran lebih tinggi",
        body: "Cek kategori terbesar dan pasang budget kecil untuk minggu ini.",
        tone: "warning"
      });
    } else {
      insights.push({
        title: "Mulai dari catatan pertama",
        body: "Tambah transaksi hari ini supaya CatetIn bisa memberi insight yang lebih personal.",
        tone: "info"
      });
    }

    const overBudget = budgetProgress.find((budget) => budget.percent >= 100);
    if (overBudget) {
      insights.push({
        title: "Ada budget yang melewati limit",
        body: `${overBudget.category_name ?? "Satu kategori"} sudah melewati batas. CatetIn akan tetap menyimpan catatanmu offline.`,
        tone: "warning"
      });
    }

    return {
      balance,
      monthlyIncome,
      monthlyExpense,
      chart,
      expenseByCategory: expenseByCategory.filter((item) => item.value > 0),
      budgetProgress,
      recentTransactions: [...transactions.items]
        .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
        .slice(0, 5),
      insights
    };
  }, [budgets.items, categories.items, transactions.items, wallets.items]);

  function refetchAll() {
    void Promise.all([
      transactions.refresh(),
      categories.refresh(),
      wallets.refresh(),
      budgets.refresh(),
      goals.refresh()
    ]).then(() => toast.success("Data lokal diperbarui."));
  }

  return {
    transactions: transactions as ReturnType<typeof useEntityResource<"transactions">> & { items: TransactionRecord[] },
    categories: categories as ReturnType<typeof useEntityResource<"categories">> & { items: CategoryRecord[] },
    wallets: wallets as ReturnType<typeof useEntityResource<"wallets">> & { items: WalletRecord[] },
    budgets: budgets as ReturnType<typeof useEntityResource<"budgets">> & { items: BudgetRecord[] },
    goals: goals as ReturnType<typeof useEntityResource<"goals">> & { items: GoalRecord[] },
    summary,
    refetchAll
  };
}
