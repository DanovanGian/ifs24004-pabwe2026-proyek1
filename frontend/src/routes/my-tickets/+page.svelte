<script lang="ts">
  import { onMount } from 'svelte';
  import { apiRequest } from '#lib/api/client.ts';
  import { auth } from '#lib/stores/auth.svelte.ts';

  let tickets = $state<any[]>([]);
  let isLoading = $state(true);

  async function loadMyTickets() {
    if (!auth.user) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await apiRequest('/my-tickets');
      tickets = res.data || [];
    } catch (err) {
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadMyTickets();
  });
</script>

<div class="max-w-5xl mx-auto space-y-6">
  <div>
    <h1 class="text-3xl font-black tracking-tight text-slate-900">Tiket Digital Saya</h1>
    <p class="text-slate-500 text-sm mt-1">Tunjukkan QR Code berikut di meja registrasi pada hari acara.</p>
  </div>

  {#if isLoading}
    <div class="text-center py-20 text-slate-400 font-medium">Memuat tiket...</div>
  {:else if tickets.length === 0}
    <div class="text-center py-20 bg-white rounded-3xl border border-slate-200">
      <p class="text-slate-600 font-semibold mb-3">Anda belum memiliki tiket acara.</p>
      <a href="/" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition">
        Eksplorasi Acara Sekarang
      </a>
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-6">
      {#each tickets as tkt}
        <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex justify-between items-center relative overflow-hidden">
          <!-- Status Ribbon -->
          <div class="absolute top-4 right-4">
            {#if tkt.isUsed}
              <span class="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black rounded-full uppercase">
                ✓ Sudah Check-In
              </span>
            {:else}
              <span class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-full uppercase">
                ● Siap Digunakan
              </span>
            {/if}
          </div>

          <!-- Data Tiket -->
          <div class="space-y-3 max-w-[280px]">
            <span class="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">{tkt.ticketTypeName}</span>
            <h3 class="font-extrabold text-lg text-slate-900 leading-snug">{tkt.eventTitle}</h3>
            
            <div class="text-xs text-slate-500 space-y-1">
              <div>📍 {tkt.eventLocation}</div>
              <div>📅 {new Date(tkt.eventDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</div>
            </div>

            <div class="pt-2 text-[10px] font-mono text-slate-400 truncate">
              ID: {tkt.qrToken}
            </div>
          </div>

          <!-- QR Code Display -->
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
            <img src={tkt.qrDataUrl} alt="QR Code Tiket" class="w-32 h-32 rounded-lg" />
            <span class="text-[10px] font-semibold text-slate-400 mt-1">Scan saat masuk</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
