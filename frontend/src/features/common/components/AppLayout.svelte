<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let user = $state<any>(null);

  $effect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      user = stored ? JSON.parse(stored) : null;
    }
  });

  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    user = null;
    goto('/auth/login');
  }
</script>

<div class="min-w-[1024px] min-h-screen bg-slate-50 text-slate-900 font-sans">
  <header class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-xs">
    <div class="flex items-center gap-10">
      <a href="/" class="text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
        <span>🎟️ Eventify</span>
      </a>

      <nav class="flex gap-6 text-sm font-semibold text-slate-600">
        <a href="/" class="hover:text-indigo-600 transition {page.url.pathname === '/' ? 'text-indigo-600 font-bold' : ''}">
          Katalog Acara
        </a>

        {#if user?.role === 'PARTICIPANT'}
          <a href="/my-tickets" class="hover:text-indigo-600 transition {page.url.pathname.startsWith('/my-tickets') ? 'text-indigo-600 font-bold' : ''}">
            Tiket Saya
          </a>
        {/if}

        {#if user?.role === 'ORGANIZER'}
          <a href="/dashboard/organizer" class="hover:text-indigo-600 transition text-indigo-600 font-bold">
            Organizer Panel
          </a>
        {/if}

        {#if user?.role === 'ADMIN'}
          <a href="/dashboard/admin" class="hover:text-rose-600 transition text-rose-600 font-bold">
            Admin Panel
          </a>
        {/if}
      </nav>
    </div>

    <div class="flex items-center gap-4">
      {#if user}
        <div class="text-right">
          <div class="text-sm font-bold text-slate-800">{user.name}</div>
          <span class="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700">
            {user.role}
          </span>
        </div>
        <button
          onclick={handleLogout}
          class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100 transition cursor-pointer text-slate-600">
          Keluar
        </button>
      {:else}
        <a href="/auth/login" class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          Masuk
        </a>
        <a href="/auth/register" class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
          Daftar
        </a>
      {/if}
    </div>
  </header>

  <main class="p-8 max-w-7xl mx-auto">
    {@render children()}
  </main>
</div>
