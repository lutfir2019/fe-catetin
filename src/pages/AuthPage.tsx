import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, KeyRound, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { DoodleIllustration } from "@/components/shared/DoodleIllustration";
import { useAuth } from "@/hooks/useAuth";

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email belum valid"),
  password: z.string().optional()
});

type AuthFormValues = z.infer<typeof authSchema>;
type AuthMode = "login" | "register" | "reset";

interface AuthPageProps {
  onBack: () => void;
}

export function AuthPage({ onBack }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, signInDemo } = useAuth();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  async function submit(values: AuthFormValues) {
    setLoading(true);
    try {
      if (mode === "login") {
        if (!values.password || values.password.length < 6) {
          form.setError("password", { message: "Password minimal 6 karakter" });
          return;
        }
        await signIn(values.email, values.password);
      } else if (mode === "register") {
        if (!values.password || values.password.length < 6) {
          form.setError("password", { message: "Password minimal 6 karakter" });
          return;
        }
        await signUp(values.name || values.email.split("@")[0], values.email, values.password);
      } else {
        await resetPassword(values.email);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Auth belum berhasil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen gap-6 p-4 lg:grid-cols-[1fr_.9fr] lg:p-8">
      <div className="flex flex-col justify-between">
        <Button variant="ghost" className="w-fit" onClick={onBack} type="button">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="mx-auto w-full max-w-md py-8">
          <Card>
            <CardHeader>
              <CardTitle>{mode === "login" ? "Masuk ke CatetIn" : mode === "register" ? "Buat akun" : "Reset password"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
                {mode === "register" ? (
                  <FormField label="Nama" error={form.formState.errors.name?.message}>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-9" {...form.register("name")} placeholder="Nama kamu" />
                    </div>
                  </FormField>
                ) : null}
                <FormField label="Email" error={form.formState.errors.email?.message}>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" type="email" {...form.register("email")} placeholder="kamu@email.com" />
                  </div>
                </FormField>
                {mode !== "reset" ? (
                  <FormField label="Password" error={form.formState.errors.password?.message}>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-9" type="password" {...form.register("password")} placeholder="Minimal 6 karakter" />
                    </div>
                  </FormField>
                ) : null}
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Memproses..." : mode === "login" ? "Login" : mode === "register" ? "Register" : "Kirim link reset"}
                </Button>
              </form>
              <div className="mt-4 grid gap-2">
                <Button variant="secondary" onClick={() => void signInDemo()} type="button">
                  Masuk mode demo lokal
                </Button>
                <div className="flex flex-wrap justify-center gap-2 text-sm font-semibold">
                  <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("login")} type="button">
                    Login
                  </button>
                  <span>/</span>
                  <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("register")} type="button">
                    Register
                  </button>
                  <span>/</span>
                  <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("reset")} type="button">
                    Reset password
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden items-center lg:flex">
        <DoodleIllustration variant="security" className="w-full" />
      </div>
    </div>
  );
}
