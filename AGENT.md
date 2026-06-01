Buat aplikasi PWA bernama **CatetIn** untuk mencatat pemasukan dan pengeluaran pribadi.

Aplikasi harus menggunakan pendekatan **offline-first**, sehingga tetap bisa digunakan saat tidak ada internet, menyimpan perubahan sementara di IndexedDB, lalu melakukan sinkronisasi otomatis ke Supabase saat koneksi kembali online.

## Tech Stack Wajib

Gunakan:

* React
* Vite
* TypeScript
* TanStack Query
* Supabase
* Supabase Auth
* shadcn/ui
* Tailwind CSS
* Zustand

Library tambahan:

* React Hook Form
* Zod
* Recharts
* Lucide React
* date-fns
* Sonner
* Framer Motion
* shadcn Dialog
* Dexie.js untuk IndexedDB
* @vite-pwa/plugin
* workbox-window
* clsx
* tailwind-merge

## Konsep Aplikasi

Aplikasi bertema **doodle colorful finance tracker**.

Gaya visual:

* Doodle / hand-drawn
* Colorful pastel
* Banyak ilustrasi koin, dompet, celengan, grafik, sticky note, awan, bintang, panah
* Tetap clean, nyaman di mata, dan tidak terlalu ramai
* Mobile-first
* Responsive untuk mobile, tablet, desktop

## Warna

Gunakan warna pastel:

* Background utama: `#FFF9F0`
* Primary: `#FFB703`
* Secondary: `#8ECAE6`
* Accent hijau: `#90BE6D`
* Accent pink: `#FFAFCC`
* Accent ungu: `#BDB2FF`
* Text utama: `#2D2D2D`
* Text sekunder: `#6B7280`
* Pengeluaran: `#F28482`
* Pemasukan: `#84A59D`

Pastikan kontras nyaman dibaca.

## Font

Gunakan:

* Heading: `Baloo 2` atau `Fredoka`
* Body: `Inter`
* Nominal angka: `Nunito Sans` atau `Inter`

## Halaman

### 1. Landing Page

Buat landing page sebelum login.

Isi:

* Hero section
* Ilustrasi doodle finansial
* CTA “Mulai Mencatat”
* Preview dashboard dalam mockup card
* Section fitur utama
* Section offline-first
* Section cara kerja
* Section keamanan data dengan Supabase Auth
* Footer

Tonality copywriting: ramah, ringan, personal.

### 2. Auth Page

Fitur:

* Login
* Register
* Reset password
* Supabase Auth
* UI doodle colorful

### 3. Dashboard

Tampilkan:

* Total saldo
* Total pemasukan bulan ini
* Total pengeluaran bulan ini
* Grafik pemasukan vs pengeluaran
* Ringkasan transaksi terbaru
* Budget progress
* Insight otomatis
* Status online/offline/sync

### 4. Transaksi

CRUD transaksi dalam **Dialog Popup**.

Fitur:

* Tambah pemasukan
* Tambah pengeluaran
* Edit transaksi
* Hapus transaksi
* Detail transaksi
* Filter tanggal, kategori, tipe
* Search transaksi
* Upload struk opsional
* Offline create/update/delete

Field:

* Judul
* Jumlah
* Tipe: pemasukan / pengeluaran
* Kategori
* Tanggal
* Catatan
* Wallet/Akun
* Lampiran struk opsional

### 5. Kategori

CRUD kategori dalam **Dialog Popup**.

Field:

* Nama kategori
* Tipe kategori
* Icon
* Warna
* Deskripsi opsional

Kategori default:

* Makanan
* Transportasi
* Belanja
* Hiburan
* Tagihan
* Gaji
* Freelance
* Investasi
* Tabungan

### 6. Wallet / Akun

CRUD wallet dalam **Dialog Popup**.

Contoh:

* Cash
* Bank
* E-wallet
* Kartu Kredit

Field:

* Nama wallet
* Saldo awal
* Icon
* Warna

### 7. Budget

CRUD budget dalam **Dialog Popup**.

Fitur:

* Budget per kategori
* Periode bulanan
* Progress bar
* Warning mendekati limit
* Alert melewati limit

### 8. Goals / Target Tabungan

CRUD goals dalam **Dialog Popup**.

Field:

* Nama goal
* Target nominal
* Nominal terkumpul
* Deadline
* Icon
* Warna

### 9. Laporan

Tampilkan:

* Grafik bulanan
* Grafik kategori pengeluaran
* Trend pemasukan dan pengeluaran
* Export CSV
* Import CSV
* Filter periode

### 10. Settings

Fitur:

* Edit profil
* Ubah nama
* Ubah avatar
* Dark mode optional
* Currency default IDR
* Logout
* Clear local cache
* Manual sync button

## Ketentuan CRUD

Semua form Create, Read detail, Update, dan Delete confirmation wajib menggunakan:

* shadcn Dialog
* React Hook Form
* Zod validation
* Sonner toast
* Loading state
* Empty state
* Error state

Tidak boleh membuat halaman form CRUD terpisah.

## Offline Mode + IndexedDB

Aplikasi wajib bisa digunakan offline.

Saat offline, user tetap bisa:

* Membuka dashboard terakhir
* Melihat transaksi terakhir
* Menambah transaksi
* Mengedit transaksi
* Menghapus transaksi
* CRUD kategori
* CRUD wallet
* CRUD budget
* CRUD goals

Gunakan **Dexie.js** untuk IndexedDB.

## Offline-First Strategy

Gunakan strategi:

1. Data dari Supabase disimpan ke IndexedDB.
2. Saat online, fetch data dari Supabase lalu update IndexedDB.
3. Saat offline, data dibaca dari IndexedDB.
4. Semua mutation langsung update IndexedDB secara optimistic.
5. Jika online, mutation langsung dikirim ke Supabase.
6. Jika offline, mutation masuk ke sync queue.
7. Saat koneksi kembali online, sync queue otomatis dikirim ke Supabase.

## IndexedDB Stores

Buat store:

* transactions
* categories
* wallets
* budgets
* goals
* syncQueue
* appMeta

Setiap entity lokal memiliki field:

* id
* user_id
* created_at
* updated_at
* deleted_at nullable
* sync_status: `synced | pending_create | pending_update | pending_delete | conflict`
* local_updated_at
* server_updated_at nullable

## Sync Queue

Buat store `syncQueue` dengan field:

* id
* entity
* entity_id
* operation: `create | update | delete`
* payload
* created_at
* retry_count
* last_error nullable
* status: `pending | syncing | failed | done`

## Auto Sync

Buat `syncService` untuk:

* Mendeteksi status internet
* Menjalankan sync saat aplikasi dibuka
* Menjalankan sync saat user login
* Menjalankan sync saat koneksi kembali online
* Retry queue gagal
* Mencegah duplicate sync
* Menangani create, update, delete
* Menghapus soft-delete lokal setelah Supabase sukses sync
* Update IndexedDB setelah data server berhasil disinkronkan

Trigger sync:

* App start
* Login
* Online kembali
* Mutation saat online
* Manual sync dari settings
* Interval berkala saat online

## Conflict Handling

Jika data lokal dan server berubah bersamaan:

* Bandingkan `updated_at` server dan `local_updated_at`
* Jika aman, sync otomatis
* Jika konflik, tandai `sync_status = conflict`
* Tampilkan `ConflictResolutionDialog`

User bisa memilih:

* Gunakan versi lokal
* Gunakan versi server
* Gabungkan manual jika memungkinkan

## Delete Strategy

Gunakan soft delete:

* Saat offline delete, isi `deleted_at`
* Set `sync_status = pending_delete`
* Masukkan operasi delete ke syncQueue
* Sembunyikan data dari UI
* Hapus permanen lokal hanya setelah sync berhasil

## TanStack Query Integration

Integrasikan TanStack Query dengan IndexedDB:

* Query membaca IndexedDB terlebih dahulu
* Saat online, fetch Supabase lalu update IndexedDB
* Mutation optimistic ke IndexedDB
* Jika offline, masuk syncQueue
* Jika online, sync ke Supabase lalu update cache

Query keys:

* `['transactions', userId]`
* `['categories', userId]`
* `['wallets', userId]`
* `['budgets', userId]`
* `['goals', userId]`

## UI Offline

Tambahkan indikator:

* Online
* Offline
* Syncing
* Sync failed
* Conflict detected

Komponen:

* `OfflineStatusBadge`
* `SyncQueueIndicator`
* `ConflictResolutionDialog`

Microcopy:

* “Kamu sedang offline. Catatanmu tetap aman di perangkat ini.”
* “Data akan disinkronkan otomatis saat internet kembali.”
* “Ada perubahan yang perlu kamu cek sebelum disinkronkan.”

## Database Supabase

Buat schema:

* profiles
* transactions
* categories
* wallets
* budgets
* goals

Semua table memiliki:

* id
* user_id
* created_at
* updated_at
* deleted_at nullable

Gunakan Row Level Security agar user hanya bisa mengakses datanya sendiri.

## PWA

Aplikasi harus mendukung:

* Installable PWA
* Offline fallback
* Manifest
* App icon doodle
* Splash screen
* Responsive mobile app feel
* Cache asset penting
* Service worker
* App shell caching

## UX Detail

Tambahkan:

* Empty state ilustrasi doodle
* Loading skeleton
* Animasi Framer Motion
* Hover playful
* Card dengan border sketsa tangan
* Background pattern doodle tipis
* Microcopy ramah
* Floating action button untuk tambah transaksi di mobile

## Komponen UI Utama

Buat komponen:

* AppLayout
* LandingPage
* Sidebar
* MobileNav
* Header
* StatCard
* TransactionCard
* TransactionDialog
* CategoryDialog
* WalletDialog
* BudgetDialog
* GoalDialog
* ConfirmDeleteDialog
* ChartCard
* EmptyState
* DoodleIllustration
* FilterBar
* DateRangePicker
* CurrencyInput
* OfflineStatusBadge
* SyncQueueIndicator
* ConflictResolutionDialog

## File Offline yang Wajib Dibuat

Buat:

* `src/lib/db/indexedDb.ts`
* `src/lib/sync/syncService.ts`
* `src/lib/sync/syncQueue.ts`
* `src/hooks/useOnlineStatus.ts`
* `src/hooks/useOfflineQuery.ts`
* `src/hooks/useOfflineMutation.ts`
* `src/components/offline/OfflineStatusBadge.tsx`
* `src/components/offline/SyncQueueIndicator.tsx`
* `src/components/offline/ConflictResolutionDialog.tsx`

## Rekomendasi Fitur Tambahan

Tambahkan jika memungkinkan:

* Recurring transaction
* Reminder tagihan
* Multi-wallet
* Transfer antar wallet
* Upload struk
* Insight otomatis
* Budget alert
* Export CSV
* Import CSV
* Pin transaksi penting
* Favorite category
* Quick add transaction
* Kalender transaksi
* Mode demo di landing page

## Prioritas Implementasi

1. Setup React Vite TypeScript
2. Setup Tailwind + shadcn/ui
3. Setup Supabase Auth
4. Setup database schema + RLS
5. Setup IndexedDB dengan Dexie
6. Setup sync queue
7. Setup PWA service worker
8. Buat landing page
9. Buat auth flow
10. Buat dashboard
11. Buat CRUD transaksi dengan Dialog Popup
12. Buat CRUD kategori, wallet, budget, goals
13. Integrasikan offline-first mutation
14. Buat laporan
15. Tambahkan conflict resolver
16. Final polish doodle UI

## Output yang Diharapkan

Berikan kode aplikasi lengkap, modular, clean, dan production-ready.

Pastikan:

* TypeScript strict
* Struktur folder rapi
* Komponen reusable
* Query data menggunakan TanStack Query
* Mutasi data menggunakan TanStack Query mutation
* Offline-first dengan IndexedDB
* Auto sync ke Supabase saat online
* Semua state loading/error/empty ditangani
* UI responsive
* Semua form CRUD dalam Dialog Popup
* Tema doodle colorful konsisten
* Tetap nyaman di mata meski penuh warna dan ilustrasi
