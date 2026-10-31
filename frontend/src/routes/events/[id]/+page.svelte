<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { formatRupiah } from '../../../helpers/toolsHelper.ts';
  import { Calendar, MapPin, Sparkles, Armchair, Building2, Trophy, Tag } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let eventId = $derived(page.params.id);

  let event = $state<any>(null);
  let selectedTicketId = $state('');
  let quantity = $state(1);
  let isLoading = $state(true);
  const fallbackImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000';

  async function loadEvent() {
    try {
      const res = await apiRequest(`/events/${eventId}`);
      event = res.data;
      if (event?.ticketTypes?.length > 0) {
        selectedTicketId = event.ticketTypes[0].id;
      }
    } catch {
      // Handled
    } finally {
      isLoading = false;
    }
  }

  async function handleOrder() {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Harap Masuk',
        text: 'Silakan login terlebih dahulu untuk memesan tiket!',
      });
      goto('/auth/login');
      return;
    }

    try {
      const regRes = await apiRequest('/registrations', {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          ticketTypeId: selectedTicketId,
          quantity: Number(quantity),
        }),
      });

      await apiRequest('/payments/simulate', {
        method: 'POST',
        body: JSON.stringify({ registrationId: regRes.data.registration.id }),
      });

      Swal.fire({
        icon: 'success',
        title: 'Pembayaran Berhasil!',
        text: 'Tiket & nomor kursi resmi Anda telah diterbitkan.',
      });

      goto('/my-tickets');
    } catch {
      // Handled
    }
  }

  onMount(() => {
    loadEvent();
  });

  let selectedTicket = $derived(
    event?.ticketTypes?.find((t: any) => t.id === selectedTicketId)
  );

  // Deteksi Otomatis Zona Kursi yang Harus Menyala
  let isVipSelected = $derived(
    selectedTicket?.name.toLowerCase().includes('vip')
  );

  let isFestivalSelected = $derived(
    selectedTicket?.name.toLowerCase().includes('festival') || selectedTicket?.name.toLowerCase().includes('standing')
  );
</script>

{#if isLoading}
  <div class="text-center py-24 text-slate-400">Memuat rincian acara & denah kursi...</div>
{:else if event}
  <div class="max-w-5xl mx-auto space-y-8">
    <!-- Hero Banner Sampul Acara -->
    <div class="relative h-72 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-md">
      <img src={event.imageUrl || fallbackImage} alt={event.title} class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
      <div class="absolute bottom-6 left-8 text-white space-y-2">
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wide">
            {event.category?.name || 'Acara Pilihan'}
          </span>
          <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
            {#if event.layoutType === 'STADIUM'}
              <Trophy class="w-3.5 h-3.5 text-amber-400" />
              <span>Stadion Tenis Indoor Senayan</span>
            {:else if event.layoutType === 'BALLROOM'}
              <Building2 class="w-3.5 h-3.5 text-purple-400" />
              <span>Balai Pertemuan (Grand Ballroom)</span>
            {:else}
              <Armchair class="w-3.5 h-3.5 text-indigo-400" />
              <span>Auditorium Teater</span>
            {/if}
          </span>
        </div>
        <h1 class="text-3xl font-black">{event.title}</h1>
      </div>
    </div>

    <!-- Grid Detail & Checkout -->
    <div class="grid grid-cols-12 gap-8">
      
      <!-- KOLOM KIRI: DENAH TEMPAT DUDUK INTERAKTIF & DESKRIPSI (7 Kolom) -->
      <div class="col-span-7 space-y-6">
        
        <!-- SEATING MAP -->
        <div class="bg-white dark:bg-[#0F172A] p-7 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-5">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>🪑 Denah Tata Letak Tempat Duduk</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  Live View
                </span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Zona kursi akan otomatis menyala mengikuti jenis tiket yang Anda pilih.
              </p>
            </div>
          </div>

          <!-- KANVAS DENAH INTERAKTIF -->
          <div class="p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-6 relative overflow-hidden">
            <!-- Panggung / Stage Utama -->
            <div class="w-3/4 mx-auto py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl text-center text-xs font-black tracking-widest text-white shadow-lg shadow-indigo-500/30 uppercase">
              ★ PANGGUNG UTAMA (MAIN STAGE) ★
            </div>

            <!-- DENAH 1: MODEL AUDITORIUM -->
            {#if event.layoutType === 'AUDITORIUM' || !event.layoutType}
              <div class="space-y-4 pt-2">
                <!-- Baris VIP (Depan) -->
                <div class="p-3.5 rounded-xl border transition-all duration-300 {isVipSelected ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/50' : 'border-white/10 bg-white/[0.03]'}">
                  <div class="flex justify-between text-[11px] font-bold mb-2 {isVipSelected ? 'text-amber-300 font-extrabold' : 'text-slate-400'}">
                    <span>👑 ZONA VIP (BARIS A - B)</span>
                    <span>Paling Dekat Panggung</span>
                  </div>
                  <div class="grid grid-cols-10 gap-1.5">
                    {#each Array(20) as _, i}
                      <div class="h-5 rounded-md flex items-center justify-center text-[9px] font-bold {isVipSelected ? 'bg-amber-400 text-slate-950 font-black scale-105' : 'bg-slate-800 text-slate-500'}">
                        {i + 1}
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Baris Reguler (Belakang) -->
                <div class="p-3.5 rounded-xl border transition-all duration-300 {!isVipSelected ? 'border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/50' : 'border-white/10 bg-white/[0.03]'}">
                  <div class="flex justify-between text-[11px] font-bold mb-2 {!isVipSelected ? 'text-indigo-300 font-extrabold' : 'text-slate-400'}">
                    <span>🎟️ ZONA REGULER (BARIS C - E)</span>
                    <span>Tingkat Menengah & Balcony</span>
                  </div>
                  <div class="grid grid-cols-10 gap-1.5">
                    {#each Array(30) as _, i}
                      <div class="h-5 rounded-md flex items-center justify-center text-[9px] font-bold {!isVipSelected ? 'bg-indigo-500 text-white font-black' : 'bg-slate-800 text-slate-500'}">
                        {i + 1}
                      </div>
                    {/each}
                  </div>
                </div>
              </div>

            <!-- DENAH 2: MODEL BALAI PERTEMUAN (GRAND BALLROOM ROUND TABLES) -->
            {:else if event.layoutType === 'BALLROOM'}
              <div class="space-y-4 pt-2">
                <!-- Meja Bundar VIP -->
                <div class="p-3.5 rounded-xl border transition-all duration-300 {isVipSelected ? 'border-purple-400 bg-purple-500/20 ring-2 ring-purple-400/50' : 'border-white/10 bg-white/[0.03]'}">
                  <div class="text-[11px] font-bold mb-3 {isVipSelected ? 'text-purple-300' : 'text-slate-400'}">
                    👑 MEJA BUNDAR VIP EKSKLUSIF (TABLE 1 - 4)
                  </div>
                  <div class="grid grid-cols-4 gap-3 text-center">
                    {#each [1, 2, 3, 4] as table}
                      <div class="p-3 rounded-full aspect-square border flex flex-col items-center justify-center {isVipSelected ? 'border-purple-400 bg-purple-500/40 text-white' : 'border-slate-800 bg-slate-900 text-slate-500'}">
                        <span class="text-[10px] font-bold">Meja {table}</span>
                        <span class="text-[8px] text-purple-300">VIP</span>
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Meja Bundar Reguler -->
                <div class="p-3.5 rounded-xl border transition-all duration-300 {!isVipSelected ? 'border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/50' : 'border-white/10 bg-white/[0.03]'}">
                  <div class="text-[11px] font-bold mb-3 {!isVipSelected ? 'text-indigo-300' : 'text-slate-400'}">
                    🍽️ MEJA BUNDAR REGULER & DELEGASI (TABLE 5 - 12)
                  </div>
                  <div class="grid grid-cols-4 gap-3 text-center">
                    {#each [5, 6, 7, 8, 9, 10, 11, 12] as table}
                      <div class="p-3 rounded-full aspect-square border flex flex-col items-center justify-center {!isVipSelected ? 'border-indigo-400 bg-indigo-500/40 text-white' : 'border-slate-800 bg-slate-900 text-slate-500'}">
                        <span class="text-[10px] font-bold">Meja {table}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>

            <!-- DENAH 3: MODEL TENIS INDOOR SENAYAN (STADION ARENA & TRIBUN) -->
            {:else}
              <div class="space-y-3 pt-2">
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-2.5 rounded-xl border text-center {!isVipSelected && !isFestivalSelected ? 'border-indigo-400 bg-indigo-500/30 text-indigo-300 ring-2 ring-indigo-400/50' : 'border-white/10 text-slate-500'}">
                    <span class="text-[10px] font-bold block">TRIBUN BARAT</span>
                    <span class="text-[8px]">Seating Area</span>
                  </div>

                  <!-- Courtside / Festival Tengah -->
                  <div class="p-3 rounded-xl border text-center transition-all duration-300 {isVipSelected || isFestivalSelected ? 'border-amber-400 bg-amber-500/40 text-amber-300 ring-2 ring-amber-400/50 scale-105' : 'border-white/10 text-slate-500'}">
                    <span class="text-[10px] font-black block">👑 FESTIVAL / COURTSIDE</span>
                    <span class="text-[8px]">Area Lapangan Tengah</span>
                  </div>

                  <div class="p-2.5 rounded-xl border text-center {!isVipSelected && !isFestivalSelected ? 'border-indigo-400 bg-indigo-500/30 text-indigo-300 ring-2 ring-indigo-400/50' : 'border-white/10 text-slate-500'}">
                    <span class="text-[10px] font-bold block">TRIBUN TIMUR</span>
                    <span class="text-[8px]">Seating Area</span>
                  </div>
                </div>

                <div class="p-2.5 rounded-xl border text-center {!isVipSelected && !isFestivalSelected ? 'border-indigo-400 bg-indigo-500/30 text-indigo-300 ring-2 ring-indigo-400/50' : 'border-white/10 text-slate-500'}">
                  <span class="text-[10px] font-bold">TRIBUN UTARA & ATAS (REGULER STADIUM SEATS)</span>
                </div>
              </div>
            {/if}

            <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>* Zona yang menyala adalah area kursi untuk tiket terpilih</span>
              <span class="font-bold text-amber-400">Nomor Kursi Resmi Dicetak pada Tiket</span>
            </div>
          </div>
        </div>

        <!-- Deskripsi Acara -->
        <div class="bg-white dark:bg-[#0F172A] p-7 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
          <div class="flex gap-6 text-xs text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-white/[0.06]">
            <div class="flex items-center gap-1.5"><Calendar class="w-4 h-4 text-indigo-500" /> {new Date(event.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
            <div class="flex items-center gap-1.5"><MapPin class="w-4 h-4 text-indigo-500" /> {event.location}</div>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tentang Acara</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN: PILIHAN SELURUH TIKET DINAMIS & CHECKOUT (5 Kolom) -->
      <div class="col-span-5">
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4 sticky top-24">
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">
              Pilih Kategori Tiket
            </h3>
            <p class="text-[11px] text-slate-400">Tersedia {event.ticketTypes?.length || 0} kategori tiket untuk acara ini.</p>
          </div>
          
          <!-- DAFTAR SEMUA TIKET DINAMIS YANG DIBUAT ORGANIZER -->
          <div class="space-y-2.5">
            {#each event.ticketTypes as tkt}
              <label class="flex justify-between items-center p-3.5 border rounded-2xl cursor-pointer transition {selectedTicketId === tkt.id ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/50' : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300'}">
                <div class="flex items-center gap-3">
                  <input type="radio" bind:group={selectedTicketId} value={tkt.id} class="text-indigo-600" />
                  <div>
                    <div class="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{tkt.name}</span>
                      {#if tkt.name.toLowerCase().includes('vip')}
                        <span class="px-1.5 py-0.2 bg-amber-400/20 text-amber-500 text-[9px] rounded font-black">VIP</span>
                      {/if}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Sisa Kuota: <strong>{tkt.availableQuota}</strong> tiket</div>
                  </div>
                </div>
                <div class="font-black text-sm text-indigo-600 dark:text-indigo-400">{formatRupiah(tkt.price)}</div>
              </label>
            {/each}
          </div>

          <div>
            <label for="ticket-qty-input" class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Jumlah Tiket</label>
            <input id="ticket-qty-input" type="number" bind:value={quantity} min="1" max={selectedTicket?.availableQuota || 1} class="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm bg-slate-50 dark:bg-slate-800" />
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex justify-between font-bold">
            <span class="text-xs text-slate-400">Total Tagihan:</span>
            <span class="text-base text-indigo-600 dark:text-indigo-400">{formatRupiah((selectedTicket?.price || 0) * quantity)}</span>
          </div>

          <button onclick={handleOrder} class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
            Bayar Sekarang (Simulasi)
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
