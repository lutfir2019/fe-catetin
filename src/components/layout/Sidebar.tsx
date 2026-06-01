import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/layout/navItems";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";

export function Sidebar() {
  const activePage = useAppStore((state) => state.activePage);
  const setActivePage = useAppStore((state) => state.setActivePage);

  return (
    <aside className="hidden w-72 shrink-0 border-r-2 border-foreground bg-white/86 p-4 lg:block">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-foreground bg-primary shadow-doodle">
          <Coins className="h-6 w-6" />
        </span>
        <div>
          <p className="font-heading text-2xl font-extrabold">CatetIn</p>
          <p className="text-xs font-semibold text-muted-foreground">Offline-first money notes</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.page}
            variant={activePage === item.page ? "default" : "ghost"}
            className={cn("w-full justify-start", activePage !== item.page && "border-transparent shadow-none")}
            onClick={() => setActivePage(item.page)}
            type="button"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
