<script lang="ts">
  import { onMount } from 'svelte';
  import { apiRequest } from '../helpers/apiHelper.ts';
  import { formatRupiah } from '../helpers/toolsHelper.ts';

  let events = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let search = $state('');
  let selectedCategory = $state('');
  let isLoading = $state(true);

  async function loadData() {
    isLoading = true;
    try {
      const catRes = await apiRequest('/events/categories');
      categories = catRes.data || [];

      let query = `?status=APPROVED`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) query += `&categoryId=${encodeURIComponent(selectedCategory)}`;

      const evtRes = await apiRequest(`/events${query}`);
      events = evtRes.data || [];
    } catch {
      // Handled by apiHelper
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadData();
  });
</script>

<div class="space-y-8">
  <div class="bg-gradient-to-r from-indigo-700 to-purple-600 rounded-3xl p-10 text-white shadow-lg flex justify-between items-center">
    <div class="max-w-2xl space-y-3">
      <span class="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
        Platform Tiket Digital
      </span>
      <h1 class="text-4xl font-black tracking-tight">Temukan & Hadiri Acara Favoritmu</h1>
      <p class="text-indigo-100 text-sm">Pemesanan instan dengan arsitektur modern SvelteKit & Bun.</p>
    </div>
    <div class="text-7xl">🎟️</div>
  </div>

  <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
    <input 
      type="text" 
      bind:value={search} 
      oninput={loadData}
      placeholder="Cari nama acara..."
      class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-indigo-600 bg-slate-50"
    />

    <div class="flex items-center gap-2">
      <button 
        onclick={() => { selectedCategory = ''; loadData(); }}
        class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer {selectedCategory === '' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}">
        Semua
      </button>
      {#each categories as cat}
        <button 
          onclick={() => { selectedCategory = cat.id; loadData(); }}
          class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer {selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}">
          {cat.name}
        </button>
      {/each}
    </div>
  </div>

  {#if isLoading}
    <div class="text-center py-20 text-slate-400 font-medium">Memuat katalog acara...</div>
  {:else if events.length === 0}
    <div class="text-center py-20 bg-white rounded-2xl border border-slate-200">
      <p class="text-slate-500 font-semibold">Tidak ada acara yang tersedia saat ini.</p>
    </div>
  {:else}
    <div class="grid grid-cols-3 gap-6">
      {#each events as event}
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div class="space-y-3">
            <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">📍 {event.location}</span>
            <h3 class="font-bold text-lg text-slate-900">{event.title}</h3>
            <p class="text-slate-500 text-xs line-clamp-2">{event.description}</p>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span class="text-xs font-bold text-indigo-600">
              {formatRupiah(Math.min(...(event.ticketTypes?.map((t: any) => t.price) || [0])))}
            </span>
            <a href={`/events/${event.id}`} class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">
              Detail →
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
