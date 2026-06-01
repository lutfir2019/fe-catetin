import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/appStore";
import { AuthPage } from "@/pages/AuthPage";
import { BudgetsPage } from "@/pages/BudgetsPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { LandingPage } from "@/pages/LandingPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { WalletsPage } from "@/pages/WalletsPage";

type PublicView = "landing" | "auth";

export default function App() {
  const [publicView, setPublicView] = useState<PublicView>("landing");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { user, loading, signInDemo } = useAuth();
  const activePage = useAppStore((state) => state.activePage);
  const setActivePage = useAppStore((state) => state.setActivePage);
  const darkMode = useAppStore((state) => state.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-6 text-center sketch-border">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-3 font-heading text-xl font-bold">Menyiapkan CatetIn</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (publicView === "auth") {
      return <AuthPage onBack={() => setPublicView("landing")} />;
    }
    return <LandingPage onStart={() => setPublicView("auth")} onDemo={() => void signInDemo()} />;
  }

  function openQuickAdd() {
    setActivePage("transactions");
    setQuickAddOpen(true);
  }

  return (
    <AppLayout onQuickAdd={openQuickAdd}>
      {activePage === "dashboard" ? <DashboardPage userId={user.id} onAddTransaction={openQuickAdd} /> : null}
      {activePage === "transactions" ? (
        <TransactionsPage
          userId={user.id}
          quickAddOpen={quickAddOpen}
          onQuickAddHandled={() => setQuickAddOpen(false)}
        />
      ) : null}
      {activePage === "categories" ? <CategoriesPage userId={user.id} /> : null}
      {activePage === "wallets" ? <WalletsPage userId={user.id} /> : null}
      {activePage === "budgets" ? <BudgetsPage userId={user.id} /> : null}
      {activePage === "goals" ? <GoalsPage userId={user.id} /> : null}
      {activePage === "reports" ? <ReportsPage userId={user.id} /> : null}
      {activePage === "settings" ? <SettingsPage userId={user.id} /> : null}
    </AppLayout>
  );
}
