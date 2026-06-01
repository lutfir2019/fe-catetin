import { create } from "zustand";
import type { AuthUser, NavPage } from "@/types";

interface AppState {
  activePage: NavPage;
  authUser: AuthUser | null;
  authLoading: boolean;
  darkMode: boolean;
  setActivePage: (page: NavPage) => void;
  setAuthUser: (user: AuthUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePage: "dashboard",
  authUser: null,
  authLoading: true,
  darkMode: false,
  setActivePage: (page) => set({ activePage: page }),
  setAuthUser: (user) => set({ authUser: user }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
}));
