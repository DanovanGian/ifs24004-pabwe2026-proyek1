<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { initTheme, toggleTheme } from '../../../helpers/themeHelper.ts';
  import { 
    Ticket, ArrowRight, Shield, User, Briefcase, 
    Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, QrCode, ShieldCheck,
    ArrowLeft, Sun, Moon
  } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let isLoading = $state(false);
  let selectedDemoRole = $state<string | null>(null);
  let currentTheme = $state<'light' | 'dark'>('light');

  onMount(() => {
    currentTheme = initTheme();
    // Default terisi akun organizer untuk kenyamanan
  });

  function handleTheme() {
    currentTheme = toggleTheme();
  }

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
        text: `Selamat datang, ${res.data.user.name}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      if (res.data.user.role === 'ADMIN') goto('/dashboard/admin');
      else if (res.data.user.role === 'ORGANIZER') goto('/dashboard/organizer');
      else goto('/');
    } catch {
      // Handled otomatis
    } finally {
      isLoading = false;
    }
  }

  function fillDemo(demoEmail: string, roleName: string) {
    email = demoEmail;
    selectedDemoRole = roleName;
  }
</script>

<div class="min-h-screen w-full grid grid-cols-12 bg-white dark:bg-[#090D16]">
  
  <!-- SISI KIRI: BRAND CINEMATIC SHOWCASE (5 Kolom Penuh Layar) -->
  <div class="col-span-5 relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-12 text-white flex flex-col justify-between overflow-hidden border-r border-slate-800 shadow-2xl">
    <!-- Ambient Radial Glows -->
    <div class="absolute -right-24 -top-24 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-24 -bottom-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Tombol Kembali ke Beranda -->
    <div class="relative z-10 flex justify-between items-center">
      <a href="/" class="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition group bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl backdrop-blur-md">
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Kembali ke Beranda</span>
      </a>

      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
          <Ticket class="w-4 h-4 -rotate-12" />
        </div>
        <span class="text-sm font-black tracking-tight">Eventify</span>
      </div>
    </div>

    <!-- Hero Content Tengah -->
    <div class="relative z-10 my-auto py-10 space-y-6">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-bold tracking-wide backdrop-blur-md">
        <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
        Next-Generation Event Experience
      </div>

      <h1 class="text-4xl font-black leading-tight text-white tracking-tight">
        Satu Platform.<br />Ribuan Pengalaman Berharga.
      </h1>

      <p class="text-slate-300 text-sm leading-relaxed max-w-md">
        Nikmati kemudahan reservasi tiket digital dengan QR Code instan, verifikasi anti-duplikasi, dan tata kelola acara profesional.
      </p>

      <!-- Kartu Tiket Visual Mini Bercahaya -->
      <div class="pt-2">
        <div class="p-5 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl shadow-xl space-y-3.5 max-w-sm">
          <div class="flex items-center justify-between text-xs">
            <span class="text-indigo-400 font-extrabold uppercase tracking-wider">Tiket Masuk Resmi</span>
            <span class="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Aktif & Terverifikasi
            </span>
          </div>

          <div class="flex items-center gap-3.5 pt-1">
            <div class="w-12 h-12 rounded-xl bg-white p-1.5 shrink-0 shadow-xs">
              <QrCode class="w-full h-full text-slate-900" />
            </div>
            <div class="overflow-hidden">
              <div class="text-sm font-bold text-white truncate">Fullstack Modern Summit 2026</div>
              <div class="text-[11px] text-slate-400 mt-0.5">Grand Ballroom • VIP Front Row</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Kiri: Jaminan Keamanan -->
    <div class="relative z-10 flex items-center gap-8 text-xs text-slate-400 pt-6 border-t border-white/10">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-emerald-400" />
        <span>Kriptografi Argon2id</span>
      </div>
      <div class="flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-indigo-400" />
        <span>Anti Double Check-in</span>
      </div>
    </div>
  </div>

  <!-- SISI KANAN: FORMULIR OTENTIKASI PENUH (7 Kolom) -->
  <div class="col-span-7 relative flex flex-col justify-between p-16 overflow-y-auto bg-white dark:bg-[#090D16]">
    
    <!-- Top Right Controls (Theme Toggle) -->
    <div class="flex justify-end items-center">
      <button 
        type="button"
        onclick={handleTheme}
        aria-label="Ganti Tema"
        class="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition cursor-pointer shadow-xs flex items-center gap-2 text-xs font-bold">
        {#if currentTheme === 'dark'}
          <Sun class="w-4 h-4" />
          <span>Mode Terang</span>
        {:else}
          <Moon class="w-4 h-4 text-slate-600" />
          <span>Mode Gelap</span>
        {/if}
      </button>
    </div>

    <!-- Container Form Tengah -->
    <div class="max-w-lg w-full mx-auto my-auto py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Masuk ke Platform</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Gunakan kredensial akun Anda atau pilih akun demonstrasi di bawah.</p>
      </div>

      <form onsubmit={handleSubmit} class="space-y-5">
        <!-- Input Email -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Alamat Email</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="email" id="username" name="username" 
              bind:value={email} 
              required 
              placeholder="nama@email.com" 
              class="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800/60 text-xs font-medium focus:outline-indigo-600 dark:focus:outline-indigo-400 text-slate-900 dark:text-white transition"
            />
          </div>
        </div>

        <!-- Input Password -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Kata Sandi</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type={showPassword ? 'text' : 'password'} id="password" name="password" 
              bind:value={password} 
              required 
              placeholder="••••••••" 
              class="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800/60 text-xs font-medium focus:outline-indigo-600 dark:focus:outline-indigo-400 text-slate-900 dark:text-white transition"
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
          type="submit" id="btn-submit" 
          disabled={isLoading}
          class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-3">
          <span>{isLoading ? 'Memvalidasi Otentikasi...' : 'Masuk ke Platform'}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <!-- Shortcut Demo 1-Klik -->
      <div class="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
        <div class="flex items-center justify-between mb-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Login Cepat (Akun Uji Coba):</span>
          {#if selectedDemoRole}
            <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">✓ Role {selectedDemoRole} aktif</span>
          {/if}
        </div>

        <div class="grid grid-cols-3 gap-3">
          <!-- Demo Admin -->
          <button 
            type="button"
            onclick={() => fillDemo('admin@eventify.com', 'Admin')}
            class="p-3 rounded-2xl border text-left transition cursor-pointer {selectedDemoRole === 'Admin' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'}">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0">
                <Shield class="w-4 h-4" />
              </div>
              <div>
                <div class="text-xs font-extrabold text-slate-800 dark:text-slate-100">Admin</div>
                <div class="text-[10px] text-slate-400">Moderasi Acara</div>
              </div>
            </div>
          </button>

          <!-- Demo Organizer -->
          <button 
            type="button"
            onclick={() => fillDemo('organizer@eventify.com', 'Organizer')}
            class="p-3 rounded-2xl border text-left transition cursor-pointer {selectedDemoRole === 'Organizer' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'}">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center shrink-0">
                <Briefcase class="w-4 h-4" />
              </div>
              <div>
                <div class="text-xs font-extrabold text-slate-800 dark:text-slate-100">Organizer</div>
                <div class="text-[10px] text-slate-400">Scanner & Acara</div>
              </div>
            </div>
          </button>

          <!-- Demo Peserta -->
          <button 
            type="button"
            onclick={() => fillDemo('budi@gmail.com', 'Peserta')}
            class="p-3 rounded-2xl border text-left transition cursor-pointer {selectedDemoRole === 'Peserta' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'}">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center shrink-0">
                <User class="w-4 h-4" />
              </div>
              <div>
                <div class="text-xs font-extrabold text-slate-800 dark:text-slate-100">Peserta</div>
                <div class="text-[10px] text-slate-400">Beli Tiket & QR</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Tautan Registrasi di Bagian Bawah -->
    <div class="text-center text-xs text-slate-500 dark:text-slate-400 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
      Belum memiliki akun? 
      <a href="/auth/register" class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
        Daftar akun sekarang →
      </a>
    </div>
  </div>
</div>
