import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import type { CategoryRecord, TransactionType } from "@/types";

interface FilterBarProps {
  search: string;
  type: "all" | TransactionType;
  categoryId: string;
  startDate: string;
  endDate: string;
  categories: CategoryRecord[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: "all" | TransactionType) => void;
  onCategoryChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}

export function FilterBar({
  search,
  type,
  categoryId,
  startDate,
  endDate,
  categories,
  onSearchChange,
  onTypeChange,
  onCategoryChange,
  onStartDateChange,
  onEndDateChange,
  onReset
}: FilterBarProps) {
  return (
    <div className="rounded-lg bg-white p-4 sketch-border-soft">
      <div className="grid gap-3 lg:grid-cols-[1.3fr_.8fr_.8fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari judul, catatan, atau wallet"
            className="pl-9"
          />
        </div>
        <Select value={type} onChange={(event) => onTypeChange(event.target.value as "all" | TransactionType)}>
          <option value="all">Semua tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </Select>
        <Select value={categoryId} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Button variant="outline" onClick={onReset} type="button">
          <X className="h-4 w-4" />
          Reset
        </Button>
      </div>
      <div className="mt-3">
        <DateRangePicker
          start={startDate}
          end={endDate}
          onStartChange={onStartDateChange}
          onEndChange={onEndDateChange}
        />
      </div>
    </div>
  );
}
