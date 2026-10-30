<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { formatRupiah } from '../../../helpers/toolsHelper.ts';
  import Swal from 'sweetalert2';

  // Mengikuti aturan lab: parameter rute diambil dari $derived(page.params...)
  let eventId = $derived(page.params.id);

  let event = $state<any>(null);
  let selectedTicketId = $state('');
  let quantity = $state(1);
  let isLoading = $state(true);

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
        title: 'Berhasil!',
        text: 'Pembayaran simulasi sukses, tiket digital telah dibuat.',
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
  <div class="max-w-5xl mx-auto grid grid-cols-3 gap-8">
    <div class="col-span-2 space-y-6">
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <span class="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase">
          Acara Terverifikasi
        </span>
        <h1 class="text-3xl font-extrabold text-slate-900">{event.title}</h1>
        <div class="flex gap-6 text-sm text-slate-500 py-2 border-y border-slate-100">
          <div>📅 {new Date(event.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
          <div>📍 {event.location}</div>
        </div>
        <p class="text-slate-600 text-sm leading-relaxed">{event.description}</p>
      </div>
    </div>

    <div>
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 sticky top-8">
        <h3 class="font-bold text-lg text-slate-900 pb-2 border-b border-slate-100">Pesan Tiket</h3>
        {#each event.ticketTypes as tkt}
          <label class="flex justify-between items-center p-3 border rounded-xl cursor-pointer {selectedTicketId === tkt.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'}">
            <div class="flex items-center gap-2">
              <input type="radio" bind:group={selectedTicketId} value={tkt.id} />
              <div>
                <div class="font-bold text-xs">{tkt.name}</div>
                <div class="text-[10px] text-slate-400">Sisa: {tkt.availableQuota}</div>
              </div>
            </div>
            <div class="font-bold text-xs text-indigo-600">{formatRupiah(tkt.price)}</div>
          </label>
        {/each}

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Jumlah Tiket</label>
          <input type="number" bind:value={quantity} min="1" max={selectedTicket?.availableQuota || 1} class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatRupiah((selectedTicket?.price || 0) * quantity)}</span>
        </div>

        <button onclick={handleOrder} class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl">
          Bayar Sekarang (Simulasi)
        </button>
      </div>
    </div>
  </div>
{/if}
