<script lang="ts">
  import { onMount } from 'svelte';
  import { apiRequest } from '../helpers/apiHelper.ts';
  import { formatRupiah } from '../helpers/toolsHelper.ts';
  import { Search, MapPin, Calendar, ArrowRight, Tag, Sparkles } from 'lucide-svelte';

  let events = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let search = $state('');
  let selectedCategory = $state('');
  let isLoading = $state(true);

  const fallbackImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000';

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
  <!-- Hero Section -->
  <div class="relative overflow-hidden rounded-3xl bg-[#0B0F19] p-12 text-white shadow-2xl border border-white/[0.08]">
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

  <!-- Search Bar & Kategori -->
  <div class="bg-white dark:bg-[#0F172A] p-3 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm flex items-center gap-4">
    <div class="relative flex-1">
      <Search class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      <input 
        type="text" 
        bind:value={search} 
        oninput={loadData}
        placeholder="Cari acara berdasarkan nama atau topik..."
        class="w-full pl-11 pr-4 py-3 rounded-xl border-none bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition"
      />
    </div>

    <!-- Category Filter Pills -->
    <div class="flex items-center gap-1.5 pr-2">
      <button 
        onclick={() => { selectedCategory = ''; loadData(); }}
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {selectedCategory === '' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
        Semua Kategori
      </button>
      {#each categories as cat}
        <button 
          onclick={() => { selectedCategory = cat.id; loadData(); }}
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}">
          {cat.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Grid Acara Modern 3-Kolom dengan Foto Sampul -->
  {#if isLoading}
    <div class="text-center py-24 text-slate-400 font-medium">Memuat katalog acara...</div>
  {:else if events.length === 0}
    <div class="text-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
      <Calendar class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <p class="text-slate-700 dark:text-slate-200 font-bold">Tidak ada acara yang cocok</p>
    </div>
  {:else}
    <div class="grid grid-cols-3 gap-8">
      {#each events as event}
        <div class="group bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-xs hover:shadow-2xl dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition duration-300 flex flex-col justify-between">
          
          <!-- Foto Sampul Acara -->
          <div class="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img 
              src={event.imageUrl || fallbackImage} 
              alt={event.title} 
              class="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
            />
            <div class="absolute top-3.5 left-3.5">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-[11px]">
                <MapPin class="w-3 h-3 text-indigo-400" />
                {event.location}
              </span>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <div class="text-xs text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5 text-indigo-500" />
              {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            <div>
              <h3 class="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug line-clamp-1">
                {event.title}
              </h3>
              <p class="text-slate-500 dark:text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
              <span class="text-slate-400 font-medium flex items-center gap-1">
                <Tag class="w-3.5 h-3.5" />
                {event.ticketTypes?.length || 0} Tiket
              </span>
              <div class="text-right">
                <span class="text-[10px] text-slate-400 block font-semibold">Mulai</span>
                <span class="font-black text-sm text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(Math.min(...(event.ticketTypes?.map((t: any) => t.price) || [0])))}
                </span>
              </div>
            </div>
          </div>

          <!-- Tombol Aksi -->
          <div class="p-5 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06]">
            <a 
              href={`/events/${event.id}`}
              class="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md">
              <span>Pesan Tiket</span>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
