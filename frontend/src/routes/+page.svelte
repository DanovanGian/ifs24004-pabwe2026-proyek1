<script lang="ts">
  import { onMount } from 'svelte';
  import { apiRequest } from '../helpers/apiHelper.ts';
  import { formatRupiah } from '../helpers/toolsHelper.ts';
  import { Search, MapPin, Calendar, ArrowRight, Tag, Sparkles, Filter } from 'lucide-svelte';

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
      // Handled
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadData();
  });
</script>

<div class="space-y-10">
  <!-- Hero Section dengan Ambient Glow -->
  <div class="relative overflow-hidden rounded-3xl bg-slate-950 p-12 text-white shadow-2xl border border-slate-800">
    <div class="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-20 -bottom-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 max-w-2xl space-y-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold tracking-wide">
        <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
        Platform Tiket Digital & Verifikasi Cepat
      </div>
      <h1 class="text-4xl font-black tracking-tight leading-tight">
        Temukan Pengalaman & Hadiri Acara Terbaik.
      </h1>
      <p class="text-slate-400 text-sm leading-relaxed">
        Pemesanan instan dengan penerbitan QR Code otomatis dan verifikasi check-in sekali pakai di hari-H.
      </p>
    </div>
  </div>

  <!-- Search Bar & Kategori Bersebelahan -->
  <div class="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
    <div class="relative flex-1">
      <Search class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      <input 
        type="text" 
        bind:value={search} 
        oninput={loadData}
        placeholder="Cari acara berdasarkan nama atau topik..."
        class="w-full pl-11 pr-4 py-3 rounded-xl border-none bg-slate-50 text-xs font-medium focus:outline-indigo-600 focus:bg-white transition"
      />
    </div>

    <!-- Category Filter Pills -->
    <div class="flex items-center gap-1.5 pr-2">
      <button 
        onclick={() => { selectedCategory = ''; loadData(); }}
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {selectedCategory === '' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
        Semua Kategori
      </button>
      {#each categories as cat}
        <button 
          onclick={() => { selectedCategory = cat.id; loadData(); }}
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
          {cat.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Grid Acara Modern 3-Kolom -->
  {#if isLoading}
    <div class="text-center py-24 text-slate-400 font-medium">Memuat katalog acara eksklusif...</div>
  {:else if events.length === 0}
    <div class="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <Calendar class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-slate-700 font-bold">Tidak ada acara yang cocok</p>
      <p class="text-slate-400 text-xs mt-1">Coba gunakan kata kunci pencarian atau filter kategori lainnya.</p>
    </div>
  {:else}
    <div class="grid grid-cols-3 gap-8">
      {#each events as event}
        <div class="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
          <div class="p-7 space-y-5">
            <!-- Header Card (Location & Date Tag) -->
            <div class="flex justify-between items-center text-xs">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                <MapPin class="w-3 h-3" />
                {event.location}
              </span>
              <span class="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                <Calendar class="w-3 h-3" />
                {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <!-- Title & Description -->
            <div>
              <h3 class="font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                {event.title}
              </h3>
              <p class="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            </div>

            <!-- Ticket Tiers Overview -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-400 font-medium flex items-center gap-1">
                <Tag class="w-3.5 h-3.5" />
                {event.ticketTypes?.length || 0} Jenis Tiket
              </span>
              <div class="text-right">
                <span class="text-[10px] text-slate-400 block font-semibold">Mulai dari</span>
                <span class="font-black text-sm text-indigo-600">
                  {formatRupiah(Math.min(...(event.ticketTypes?.map((t: any) => t.price) || [0])))}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="p-5 bg-slate-50/70 border-t border-slate-100">
            <a 
              href={`/events/${event.id}`}
              class="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md">
              <span>Pesan Tiket Sekarang</span>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
