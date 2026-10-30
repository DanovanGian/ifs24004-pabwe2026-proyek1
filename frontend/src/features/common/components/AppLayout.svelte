<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import type { Snippet } from 'svelte';
  import { Ticket, Calendar, Shield, LayoutDashboard, LogOut, Sparkles, Sun, Moon } from 'lucide-svelte';
  import { initTheme, toggleTheme } from '../../../helpers/themeHelper.ts';

  let { children }: { children: Snippet } = $props();
  let user = $state<any>(null);
  let currentTheme = $state<'light' | 'dark'>('light');

  onMount(() => {
    currentTheme = initTheme();
    const stored = localStorage.getItem('user');
    user = stored ? JSON.parse(stored) : null;
  });

  function handleThemeChange() {
    currentTheme = toggleTheme();
  }

  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    user = null;
    goto('/auth/login');
  }
</script>

<div class="min-w-[1024px] min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
  <!-- Desktop Sticky Header -->
  <header class="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-10 py-3.5 flex justify-between items-center shadow-xs">
    <div class="flex items-center gap-12">
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-2.5 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
          <Ticket class="w-5 h-5 -rotate-12" />
        </div>
        <div>
          <span class="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">Eventify</span>
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 block -mt-1">Pass Platform</span>
        </div>
      </a>

      <!-- Desktop Navigation Menu -->
      <nav class="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold text-slate-600 dark:text-slate-300">
        <a href="/" class="flex items-center gap-1.5 px-4 py-2 rounded-lg transition {page.url.pathname === '/' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}">
          <Calendar class="w-3.5 h-3.5" />
          Katalog Acara
        </a>

        {#if user?.role === 'PARTICIPANT'}
          <a href="/my-tickets" class="flex items-center gap-1.5 px-4 py-2 rounded-lg transition {page.url.pathname.startsWith('/my-tickets') ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}">
            <Ticket class="w-3.5 h-3.5" />
            Tiket Saya
          </a>
        {/if}

        {#if user?.role === 'ORGANIZER'}
          <a href="/dashboard/organizer" class="flex items-center gap-1.5 px-4 py-2 rounded-lg transition {page.url.pathname.startsWith('/dashboard/organizer') ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-600 dark:text-indigo-400 hover:bg-white/60 dark:hover:bg-slate-700/60'}">
            <LayoutDashboard class="w-3.5 h-3.5" />
            Organizer Panel
          </a>
        {/if}

        {#if user?.role === 'ADMIN'}
          <a href="/dashboard/admin" class="flex items-center gap-1.5 px-4 py-2 rounded-lg transition {page.url.pathname.startsWith('/dashboard/admin') ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600 dark:text-rose-400 hover:bg-white/60 dark:hover:bg-slate-700/60'}">
            <Shield class="w-3.5 h-3.5" />
            Admin Panel
          </a>
        {/if}
      </nav>
    </div>

    <!-- Right Controls: Dark Mode Toggle & User Profile -->
    <div class="flex items-center gap-4">
      <!-- Dark Mode Switcher Button -->
      <button 
        onclick={handleThemeChange} 
        aria-label="Ganti Mode Tampilan"
        class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition cursor-pointer shadow-xs">
        {#if currentTheme === 'dark'}
          <Sun class="w-4 h-4 transition-transform rotate-0 scale-100" />
        {:else}
          <Moon class="w-4 h-4 transition-transform text-slate-600" />
        {/if}
      </button>

      {#if user}
        <div class="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
            {user.name.charAt(0)}
          </div>
          <div class="text-left">
            <div class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">{user.name}</div>
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-sm inline-block mt-1">
              {user.role}
            </span>
          </div>
          <button
            onclick={handleLogout}
            title="Keluar Akun"
            class="ml-2 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer">
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      {:else}
        <div class="flex items-center gap-3">
          <a href="/auth/login" class="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Masuk
          </a>
          <a href="/auth/register" class="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition hover:-translate-y-0.5">
            <Sparkles class="w-3.5 h-3.5" />
            Daftar Sekarang
          </a>
        </div>
      {/if}
    </div>
  </header>

  <!-- Main Work Area -->
  <main class="flex-1 p-10 max-w-7xl w-full mx-auto">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 px-10 text-xs text-slate-400 dark:text-slate-500 flex justify-between items-center mt-12 transition-colors">
    <div>
      <span class="font-bold text-slate-600 dark:text-slate-300">Eventify Desktop</span> • Platform Manajemen Tiket Digital
    </div>
    <div class="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
      <span>Keamanan Argon2id</span>
      <span>•</span>
      <span>QR Check-in Anti-Double</span>
      <span>•</span>
      <span>Tema Adaptif</span>
    </div>
  </footer>
</div>
