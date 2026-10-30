<div align="center">

# 🎟️ EVENTIFY
### *Next-Gen Event Management & Digital Ticketing Platform*

[![Bun](https://img.shields.io/badge/Runtime-Bun%20v1.4+-fbf0df?style=for-the-badge&logo=bun&logoColor=black)](https://bun.sh)
[![SvelteKit](https://img.shields.io/badge/Frontend-SvelteKit%203-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma & SQLite](https://img.shields.io/badge/Database-SQLite%20%2B%20Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)

<p align="center">
  <b>Platform manajemen acara modern dengan tiket digital QR Code sekali pakai, autentikasi Argon2id, tata letak desktop eksklusif, dan transisi Dark Mode ultra-halus.</b>
</p>

[Fitur Utama](#-fitur-unggulan) •
[Arsitektur](#-arsitektur-sistem) •
[Akun Uji Coba](#-akun-demo-1-klik) •
[Panduan Instalasi](#-panduan-instalasi--menjalankan) •
[Pengujian & CI/CD](#-pengujian-otomatis--cicd)

---

</div>

## 🌟 Fitur Unggulan

### 🛡️ 1. Keamanan & Autentikasi (RBAC)
- **Role-Based Access Control**: Pembagian hak akses mutlak untuk 3 peran: **Admin**, **Organizer**, dan **Participant**.
- **Kriptografi Argon2id**: Password di-hash menggunakan algoritma modern pemenang *Password Hashing Competition* (native Bun).
- **Session Bearer Token**: Otorisasi endpoint terenkripsi dengan proteksi middleware terpusat.

### 🎨 2. Antarmuka Desktop Modern & Adaptif
- **Desktop-Only Viewport**: Antarmuka dioptimalkan secara presisi untuk layar laptop/desktop (`min-width: 1024px`) tanpa kompromi tata letak mobile yang sempit.
- **Ultra-Smooth Dark Mode**: Palet warna *Deep Navy Slate* (`#090D16`) dengan efek kaca kabut (*frosted glassmorphism*) dan transisi *flicker-free*.
- **Desain Tiket Realistis**: Tiket digital bergaya *Boarding Pass Concert* dengan lubang perforasi adaptif (*notches*), garis robek putus-putus, dan bingkai QR code presisi.

### 🎫 3. Transaksi & Tiket Digital
- **Simulasi Pembayaran Instan**: Verifikasi kuota tiket secara atomik dengan rollback otomatis jika kuota habis.
- **Penerbitan QR Code Base64**: Menghasilkan gambar QR Code beresolusi tinggi langsung dari token acak kriptografis.
- **Scanner Anti Double Check-In**: Organizer dapat memverifikasi QR peserta di hari acara; tiket yang telah dipakai otomatis ditolak jika di-scan kedua kalinya.

### 📊 4. Panel Manajemen Berbasis Peran
- **Organizer Dashboard**:
  - Formulir publikasi acara dengan input foto sampul (*Cover Banner*) dan **Live Preview**.
  - Manajemen acara sendiri (melihat daftar, mengedit detail acara lama, dan menghapus dengan *cascade transaction*).
  - Scanner tiket hari-H secara *real-time*.
- **Admin Moderation & Analytics**:
  - KPI Dashboard Global (Total Perputaran Uang, Tiket Terjual, Total Pengguna, Acara Aktif).
  - Tinjauan moderasi: Menyetujui (*Approve*) atau Menolak (*Reject*) pengajuan acara sebelum tayang ke publik.

---

## 🏗️ Arsitektur Sistem

Aplikasi ini dibangun menggunakan arsitektur monorepo *Client-Server Separation*:

```text
eventify/
├── backend/                  # REST API Server (Port 3000)
│   ├── prisma/               # Skema SQLite, Migrasi, & Seeder Acara
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/      # Request & Response HTTP Handlers
│       ├── middleware/       # RBAC Guard, Error Handler, Zod Validator
│       ├── routes/           # Endpoint API Publik & Privat
│       ├── schemas/          # Validasi Input Zod
│       ├── services/         # Logika Bisnis & Transaksi Database
│       ├── utils/            # Hashing Argon2id
│       └── server.ts         # Entry Point Express
│
├── frontend/                 # SvelteKit 3 Desktop Client (Port 3002)
│   ├── src/
│   │   ├── features/         # Arsitektur Berbasis Fitur (Feature-Driven)
│   │   │   └── common/       # Layout Desktop, Sticky Navbar, Theme Switcher
│   │   ├── helpers/          # API Fetch Wrapper & Format Rupiah
│   │   ├── hooks/            # Reaktif Input Hooks
│   │   └── routes/           # File-based Routing ($app/state, SweetAlert2)
│   ├── vite.config.ts        # Konfigurasi SvelteKit, Bun Adapter, & Vitest 100%
│   └── tailwind.config.js    # Tailwind CSS v4 Engine
│
├── Jenkinsfile               # Automasi Pipeline CI/CD Jenkins
└── sonar-project.properties  # Konfigurasi SonarQube Code Quality
🔑 Akun Demo (1-Klik Login)
Semua akun demo telah tersedia langsung di database SQLite dengan password default: password123

Peran	Alamat Email	Kata Sandi	Hak Akses Fitur
ADMIN	admin@eventify.com	password123	KPI Platform, Moderasi Acara (Approve/Reject)
ORGANIZER	organizer@eventify.com	password123	CRUD Acara, Live Preview Sampul, Scanner QR Check-in
PARTICIPANT	budi@gmail.com	password123	Katalog Publik, Pesan Tiket, Akses QR Tiket Saya
⚡ Panduan Instalasi & Menjalankan

Kebutuhan Sistem
Bun Runtime (v1.1 atau lebih baru)

Git

1. Kloning Repositori
code
Bash
git clone <URL_REPOSITORY_ANDA>
cd eventify
2. Instalasi Dependensi
code
Bash
bun install
cd backend && bun install && cd ..
cd frontend && bun install && cd ..
3. Setup Database SQLite & Data Awal
code
Bash
cd backend
bunx prisma db push
bun prisma/seed.ts
cd ..
4. Jalankan Aplikasi Bersamaan (Single Command)
Cukup jalankan satu perintah dari folder utama:

code
Bash
bun run dev
🌐 Frontend: http://localhost:3002 (Otomatis terbuka di browser)

🔌 Backend REST API: http://localhost:3000

🧪 Pengujian Otomatis & CI/CD
Proyek ini telah dikonfigurasi dengan standar kualitas kode yang ketat untuk memenuhi integrasi Jenkins Pipeline dan pemindaian SonarQube:

1. Pengujian Unit Frontend & Ambang Batas 100% Coverage
code
Bash
cd frontend
bun run test:coverage
Output memvalidasi seluruh metrik Statements, Branches, Functions, dan Lines berada pada angka 100%.

2. Pengujian Backend & Keamanan
code
Bash
cd backend
bun test
Menguji integritas hash password Argon2id, pencegahan double check-in, dan transaksi pemesanan tiket.

📡 Dokumentasi Endpoint REST API

Autentikasi
Metode	Endpoint	Akses	Keterangan
POST	/api/auth/register	Publik	Registrasi akun baru (Participant/Organizer)
POST	/api/auth/login	Publik	Otentikasi & penerbitan Bearer token
Acara (Events)
Metode	Endpoint	Akses	Keterangan
GET	/api/events	Publik	Ambil katalog acara (filter status, search, kategori)
GET	/api/events/:id	Publik	Ambil rincian lengkap acara dan kuota tiket
POST	/api/events	Organizer, Admin	Publikasi acara baru (menunggu moderasi)
PUT	/api/events/:id	Pemilik Acara, Admin	Perbarui informasi dan foto sampul acara
DELETE	/api/events/:id	Pemilik Acara, Admin	Hapus acara (Cascade delete tiket terkait)
PATCH	/api/events/:id/status	Admin	Setujui (APPROVED) atau tolak (REJECTED) acara
Transaksi & Tiket Digital
Metode	Endpoint	Akses	Keterangan
POST	/api/registrations	Participant	Buat pesanan tiket (kuota dikunci)
POST	/api/payments/simulate	Participant	Simulasi bayar & terbitkan QR Code
GET	/api/my-tickets	Participant	Ambil seluruh tiket digital peserta
POST	/api/check-in	Organizer, Admin	Validasi tiket QR (Anti double check-in)
GET	/api/dashboard/summary	Admin	Statistik pendapatan dan metrik platform
🚢 Panduan Deployment
Frontend: Siap di-deploy langsung ke Vercel menggunakan @sveltejs/adapter-vercel.

Backend: Dapat di-deploy ke Render atau Railway dengan runtime Node.js/Bun terkelola.

<div align="center">
<sub>Dikembangkan untuk Proyek Praktikum Pengembangan Aplikasi Berbasis Web (PABWE).</sub>
</div>
