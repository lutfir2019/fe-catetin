import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/layout/navItems";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import type { NavPage } from "@/types";

interface MobileNavProps {
  onQuickAdd: () => void;
}

const primaryPages: NavPage[] = ["dashboard", "transactions", "budgets", "reports", "settings"];

export function MobileNav({ onQuickAdd }: MobileNavProps) {
  const activePage = useAppStore((state) => state.activePage);
  const setActivePage = useAppStore((state) => state.setActivePage);
  const items = navItems.filter((item) => primaryPages.includes(item.page));

  return (
    <>
      <Button
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full lg:hidden"
        size="icon"
        onClick={onQuickAdd}
        aria-label="Tambah transaksi"
        type="button"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-2 border-foreground bg-white px-2 py-2 lg:hidden">
        {items.map((item) => (
          <button
            key={item.page}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center rounded-lg text-[11px] font-bold transition",
              activePage === item.page ? "bg-primary" : "hover:bg-muted"
            )}
            onClick={() => setActivePage(item.page)}
            type="button"
          >
            <item.icon className="mb-1 h-4 w-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
