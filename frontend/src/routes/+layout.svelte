<script lang="ts">
  import '../app.css';
  import { auth } from '#lib/stores/auth.svelte.ts';
  let { children } = $props();
</script>

<div class="min-w-[1024px] min-h-screen bg-slate-50 text-slate-900 font-sans">
  <!-- Desktop Wide Header -->
  <header class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-xs">
    <div class="flex items-center gap-10">
      <a href="/" class="text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
        <span>🎟️ Eventify</span>
      </a>
      
      <nav class="flex gap-6 text-sm font-semibold text-slate-600">
        <a href="/" class="hover:text-indigo-600 transition">Katalog Acara</a>
        
        {#if auth.user}
          {#if auth.user.role === 'PARTICIPANT'}
            <a href="/my-tickets" class="hover:text-indigo-600 transition">Tiket Saya</a>
          {/if}
          
          {#if auth.user.role === 'ORGANIZER'}
            <a href="/dashboard/organizer" class="hover:text-indigo-600 transition text-indigo-600">Organizer Panel</a>
          {/if}

          {#if auth.user.role === 'ADMIN'}
            <a href="/dashboard/admin" class="hover:text-indigo-600 transition text-rose-600">Admin Panel</a>
          {/if}
        {/if}
      </nav>
    </div>

    <!-- User Profile / Auth Action -->
    <div class="flex items-center gap-4">
      {#if auth.user}
        <div class="text-right">
          <div class="text-sm font-bold text-slate-800">{auth.user.name}</div>
          <span class="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700">
            {auth.user.role}
          </span>
        </div>
        <button 
          onclick={() => auth.logout()}
          class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100 transition cursor-pointer text-slate-600">
          Keluar
        </button>
      {:else}
        <a href="/login" class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
          Masuk
        </a>
        <a href="/register" class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
          Daftar
        </a>
      {/if}
    </div>
  </header>

  <!-- Konten Utama Desktop -->
  <main class="p-8 max-w-7xl mx-auto">
    {@render children()}
  </main>
</div>
