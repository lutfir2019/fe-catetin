import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ensureDefaultData } from "@/lib/db/indexedDb";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { syncService } from "@/lib/sync/syncService";
import { useAppStore } from "@/store/appStore";
import type { AuthUser } from "@/types";

function normalizeUser(id: string, email?: string | null, name?: string | null, avatarUrl?: string | null): AuthUser {
  return {
    id,
    email: email || "demo@catetin.local",
    name: name || email?.split("@")[0] || "Teman CatetIn",
    avatar_url: avatarUrl ?? null
  };
}

export function useAuth() {
  const authUser = useAppStore((state) => state.authUser);
  const authLoading = useAppStore((state) => state.authLoading);
  const setAuthUser = useAppStore((state) => state.setAuthUser);
  const setAuthLoading = useAppStore((state) => state.setAuthLoading);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return () => {
        mounted = false;
      };
    }

    async function boot() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const user = data.session?.user;
      if (user) {
        const normalized = normalizeUser(
          user.id,
          user.email,
          user.user_metadata?.name as string | undefined,
          user.user_metadata?.avatar_url as string | undefined
        );
        setAuthUser(normalized);
        await ensureDefaultData(normalized.id);
        syncService.startAutoSync(normalized.id);
      }
      setAuthLoading(false);
    }

    void boot();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setAuthUser(null);
        syncService.stopAutoSync();
        setAuthLoading(false);
        return;
      }

      const normalized = normalizeUser(
        user.id,
        user.email,
        user.user_metadata?.name as string | undefined,
        user.user_metadata?.avatar_url as string | undefined
      );
      setAuthUser(normalized);
      setAuthLoading(false);
      void ensureDefaultData(normalized.id).then(() => syncService.startAutoSync(normalized.id));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthLoading, setAuthUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.");
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    toast.success("Berhasil masuk. Catatanmu sedang disiapkan.");
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.");
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    toast.success("Akun dibuat. Cek email bila konfirmasi aktif di Supabase.");
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase belum dikonfigurasi.");
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    toast.success("Link reset password sudah dikirim bila email terdaftar.");
  }, []);

  const signInDemo = useCallback(async () => {
    const user: AuthUser = {
      id: "demo-user",
      email: "demo@catetin.local",
      name: "Demo CatetIn",
      isDemo: true
    };
    setAuthUser(user);
    await ensureDefaultData(user.id);
    toast.success("Mode demo aktif. Data tersimpan lokal di perangkat ini.");
  }, [setAuthUser]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && authUser && !authUser.isDemo) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    syncService.stopAutoSync();
    toast.success("Kamu sudah keluar.");
  }, [authUser, setAuthUser]);

  return {
    user: authUser,
    loading: authLoading,
    signIn,
    signUp,
    resetPassword,
    signInDemo,
    signOut
  };
}
