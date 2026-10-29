<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { apiRequest } from '#lib/api/client.ts';
  import { auth } from '#lib/stores/auth.svelte.ts';

  const eventId = page.params.id;
  let event = $state<any>(null);
  let selectedTicketId = $state<string>('');
  let quantity = $state(1);
  let isLoading = $state(true);
  let isOrdering = $state(false);
  let message = $state('');

  async function loadEvent() {
    try {
      const res = await apiRequest(`/events/${eventId}`);
      event = res.data;
      if (event.ticketTypes?.length > 0) {
        selectedTicketId = event.ticketTypes[0].id;
      }
    } catch (err: any) {
      message = err.message;
    } finally {
      isLoading = false;
    }
  }

  async function handleOrderAndPay() {
    if (!auth.user) {
      alert('Silakan login terlebih dahulu untuk memesan tiket!');
      window.location.href = '/login';
      return;
    }

    isOrdering = true;
    message = '';

    try {
      // 1. Buat Registrasi
      const regRes = await apiRequest('/registrations', {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          ticketTypeId: selectedTicketId,
          quantity: Number(quantity)
        })
      });

      const registrationId = regRes.data.registration.id;

      // 2. Simulasi Pembayaran Langsung Sukses
      await apiRequest('/payments/simulate', {
        method: 'POST',
        body: JSON.stringify({ registrationId })
      });

      alert('🎉 Pembayaran Berhasil! Tiket digital Anda telah diterbitkan.');
      window.location.href = '/my-tickets';
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    } finally {
      isOrdering = false;
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
  <div class="text-center py-20 text-slate-400 font-semibold">Memuat detail acara...</div>
{:else if event}
  <div class="max-w-5xl mx-auto grid grid-cols-3 gap-8">
    <!-- Kolom Kiri: Detail Lengkap -->
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

        <div>
          <h3 class="text-sm font-bold text-slate-800 uppercase mb-2">Tentang Acara Ini</h3>
          <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      </div>
    </div>

    <!-- Kolom Kanan: Panel Checkout Tiket Desktop -->
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-8">
        <h3 class="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">Pesan Tiket</h3>

        <!-- Pilihan Jenis Tiket -->
        <div class="space-y-3">
          <label class="block text-xs font-bold text-slate-600 uppercase">Pilih Kategori Tiket</label>
          {#each event.ticketTypes as tkt}
            <label class="flex justify-between items-center p-3.5 border rounded-2xl cursor-pointer transition {selectedTicketId === tkt.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}">
              <div class="flex items-center gap-3">
                <input type="radio" bind:group={selectedTicketId} value={tkt.id} class="text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <div class="font-bold text-sm text-slate-800">{tkt.name}</div>
                  <div class="text-xs text-slate-400">Sisa: {tkt.availableQuota} tiket</div>
                </div>
              </div>
              <div class="font-extrabold text-sm text-indigo-600">
                Rp {tkt.price.toLocaleString('id-ID')}
              </div>
            </label>
          {/each}
        </div>

        <!-- Jumlah Tiket -->
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Jumlah</label>
          <input 
            type="number" 
            bind:value={quantity} 
            min="1" 
            max={selectedTicket?.availableQuota || 1}
            class="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-indigo-600"
          />
        </div>

        <!-- Rincian Total -->
        <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
          <span class="text-sm text-slate-500 font-medium">Total Tagihan:</span>
          <span class="text-xl font-black text-slate-900">
            Rp {((selectedTicket?.price || 0) * quantity).toLocaleString('id-ID')}
          </span>
        </div>

        <button 
          onclick={handleOrderAndPay}
          disabled={isOrdering || !selectedTicket || selectedTicket.availableQuota < 1}
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer">
          {isOrdering ? 'Memproses Tiket...' : 'Bayar Sekarang (Simulasi)'}
        </button>

        <p class="text-[11px] text-center text-slate-400">
          Pembayaran disimulasikan otomatis tanpa kartu kredit riil.
        </p>
      </div>
    </div>
  </div>
{/if}
