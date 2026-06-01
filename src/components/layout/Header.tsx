import { LogOut, Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OfflineStatusBadge } from "@/components/offline/OfflineStatusBadge";
import { SyncQueueIndicator } from "@/components/offline/SyncQueueIndicator";
import { navItems } from "@/components/layout/navItems";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/appStore";

interface HeaderProps {
  onOpenConflicts: () => void;
}

export function Header({ onOpenConflicts }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const activePage = useAppStore((state) => state.activePage);
  const setActivePage = useAppStore((state) => state.setActivePage);
  const user = useAppStore((state) => state.authUser);
  const { signOut } = useAuth();
  const title =
    navItems.find((item) => item.page === activePage)?.label ?? "CatetIn";

  return (
    <header className="sticky top-0 z-30 border-b-2 border-foreground bg-background/92 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-extrabold">{title}</h1>
            <p className="text-xs font-semibold text-muted-foreground">
              Kamu sedang offline? Catatanmu tetap aman di perangkat ini.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <OfflineStatusBadge />
          <SyncQueueIndicator
            userId={user?.isDemo ? undefined : user?.id}
            onOpenConflicts={onOpenConflicts}
          />
          <Button
            variant="outline"
            className="hidden sm:inline-flex"
            type="button"
          >
            <UserRound className="h-4 w-4" />
            {user?.name ?? "User"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void signOut()}
            aria-label="Logout"
            type="button"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {open ? (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border-2 border-foreground bg-white p-2 lg:hidden">
          {navItems.map((item) => (
            <Button
              key={item.page}
              variant={activePage === item.page ? "default" : "ghost"}
              className="justify-start"
              onClick={() => {
                setActivePage(item.page);
                setOpen(false);
              }}
              type="button"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      ) : null}
    </header>
  );
}
