<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { 
    Ticket, ArrowRight, Shield, User, Briefcase, 
    Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, QrCode, ShieldCheck 
  } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let isLoading = $state(false);
  let selectedDemoRole = $state<string | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    isLoading = true;

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Masuk',
        text: `Selamat datang kembali, ${res.data.user.name}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      if (res.data.user.role === 'ADMIN') goto('/dashboard/admin');
      else if (res.data.user.role === 'ORGANIZER') goto('/dashboard/organizer');
      else goto('/');
    } catch {
      // Handled otomatis oleh apiHelper
    } finally {
      isLoading = false;
    }
  }

  function fillDemo(demoEmail: string, roleName: string) {
    email = demoEmail;
    password = 'password123';
    selectedDemoRole = roleName;
  }
</script>

<div class="max-w-5xl w-full mx-auto my-4 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl shadow-indigo-500/5 overflow-hidden grid grid-cols-12 min-h-[580px]">
  
  <!-- SISI KIRI: BRAND SHOWCASE & FITUR UNGGULAN (5 Kolom) -->
  <div class="col-span-5 relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-10 text-white flex flex-col justify-between overflow-hidden border-r border-slate-800">
    <!-- Ambient Glow Orbs -->
    <div class="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header Showcase -->
    <div class="relative z-10 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Ticket class="w-5 h-5 -rotate-12" />
        </div>
        <div>
          <span class="text-xl font-black tracking-tight text-white">Eventify</span>
          <span class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 block -mt-1">Pass Platform</span>
        </div>
      </div>

      <div class="pt-6">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-[11px] font-bold tracking-wide backdrop-blur-md">
          <Sparkles class="w-3 h-3 text-indigo-400" />
          Ekosistem Tiket Masa Depan
        </span>
        <h2 class="text-2xl font-black mt-3 leading-snug">
          Akses Ribuan Acara dengan Satu Akun.
        </h2>
        <p class="text-slate-400 text-xs mt-2 leading-relaxed">
          Pemesanan instan, verifikasi tiket QR anti double check-in, dan manajemen acara kelas industri.
        </p>
      </div>
    </div>

    <!-- Kartu Mock Tiket Visual Mini -->
    <div class="relative z-10 my-6 p-4 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md space-y-3">
      <div class="flex items-center justify-between text-[11px]">
        <span class="text-indigo-400 font-bold uppercase tracking-wider">Tiket Digital Aktif</span>
        <span class="flex items-center gap-1 text-emerald-400 font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Terverifikasi
        </span>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-white p-1 shrink-0">
          <QrCode class="w-full h-full text-slate-900" />
        </div>
        <div class="overflow-hidden">
          <div class="text-xs font-bold text-white truncate">Fullstack Modern Summit 2026</div>
          <div class="text-[10px] text-slate-400">Grand Ballroom Jakarta • VIP Pass</div>
        </div>
      </div>
    </div>

    <!-- Footer Poin Keamanan -->
    <div class="relative z-10 flex items-center gap-6 text-[11px] text-slate-400 pt-4 border-t border-white/10">
      <div class="flex items-center gap-1.5">
        <ShieldCheck class="w-4 h-4 text-emerald-400" />
        <span>Argon2id Hash</span>
      </div>
      <div class="flex items-center gap-1.5">
        <CheckCircle2 class="w-4 h-4 text-indigo-400" />
        <span>Sesi Aman</span>
      </div>
    </div>
  </div>

  <!-- SISI KANAN: FORMULIR LOGIN INTERAKTIF (7 Kolom) -->
  <div class="col-span-7 p-10 flex flex-col justify-between bg-white dark:bg-[#0F172A]">
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Masuk ke Akun Anda</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Masukkan kredensial akun atau pilih akun demo uji coba di bawah.</p>
      </div>

      <!-- Form Input Utama -->
      <form onsubmit={handleSubmit} class="space-y-4">
        <!-- Input Email -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Alamat Email</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="email" 
              bind:value={email} 
              required 
              placeholder="nama@email.com" 
              class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-indigo-600 dark:focus:outline-indigo-400 text-slate-900 dark:text-white transition"
            />
          </div>
        </div>

        <!-- Input Password dengan Toggle Show/Hide -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Kata Sandi</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              bind:value={password} 
              required 
              placeholder="••••••••" 
              class="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-indigo-600 dark:focus:outline-indigo-400 text-slate-900 dark:text-white transition"
            />
            <button 
              type="button" 
              onclick={() => showPassword = !showPassword}
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
              {#if showPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
          <span>{isLoading ? 'Memvalidasi Otentikasi...' : 'Masuk ke Platform'}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <!-- Shortcut Demo 1-Klik Berwarna & Berstatus -->
      <div class="mt-6 pt-5 border-t border-slate-100 dark:border-white/[0.06]">
        <div class="flex items-center justify-between mb-2.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Login Cepat (Akun Uji Coba):</span>
          {#if selectedDemoRole}
            <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">✓ Role {selectedDemoRole} dipilih</span>
          {/if}
        </div>

        <div class="grid grid-cols-3 gap-2.5">
          <!-- Demo Admin -->
          <button 
            type="button"
            onclick={() => fillDemo('admin@eventify.com', 'Admin')}
            class="p-2.5 rounded-2xl border text-left transition cursor-pointer {selectedDemoRole === 'Admin' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'}">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0">
                <Shield class="w-3.5 h-3.5" />
              </div>
              <div>
                <div class="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">Admin</div>
                <div class="text-[9px] text-slate-400">Moderasi Acara</div>
              </div>
            </div>
          </button>

          <!-- Demo Organizer -->
          <button 
            type="button"
            onclick={() => fillDemo('organizer@eventify.com', 'Organizer')}
            class="p-2.5 rounded-2xl border text-left transition cursor-pointer {selectedDemoRole === 'Organizer' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'}">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center shrink-0">
                <Briefcase class="w-3.5 h-3.5" />
              </div>
              <div>
                <div class="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">Organizer</div>
                <div class="text-[9px] text-slate-400">Scanner & Buat Acara</div>
              </div>
            </div>
          </button>

          <!-- Demo Peserta -->
          <button 
            type="button"
            onclick={() => fillDemo('budi@gmail.com', 'Peserta')}
            class="p-2.5 rounded-2xl border text-left transition cursor-pointer {selectedDemoRole === 'Peserta' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'}">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center shrink-0">
                <User class="w-3.5 h-3.5" />
              </div>
              <div>
                <div class="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">Peserta</div>
                <div class="text-[9px] text-slate-400">Pesan Tiket & QR</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Tautan Daftar Akun Baru -->
    <div class="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
      Belum memiliki akun? 
      <a href="/auth/register" class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
        Daftar akun sekarang →
      </a>
    </div>
  </div>
</div>
