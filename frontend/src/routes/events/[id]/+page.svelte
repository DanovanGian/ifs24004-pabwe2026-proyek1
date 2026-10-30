<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { formatRupiah } from '../../../helpers/toolsHelper.ts';
  import { Calendar, MapPin, Sparkles, CheckCircle2 } from 'lucide-svelte';
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
        text: 'Tiket digital Anda telah terbit dan siap digunakan.',
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
</script>

{#if isLoading}
  <div class="text-center py-20 text-slate-400">Memuat rincian acara...</div>
{:else if event}
  <div class="max-w-5xl mx-auto space-y-8">
    <!-- Hero Banner Sampul Acara -->
    <div class="relative h-72 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-md">
      <img src={event.imageUrl || fallbackImage} alt={event.title} class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      <div class="absolute bottom-6 left-8 text-white space-y-2">
        <span class="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wide">
          {event.category?.name || 'Acara Pilihan'}
        </span>
        <h1 class="text-3xl font-black">{event.title}</h1>
      </div>
    </div>

    <!-- Grid Detail & Checkout -->
    <div class="grid grid-cols-3 gap-8">
      <div class="col-span-2 space-y-6">
        <div class="bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
          <div class="flex gap-6 text-xs text-slate-500 dark:text-slate-400 py-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div class="flex items-center gap-1.5"><Calendar class="w-4 h-4 text-indigo-500" /> {new Date(event.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
            <div class="flex items-center gap-1.5"><MapPin class="w-4 h-4 text-indigo-500" /> {event.location}</div>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tentang Acara</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        </div>
      </div>

      <div>
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4 sticky top-24">
          <h3 class="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/[0.06]">Pilih Tiket</h3>
          
          {#each event.ticketTypes as tkt}
            <label class="flex justify-between items-center p-3 border rounded-xl cursor-pointer transition {selectedTicketId === tkt.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40' : 'border-slate-200 dark:border-white/[0.08]'}">
              <div class="flex items-center gap-2.5">
                <input type="radio" bind:group={selectedTicketId} value={tkt.id} />
                <div>
                  <div class="font-bold text-xs text-slate-800 dark:text-slate-200">{tkt.name}</div>
                  <div class="text-[10px] text-slate-400">Sisa: {tkt.availableQuota} tiket</div>
                </div>
              </div>
              <div class="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">{formatRupiah(tkt.price)}</div>
            </label>
          {/each}

          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Jumlah</label>
            <input type="number" bind:value={quantity} min="1" max={selectedTicket?.availableQuota || 1} class="w-full px-3 py-2 border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm bg-slate-50 dark:bg-slate-800" />
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex justify-between font-bold">
            <span class="text-xs text-slate-400">Total Tagihan:</span>
            <span class="text-base text-indigo-600 dark:text-indigo-400">{formatRupiah((selectedTicket?.price || 0) * quantity)}</span>
          </div>

          <button onclick={handleOrder} class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
            Bayar Sekarang (Simulasi)
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
