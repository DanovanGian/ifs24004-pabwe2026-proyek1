<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { initTheme, toggleTheme } from '../../../helpers/themeHelper.ts';
  import { 
    Ticket, ArrowRight, User, Briefcase, 
    Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck,
    ArrowLeft, Sun, Moon
  } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let role = $state<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT');
  let showPassword = $state(false);
  let isLoading = $state(false);
  let currentTheme = $state<'light' | 'dark'>('light');

  onMount(() => {
    currentTheme = initTheme();
  });

  function handleTheme() {
    currentTheme = toggleTheme();
  }

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();
    isLoading = true;

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil',
        text: 'Akun Anda telah aktif! Mengalihkan ke halaman masuk...',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        goto('/auth/login');
      }, 1000);
    } catch {
      // Handled otomatis oleh apiHelper (Swal)
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen w-full grid grid-cols-12 bg-white dark:bg-[#090D16]">
  
  <!-- SISI KIRI: BRAND SHOWCASE KHUSUS PENGGUNA BARU (5 Kolom) -->
  <div class="col-span-5 relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-12 text-white flex flex-col justify-between overflow-hidden border-r border-slate-800 shadow-2xl">
    <!-- Ambient Radial Glows -->
    <div class="absolute -right-24 -top-24 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-24 -bottom-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

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

    <!-- Hero Konten Registrasi -->
    <div class="relative z-10 my-auto py-10 space-y-6">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-bold tracking-wide backdrop-blur-md">
        <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
        Daftar Cepat dalam 30 Detik
      </div>

      <h1 class="text-4xl font-black leading-tight text-white tracking-tight">
        Mulai Perjalanan & Rayakan Setiap Momen.
      </h1>

      <p class="text-slate-300 text-sm leading-relaxed max-w-md">
        Bergabunglah bersama ribuan peserta dan penyelenggara acara terbaik di seluruh Indonesia.
      </p>

      <!-- Keuntungan Bergabung Card -->
      <div class="space-y-3 pt-2">
        <div class="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Ticket class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold text-white">Tiket Digital Berbasis QR</div>
            <div class="text-[10px] text-slate-400">Langsung tersimpan rapi di dashboard akun Anda.</div>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Briefcase class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold text-white">Pilihan Peran Organizer</div>
            <div class="text-[10px] text-slate-400">Kemudahan publikasi acara dan scanner kamera hari-H.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Kiri -->
    <div class="relative z-10 flex items-center gap-8 text-xs text-slate-400 pt-6 border-t border-white/10">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-emerald-400" />
        <span>Enkripsi Sandi Mutakhir</span>
      </div>
      <div class="flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-indigo-400" />
        <span>Akses Seumur Hidup</span>
      </div>
    </div>
  </div>

  <!-- SISI KANAN: FORMULIR REGISTRASI PENUH (7 Kolom) -->
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

    <!-- Form Tengah -->
    <div class="max-w-lg w-full mx-auto my-auto py-6">
      <div class="mb-6">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Buat Akun Baru</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Lengkapi formulir di bawah untuk memulai reservasi atau mengelola acara.</p>
      </div>

      <form onsubmit={handleRegister} class="space-y-4">
        <!-- Input Nama Lengkap -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Nama Lengkap</label>
          <div class="relative">
            <User class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              bind:value={name} 
              required 
              placeholder="Contoh: Budi Pratama" 
              class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800/60 text-xs font-medium focus:outline-indigo-600 dark:focus:outline-indigo-400 text-slate-900 dark:text-white transition"
            />
          </div>
        </div>

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
              class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800/60 text-xs font-medium focus:outline-indigo-600 dark:focus:outline-indigo-400 text-slate-900 dark:text-white transition"
            />
          </div>
        </div>

        <!-- Input Password -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Kata Sandi</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              bind:value={password} 
              required 
              placeholder="Minimal 6 karakter" 
              class="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800/60 text-xs font-medium focus:outline-indigo-600 dark:focus:outline-indigo-400 text-slate-900 dark:text-white transition"
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

        <!-- Kartu Pemilih Peran Interaktif (Role Selector) -->
        <div class="pt-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Daftar Sebagai Peran</label>
          <div class="grid grid-cols-2 gap-3">
            <!-- Kartu Peserta -->
            <button 
              type="button"
              onclick={() => role = 'PARTICIPANT'}
              class="p-3.5 rounded-2xl border text-left transition cursor-pointer {role === 'PARTICIPANT' ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'}">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center shrink-0">
                  <User class="w-4 h-4" />
                </div>
                <div class="text-xs font-black text-slate-900 dark:text-white">Peserta Acara</div>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Membeli tiket digital dan menghadiri acara.
              </p>
            </button>

            <!-- Kartu Organizer -->
            <button 
              type="button"
              onclick={() => role = 'ORGANIZER'}
              class="p-3.5 rounded-2xl border text-left transition cursor-pointer {role === 'ORGANIZER' ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'}">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center shrink-0">
                  <Briefcase class="w-4 h-4" />
                </div>
                <div class="text-xs font-black text-slate-900 dark:text-white">Penyelenggara</div>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Publikasi acara & validasi tiket via scanner.
              </p>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
          <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>
    </div>

    <!-- Tautan Kembali ke Login di Bawah -->
    <div class="text-center text-xs text-slate-500 dark:text-slate-400 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
      Sudah memiliki akun? 
      <a href="/auth/login" class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
        Masuk ke akun Anda →
      </a>
    </div>
  </div>
</div>
