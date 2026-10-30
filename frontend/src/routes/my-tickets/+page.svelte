<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../helpers/apiHelper.ts';
  import { Ticket, Calendar, MapPin, CheckCircle2, Clock, Sparkles } from 'lucide-svelte';

  let tickets = $state<any[]>([]);
  let isLoading = $state(true);

  async function loadMyTickets() {
    const token = localStorage.getItem('token');
    if (!token) {
      goto('/auth/login');
      return;
    }

    try {
      const res = await apiRequest('/my-tickets');
      tickets = res.data || [];
    } catch {
      // Handled
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadMyTickets();
  });
</script>

<div class="max-w-5xl mx-auto space-y-8">
  <div>
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-2">
      <Sparkles class="w-3.5 h-3.5" />
      Dompet Tiket Digital
    </div>
    <h1 class="text-3xl font-black tracking-tight text-slate-900">Tiket Terdaftar Milik Anda</h1>
    <p class="text-slate-500 text-xs mt-1">Tunjukkan QR Code berikut di meja registrasi venue pada hari acara berlangsung.</p>
  </div>

  {#if isLoading}
    <div class="text-center py-24 text-slate-400 font-medium">Memuat tiket digital Anda...</div>
  {:else if tickets.length === 0}
    <div class="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto p-10">
      <Ticket class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h3 class="text-slate-800 font-bold text-base">Belum Ada Tiket Acara</h3>
      <p class="text-slate-500 text-xs mt-1 mb-6">Anda belum memesan tiket apa pun. Eksplorasi katalog kami sekarang.</p>
      <a href="/" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20">
        Jelajahi Acara Tersedia
      </a>
    </div>
  {:else}
    <div class="space-y-6">
      {#each tickets as tkt}
        <!-- Real Boarding Pass Ticket Design with Perforation Notches -->
        <div class="relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex overflow-hidden">
          
          <!-- Notches (Lubang Tiket) -->
          <div class="absolute right-[216px] -top-3.5 w-7 h-7 bg-[#F8FAFC] rounded-full border border-slate-200 z-10"></div>
          <div class="absolute right-[216px] -bottom-3.5 w-7 h-7 bg-[#F8FAFC] rounded-full border border-slate-200 z-10"></div>

          <!-- Main Stub (Bagian Kiri: Informasi Acara) -->
          <div class="flex-1 p-8 flex flex-col justify-between space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <span class="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold rounded-lg uppercase tracking-wider">
                  Tier: {tkt.ticketTypeName}
                </span>
                <h3 class="text-2xl font-black text-slate-900 mt-2 leading-tight">{tkt.eventTitle}</h3>
              </div>

              <!-- Status Badge -->
              <div>
                {#if tkt.isUsed}
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[11px]">
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    SUDAH CHECK-IN
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[11px] animate-pulse">
                    <Clock class="w-3.5 h-3.5" />
                    SIAP DIGUNAKAN
                  </span>
                {/if}
              </div>
            </div>

            <!-- Detail Venue & Tanggal -->
            <div class="flex items-center gap-8 text-xs text-slate-500 pt-4 border-t border-slate-100">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-indigo-600" />
                <span>{new Date(tkt.eventDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4 text-indigo-600" />
                <span>{tkt.eventLocation}</span>
              </div>
            </div>

            <div class="text-[11px] font-mono text-slate-400">
              Pass ID: <span class="text-slate-700 font-semibold">{tkt.id}</span>
            </div>
          </div>

          <!-- Garis Robek Perforasi Putus-putus -->
          <div class="border-r-2 border-dashed border-slate-200 my-4"></div>

          <!-- Right Stub (Bagian Kanan: QR Code Scanner) -->
          <div class="w-[230px] p-6 bg-slate-50/80 flex flex-col items-center justify-center text-center space-y-3">
            <div class="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <img src={tkt.qrDataUrl} alt="QR Code" class="w-32 h-32 rounded-lg" />
            </div>
            <div class="space-y-0.5">
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Single-Use Token</span>
              <span class="text-[10px] font-mono font-bold text-indigo-600 block truncate max-w-[170px]">{tkt.qrToken}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
