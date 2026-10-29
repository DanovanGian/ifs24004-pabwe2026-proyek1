<script lang="ts">
  import { onMount } from 'svelte';
  import { apiRequest } from '#lib/api/client.ts';
  import { auth } from '#lib/stores/auth.svelte.ts';

  let summary = $state<any>(null);
  let pendingEvents = $state<any[]>([]);
  let isLoading = $state(true);

  async function loadAdminData() {
    try {
      // 1. Ambil Summary Metrik Platform
      const sumRes = await apiRequest('/dashboard/summary');
      summary = sumRes.data;

      // 2. Ambil Acara yang butuh Moderasi
      const evtRes = await apiRequest('/events?status=PENDING_APPROVAL');
      pendingEvents = evtRes.data || [];
    } catch (err: any) {
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  async function updateStatus(eventId: string, newStatus: 'APPROVED' | 'REJECTED') {
    try {
      await apiRequest(`/events/${eventId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      alert(`Acara berhasil di-${newStatus}`);
      loadAdminData();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  }

  onMount(() => {
    if (!auth.user || auth.user.role !== 'ADMIN') {
      alert('Akses Terbatas: Hanya untuk Administrator');
      window.location.href = '/login';
      return;
    }
    loadAdminData();
  });
</script>

<div class="max-w-6xl mx-auto space-y-8">
  <div>
    <h1 class="text-3xl font-black text-slate-900 tracking-tight">Admin Moderation & Analytics</h1>
    <p class="text-slate-500 text-sm mt-1">Pantau seluruh ekosistem transaksi dan setujui acara masuk.</p>
  </div>

  <!-- Statistik Global Kartu (4 Grid Desktop) -->
  {#if summary}
    <div class="grid grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-slate-400 text-xs font-bold uppercase">Total Pendapatan</div>
        <div class="text-2xl font-black text-indigo-600 mt-2">
          Rp {summary.totalRevenue.toLocaleString('id-ID')}
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-slate-400 text-xs font-bold uppercase">Tiket Terjual</div>
        <div class="text-2xl font-black text-slate-800 mt-2">
          {summary.totalTicketsSold} Tiket
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-slate-400 text-xs font-bold uppercase">Total Acara</div>
        <div class="text-2xl font-black text-slate-800 mt-2">
          {summary.totalEvents} Acara
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-slate-400 text-xs font-bold uppercase">Pengguna Terdaftar</div>
        <div class="text-2xl font-black text-slate-800 mt-2">
          {summary.totalUsers} User
        </div>
      </div>
    </div>
  {/if}

  <!-- Antrean Moderasi Acara -->
  <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
    <div class="p-6 border-b border-slate-100 flex justify-between items-center">
      <h3 class="font-bold text-lg text-slate-900">Antrean Moderasi Acara Masuk</h3>
      <span class="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
        {pendingEvents.length} Menunggu Persetujuan
      </span>
    </div>

    {#if pendingEvents.length === 0}
      <div class="text-center py-16 text-slate-400 font-medium">
        Tidak ada acara baru yang memerlukan tinjauan saat ini.
      </div>
    {:else}
      <div class="divide-y divide-slate-100">
        {#each pendingEvents as event}
          <div class="p-6 flex justify-between items-center hover:bg-slate-50 transition">
            <div class="space-y-1 max-w-xl">
              <span class="text-xs font-bold text-amber-600 uppercase">Perlu Review</span>
              <h4 class="font-extrabold text-base text-slate-900">{event.title}</h4>
              <p class="text-xs text-slate-500 line-clamp-1">{event.description}</p>
              <div class="text-xs text-slate-400 pt-1">
                📍 {event.location} • 📅 {new Date(event.date).toLocaleDateString('id-ID')}
              </div>
            </div>

            <!-- Tombol Aksi Moderasi -->
            <div class="flex gap-3">
              <button 
                onclick={() => updateStatus(event.id, 'APPROVED')}
                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition">
                ✓ Setujui (Publikasi)
              </button>
              <button 
                onclick={() => updateStatus(event.id, 'REJECTED')}
                class="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition">
                ✕ Tolak
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
