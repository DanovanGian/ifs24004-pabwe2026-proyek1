<script lang="ts">
  import { onMount } from 'svelte';
  import { apiRequest } from '#lib/api/client.ts';

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
    } catch (err) {
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadData();
  });
</script>

<div class="space-y-8">
  <!-- Banner Desktop -->
  <div class="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-10 text-white shadow-lg flex justify-between items-center">
    <div class="max-w-2xl space-y-3">
      <span class="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
        Platform Tiket Digital
      </span>
      <h1 class="text-4xl font-black tracking-tight">Temukan & Hadiri Acara Favoritmu</h1>
      <p class="text-indigo-100 text-base leading-relaxed">
        Pemesanan instan tanpa database pihak ketiga, cepat dengan pemrosesan memori backend berkecepatan tinggi.
      </p>
    </div>
    <div class="hidden lg:block text-7xl">🎟️</div>
  </div>

  <!-- Bar Pencarian & Filter Kategori Desktop -->
  <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
    <div class="flex-1 relative">
      <input 
        type="text" 
        bind:value={search} 
        oninput={loadData}
        placeholder="Cari nama acara atau topik..."
        class="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-indigo-600 bg-slate-50"
      />
    </div>

    <!-- Filter Kategori Kancing -->
    <div class="flex items-center gap-2">
      <button 
        onclick={() => { selectedCategory = ''; loadData(); }}
        class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer {selectedCategory === '' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
        Semua
      </button>
      {#each categories as cat}
        <button 
          onclick={() => { selectedCategory = cat.id; loadData(); }}
          class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer {selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          {cat.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Grid Acara Desktop (3 Kolom) -->
  {#if isLoading}
    <div class="text-center py-20 text-slate-400 font-medium">Memuat katalog acara...</div>
  {:else if events.length === 0}
    <div class="text-center py-20 bg-white rounded-2xl border border-slate-200">
      <p class="text-slate-500 font-semibold">Tidak ada acara yang cocok dengan kriteria pencarian.</p>
    </div>
  {:else}
    <div class="grid grid-cols-3 gap-6">
      {#each events as event}
        <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-start gap-2">
              <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                📍 {event.location}
              </span>
              <span class="text-xs font-semibold text-slate-400">
                {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div>
              <h3 class="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                {event.title}
              </h3>
              <p class="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            </div>

            <!-- Tiket Badge -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{event.ticketTypes?.length || 0} Jenis Tiket</span>
              <span class="font-bold text-indigo-600">
                Mulai Rp {Math.min(...(event.ticketTypes?.map((t: any) => t.price) || [0])).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-100">
            <a 
              href={`/events/${event.id}`}
              class="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs text-center rounded-xl transition shadow-xs">
              Lihat Detail & Pesan Tiket →
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
