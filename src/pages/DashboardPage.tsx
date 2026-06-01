import { ArrowDownCircle, ArrowUpCircle, PiggyBank, WalletCards } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { TransactionCard } from "@/components/shared/TransactionCard";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { useFinanceData } from "@/hooks/useFinanceData";

interface DashboardPageProps {
  userId?: string;
  onAddTransaction: () => void;
}

export function DashboardPage({ userId, onAddTransaction }: DashboardPageProps) {
  const { transactions, categories, wallets, summary } = useFinanceData(userId);

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-white p-4 sketch-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-3xl font-extrabold">Halo, siap catat uang hari ini?</h2>
            <p className="text-sm font-medium text-muted-foreground">
              Data akan disinkronkan otomatis saat internet kembali.
            </p>
          </div>
          <Badge className="bg-secondary/40">App shell PWA aktif</Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total saldo" value={summary.balance} icon={WalletCards} tone="primary" caption="Saldo awal + pemasukan - pengeluaran" />
        <StatCard label="Pemasukan bulan ini" value={summary.monthlyIncome} icon={ArrowUpCircle} tone="income" />
        <StatCard label="Pengeluaran bulan ini" value={summary.monthlyExpense} icon={ArrowDownCircle} tone="expense" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <ChartCard title="Pemasukan vs pengeluaran">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.chart}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E7DCCF" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}jt`} width={44} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="pemasukan" fill="#84A59D" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="#F28482" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-lg bg-white p-4 sketch-border">
          <h3 className="font-heading text-xl font-bold">Insight otomatis</h3>
          <div className="mt-3 space-y-3">
            {summary.insights.map((insight) => (
              <div key={insight.title} className="rounded-lg border-2 border-foreground bg-background p-3">
                <Badge className={insight.tone === "warning" ? "bg-expense/20" : insight.tone === "good" ? "bg-success/25" : "bg-secondary/35"}>
                  {insight.tone}
                </Badge>
                <p className="mt-2 font-heading text-lg font-bold">{insight.title}</p>
                <p className="text-sm text-muted-foreground">{insight.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4 sketch-border">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">Transaksi terbaru</h3>
            <Badge>{transactions.items.length} catatan</Badge>
          </div>
          {summary.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {summary.recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  category={categories.items.find((category) => category.id === transaction.category_id)}
                  wallet={wallets.items.find((wallet) => wallet.id === transaction.wallet_id)}
                  onDetail={() => undefined}
                  onEdit={onAddTransaction}
                  onDelete={() => undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Belum ada transaksi" description="Mulai dari satu catatan kecil. CatetIn akan merapikan sisanya." />
          )}
        </div>

        <div className="rounded-lg bg-white p-4 sketch-border">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">Budget progress</h3>
            <PiggyBank className="h-5 w-5" />
          </div>
          {summary.budgetProgress.length > 0 ? (
            <div className="space-y-4">
              {summary.budgetProgress.map((budget) => (
                <div key={budget.id} className="rounded-lg border-2 border-foreground bg-background p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-heading text-lg font-bold">{budget.category_name ?? "Budget"}</p>
                      <p className="text-xs font-semibold text-muted-foreground">{monthLabel(budget.month)}</p>
                    </div>
                    <p className="font-number font-extrabold">{budget.percent}%</p>
                  </div>
                  <Progress
                    value={budget.percent}
                    indicatorClassName={budget.percent >= 100 ? "bg-expense" : budget.percent >= budget.alert_threshold ? "bg-primary" : "bg-success"}
                  />
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    {formatCurrency(budget.used)} dari {formatCurrency(budget.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Budget masih kosong" description="Pasang batas bulanan untuk kategori yang paling sering dipakai." />
          )}
        </div>
      </section>
    </div>
  );
}
