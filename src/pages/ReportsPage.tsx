import { useMemo, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/ChartCard";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { downloadTextFile, escapeCsv, formatCurrency } from "@/lib/utils";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { TransactionType } from "@/types";

interface ReportsPageProps {
  userId?: string;
}

export function ReportsPage({ userId }: ReportsPageProps) {
  const { transactions, categories, wallets, summary } = useFinanceData(userId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.items.filter((transaction) => {
      if (startDate && transaction.date < startDate) return false;
      if (endDate && transaction.date > endDate) return false;
      return true;
    });
  }, [endDate, startDate, transactions.items]);

  function exportCsv() {
    const header = ["title", "amount", "type", "category", "date", "notes", "wallet"];
    const rows = filteredTransactions.map((transaction) => [
      transaction.title,
      transaction.amount,
      transaction.type,
      categories.items.find((category) => category.id === transaction.category_id)?.name ?? "",
      transaction.date,
      transaction.notes ?? "",
      wallets.items.find((wallet) => wallet.id === transaction.wallet_id)?.name ?? ""
    ]);
    const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    downloadTextFile(`catetin-transaksi-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const [, ...rows] = lines;
    let imported = 0;

    for (const row of rows) {
      const columns = row.match(/("([^"]|"")*"|[^,]+)/g)?.map((value) => value.replace(/^"|"$/g, "").replaceAll('""', '"')) ?? [];
      const [title, amount, type, categoryName, date, notes, walletName] = columns;
      if (!title || !amount || (type !== "income" && type !== "expense")) continue;
      const category = categories.items.find((item) => item.name.toLowerCase() === categoryName?.toLowerCase());
      const wallet = wallets.items.find((item) => item.name.toLowerCase() === walletName?.toLowerCase());
      await transactions.create({
        title,
        amount: Number(amount),
        type: type as TransactionType,
        category_id: category?.id ?? null,
        category_name: category?.name ?? categoryName ?? null,
        wallet_id: wallet?.id ?? null,
        wallet_name: wallet?.name ?? walletName ?? null,
        date: date || new Date().toISOString().slice(0, 10),
        notes: notes || null,
        receipt_url: null,
        is_pinned: false,
        recurring_interval: "none"
      });
      imported += 1;
    }

    toast.success(`${imported} transaksi diimpor ke penyimpanan lokal.`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl font-extrabold">Laporan</h2>
          <p className="text-sm font-medium text-muted-foreground">Grafik bulanan, kategori pengeluaran, trend, export, dan import CSV.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv} type="button">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} type="button">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importCsv(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 sketch-border-soft">
        <DateRangePicker start={startDate} end={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Grafik bulanan">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summary.chart}>
              <defs>
                <linearGradient id="income" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#84A59D" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#84A59D" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="expense" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#F28482" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#F28482" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#E7DCCF" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}jt`} width={44} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="pemasukan" stroke="#84A59D" fill="url(#income)" strokeWidth={3} />
              <Area type="monotone" dataKey="pengeluaran" stroke="#F28482" fill="url(#expense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Kategori pengeluaran">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.expenseByCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={92}
                paddingAngle={4}
              >
                {summary.expenseByCategory.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#2D2D2D" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-lg bg-white p-4 sketch-border">
        <h3 className="font-heading text-xl font-bold">Ringkasan periode</h3>
        <p className="mt-1 text-sm text-muted-foreground">{filteredTransactions.length} transaksi dalam filter saat ini.</p>
      </div>
    </div>
  );
}
