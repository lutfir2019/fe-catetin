import type { CategoryRecord, TransactionType, WalletRecord } from "@/types";

export const pastelColors = [
  "#FFB703",
  "#8ECAE6",
  "#90BE6D",
  "#FFAFCC",
  "#BDB2FF",
  "#F28482",
  "#84A59D",
  "#FFD166",
  "#A8DADC"
];

export const defaultCategories: Array<Pick<CategoryRecord, "name" | "type" | "icon" | "color" | "description">> = [
  { name: "Makanan", type: "expense", icon: "Utensils", color: "#F28482", description: "Jajan, makan harian, dan kopi." },
  { name: "Transportasi", type: "expense", icon: "Bus", color: "#8ECAE6", description: "Bensin, parkir, ojek, dan transport umum." },
  { name: "Belanja", type: "expense", icon: "ShoppingBag", color: "#FFAFCC", description: "Kebutuhan rumah dan belanja personal." },
  { name: "Hiburan", type: "expense", icon: "Gamepad2", color: "#BDB2FF", description: "Nonton, langganan, dan hangout." },
  { name: "Tagihan", type: "expense", icon: "ReceiptText", color: "#FFD166", description: "Listrik, internet, cicilan, dan tagihan rutin." },
  { name: "Gaji", type: "income", icon: "WalletCards", color: "#84A59D", description: "Pemasukan utama bulanan." },
  { name: "Freelance", type: "income", icon: "Laptop", color: "#90BE6D", description: "Project sampingan dan honor." },
  { name: "Investasi", type: "income", icon: "TrendingUp", color: "#A8DADC", description: "Dividen, kupon, dan hasil investasi." },
  { name: "Tabungan", type: "both", icon: "PiggyBank", color: "#FFB703", description: "Setoran atau penyesuaian tabungan." }
];

export const defaultWallets: Array<Pick<WalletRecord, "name" | "initial_balance" | "icon" | "color">> = [
  { name: "Cash", initial_balance: 0, icon: "Banknote", color: "#90BE6D" },
  { name: "Bank", initial_balance: 0, icon: "Landmark", color: "#8ECAE6" },
  { name: "E-wallet", initial_balance: 0, icon: "Smartphone", color: "#FFB703" },
  { name: "Kartu Kredit", initial_balance: 0, icon: "CreditCard", color: "#FFAFCC" }
];

export const transactionTypeLabels: Record<TransactionType, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran"
};

export const iconOptions = [
  "WalletCards",
  "PiggyBank",
  "Utensils",
  "Bus",
  "ShoppingBag",
  "Gamepad2",
  "ReceiptText",
  "Laptop",
  "TrendingUp",
  "Banknote",
  "Landmark",
  "Smartphone",
  "CreditCard",
  "Target",
  "Sparkles",
  "House"
];
