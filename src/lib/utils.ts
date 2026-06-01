import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatShortDate(value: string) {
  try {
    return format(parseISO(value), "dd MMM yyyy", { locale: id });
  } catch {
    return value;
  }
}

export function thisMonthKey(date = new Date()) {
  return format(date, "yyyy-MM");
}

export function monthLabel(monthKey: string) {
  try {
    return format(parseISO(`${monthKey}-01`), "MMMM yyyy", { locale: id });
  } catch {
    return monthKey;
  }
}

export function downloadTextFile(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
