import { useState, type ReactNode } from "react";
import { ConflictResolutionDialog } from "@/components/offline/ConflictResolutionDialog";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/appStore";

interface AppLayoutProps {
  children: ReactNode;
  onQuickAdd: () => void;
}

export function AppLayout({ children, onQuickAdd }: AppLayoutProps) {
  const [conflictsOpen, setConflictsOpen] = useState(false);
  const user = useAppStore((state) => state.authUser);

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        <Header onOpenConflicts={() => setConflictsOpen(true)} />
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
      <MobileNav onQuickAdd={onQuickAdd} />
      <ConflictResolutionDialog open={conflictsOpen} onOpenChange={setConflictsOpen} userId={user?.id} />
    </div>
  );
}
