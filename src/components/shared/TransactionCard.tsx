import { CalendarDays, FileText, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconByName } from "@/components/shared/IconByName";
import { cn, formatCurrency, formatShortDate } from "@/lib/utils";
import type { CategoryRecord, TransactionRecord, WalletRecord } from "@/types";

interface TransactionCardProps {
  transaction: TransactionRecord;
  category?: CategoryRecord;
  wallet?: WalletRecord;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionCard({ transaction, category, wallet, onDetail, onEdit, onDelete }: TransactionCardProps) {
  const income = transaction.type === "income";
  return (
    <article className="rounded-lg bg-white p-4 sketch-border-soft">
      <div className="flex gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-foreground"
          style={{ backgroundColor: category?.color ?? (income ? "#84A59D" : "#F28482") }}
        >
          <IconByName name={category?.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <button className="min-w-0 text-left" onClick={onDetail} type="button">
              <h3 className="truncate font-heading text-xl font-bold">{transaction.title}</h3>
              <p className="text-xs font-medium text-muted-foreground">
                {category?.name ?? "Tanpa kategori"} - {wallet?.name ?? "Tanpa wallet"}
              </p>
            </button>
            <p className={cn("font-number text-lg font-extrabold", income ? "text-income" : "text-expense")}>
              {income ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge>
              <CalendarDays className="h-3.5 w-3.5" />
              {formatShortDate(transaction.date)}
            </Badge>
            {transaction.receipt_url ? (
              <Badge>
                <FileText className="h-3.5 w-3.5" />
                Struk
              </Badge>
            ) : null}
            <Badge className={income ? "bg-income/25" : "bg-expense/25"}>{income ? "Pemasukan" : "Pengeluaran"}</Badge>
            {transaction.sync_status !== "synced" ? <Badge className="bg-primary/30">{transaction.sync_status}</Badge> : null}
          </div>
          {transaction.notes ? <p className="mt-3 text-sm text-muted-foreground">{transaction.notes}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button size="icon" variant="outline" onClick={onEdit} aria-label="Edit transaksi">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="danger" onClick={onDelete} aria-label="Hapus transaksi">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
