import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CloudOff,
  LockKeyhole,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoodleIllustration } from "@/components/shared/DoodleIllustration";
import { formatCurrency } from "@/lib/utils";

interface LandingPageProps {
  onStart: () => void;
  onDemo: () => void;
}

export function LandingPage({ onStart, onDemo }: LandingPageProps) {
  const features = [
    { icon: ReceiptText, title: "Catat cepat", body: "Pemasukan, pengeluaran, struk, dan catatan kecil dalam satu dialog." },
    { icon: CloudOff, title: "Tetap jalan offline", body: "Data masuk ke IndexedDB dulu, lalu sync otomatis ketika online." },
    { icon: BarChart3, title: "Insight ringan", body: "Saldo, budget, trend, dan kategori boros langsung terlihat." },
    { icon: ShieldCheck, title: "Akses aman", body: "Supabase Auth dan RLS menjaga data hanya untuk pemilik akun." }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-foreground bg-primary shadow-doodle">
            <PiggyBank className="h-6 w-6" />
          </span>
          <span className="font-heading text-2xl font-extrabold">CatetIn</span>
        </div>
        <Button variant="outline" onClick={onStart} type="button">
          Masuk
        </Button>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 px-4 pb-10 pt-4 sm:px-6 lg:grid-cols-[1fr_.9fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Badge className="mb-4 bg-secondary/40">
              <CloudOff className="h-3.5 w-3.5" />
              Offline-first PWA
            </Badge>
            <h1 className="max-w-3xl font-heading text-5xl font-extrabold leading-[0.98] sm:text-6xl lg:text-7xl">
              CatetIn
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-muted-foreground">
              Catatan uang pribadi yang ringan, warna-warni, dan tetap bisa dipakai saat internet lagi hilang.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={onStart} type="button">
                Mulai Mencatat
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary" onClick={onDemo} type="button">
                Coba mode demo
              </Button>
            </div>
          </motion.div>

          <div className="space-y-4">
            <DoodleIllustration variant="hero" className="shadow-soft" />
            <div className="rounded-lg bg-white p-4 sketch-border">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-heading text-xl font-bold">Preview dashboard</p>
                  <p className="text-sm text-muted-foreground">Ringkas, ramah, dan siap mobile.</p>
                </div>
                <Badge className="bg-success/25">Online</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Saldo", 8450000, "bg-primary"],
                  ["Masuk", 5200000, "bg-income/35"],
                  ["Keluar", 2180000, "bg-expense/35"]
                ].map(([label, value, color]) => (
                  <div key={String(label)} className={`rounded-lg border-2 border-foreground p-3 ${color}`}>
                    <p className="text-xs font-bold text-muted-foreground">{label}</p>
                    <p className="font-number text-lg font-extrabold">{formatCurrency(Number(value))}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y-2 border-foreground bg-white/80 py-10">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-none">
                <CardHeader>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-foreground bg-pink">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>{feature.body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CloudOff className="h-9 w-9 text-expense" />
              <CardTitle>Offline-first</CardTitle>
            </CardHeader>
            <CardContent>
              Kamu sedang offline. Catatanmu tetap aman di perangkat ini. Data akan disinkronkan otomatis saat internet
              kembali.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Smartphone className="h-9 w-9 text-secondary" />
              <CardTitle>Cara kerja</CardTitle>
            </CardHeader>
            <CardContent>
              IndexedDB menyimpan app shell dan data lokal. TanStack Query membaca cache lokal dulu, lalu Supabase saat
              online.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <LockKeyhole className="h-9 w-9 text-success" />
              <CardTitle>Keamanan data</CardTitle>
            </CardHeader>
            <CardContent>
              Supabase Auth dan Row Level Security membatasi akses data berdasarkan user yang sedang login.
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t-2 border-foreground bg-white px-4 py-6 text-center text-sm font-semibold text-muted-foreground">
        CatetIn - doodle finance tracker yang tetap nyaman dipakai setiap hari.
      </footer>
    </div>
  );
}
