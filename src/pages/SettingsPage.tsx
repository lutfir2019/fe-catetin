import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Brush, Database, LogOut, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { clearLocalUserData } from "@/lib/db/indexedDb";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { syncService } from "@/lib/sync/syncService";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/appStore";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  avatar_url: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface SettingsPageProps {
  userId?: string;
}

export function SettingsPage({ userId }: SettingsPageProps) {
  const user = useAppStore((state) => state.authUser);
  const setAuthUser = useAppStore((state) => state.setAuthUser);
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", avatar_url: user?.avatar_url ?? "" }
  });

  useEffect(() => {
    form.reset({ name: user?.name ?? "", avatar_url: user?.avatar_url ?? "" });
  }, [form, user]);

  async function saveProfile(values: ProfileFormValues) {
    if (!user) return;
    setSaving(true);
    try {
      if (isSupabaseConfigured && !user.isDemo) {
        const { error } = await supabase.auth.updateUser({
          data: { name: values.name, avatar_url: values.avatar_url || null }
        });
        if (error) throw error;
      }
      setAuthUser({ ...user, name: values.name, avatar_url: values.avatar_url || null });
      toast.success("Profil diperbarui.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profil belum berhasil diperbarui.");
    } finally {
      setSaving(false);
    }
  }

  async function clearCache() {
    if (!userId) return;
    await clearLocalUserData(userId);
    toast.success("Cache lokal dibersihkan. Data server akan ditarik lagi saat sync.");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-3xl font-extrabold">Settings</h2>
        <p className="text-sm font-medium text-muted-foreground">Profil, preferensi, cache lokal, logout, dan manual sync.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Edit profil</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(saveProfile)}>
              <FormField label="Nama" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} />
              </FormField>
              <FormField label="Avatar URL">
                <Input {...form.register("avatar_url")} placeholder="https://..." />
              </FormField>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan profil"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferensi aplikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border-2 border-foreground bg-background p-3">
                <p className="font-semibold">Currency default</p>
                <p className="text-sm text-muted-foreground">IDR - Rupiah Indonesia</p>
              </div>
              <Button variant={darkMode ? "secondary" : "outline"} onClick={toggleDarkMode} type="button">
                <Brush className="h-4 w-4" />
                {darkMode ? "Matikan dark mode" : "Aktifkan dark mode"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync dan cache</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => userId && !user?.isDemo && void syncService.syncNow(userId, "manual")} disabled={user?.isDemo} type="button">
              <RefreshCw className="h-4 w-4" />
              Manual sync
            </Button>
            <Button variant="outline" onClick={() => void clearCache()} type="button">
              <Database className="h-4 w-4" />
              Clear local cache
            </Button>
            <Button variant="danger" onClick={() => void signOut()} type="button">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Jika offline, perubahan masuk antrean. Saat online, tombol sync menjalankan queue create, update, delete, dan pull data
            Supabase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
