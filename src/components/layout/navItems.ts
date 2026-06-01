import {
  BarChart3,
  FolderKanban,
  Gauge,
  PieChart,
  ReceiptText,
  Settings,
  Target,
  WalletCards
} from "lucide-react";
import type { NavPage } from "@/types";

export const navItems: Array<{ page: NavPage; label: string; icon: typeof Gauge }> = [
  { page: "dashboard", label: "Dashboard", icon: Gauge },
  { page: "transactions", label: "Transaksi", icon: ReceiptText },
  { page: "categories", label: "Kategori", icon: FolderKanban },
  { page: "wallets", label: "Wallet", icon: WalletCards },
  { page: "budgets", label: "Budget", icon: BarChart3 },
  { page: "goals", label: "Goals", icon: Target },
  { page: "reports", label: "Laporan", icon: PieChart },
  { page: "settings", label: "Settings", icon: Settings }
];
