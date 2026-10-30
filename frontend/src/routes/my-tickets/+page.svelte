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
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
      <Sparkles class="w-3.5 h-3.5" />
      Dompet Tiket Digital
    </div>
    <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Tiket Terdaftar Milik Anda</h1>
    <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Tunjukkan QR Code berikut di meja registrasi venue pada hari acara berlangsung.</p>
  </div>

  {#if isLoading}
    <div class="text-center py-24 text-slate-400 font-medium">Memuat tiket digital Anda...</div>
  {:else if tickets.length === 0}
    <div class="text-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs max-w-lg mx-auto p-10">
      <Ticket class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <h3 class="text-slate-800 dark:text-slate-200 font-bold text-base">Belum Ada Tiket Acara</h3>
      <p class="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-6">Anda belum memesan tiket apa pun.</p>
      <a href="/" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20">
        Jelajahi Acara Tersedia
      </a>
    </div>
  {:else}
    <div class="space-y-6">
      {#each tickets as tkt}
        <!-- Real Boarding Pass Ticket Design with Adaptive Notches -->
        <div class="relative bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/5 transition duration-300 flex overflow-hidden">
          
          <!-- Lubang Perforasi Adaptif (Mengikuti Latar Belakang Gelap dan Terang) -->
          <div class="absolute right-[216px] -top-3.5 w-7 h-7 bg-[#F8FAFC] dark:bg-[#090D16] rounded-full border border-slate-200/80 dark:border-white/[0.08] z-10"></div>
          <div class="absolute right-[216px] -bottom-3.5 w-7 h-7 bg-[#F8FAFC] dark:bg-[#090D16] rounded-full border border-slate-200/80 dark:border-white/[0.08] z-10"></div>

          <!-- Main Stub (Informasi Acara) -->
          <div class="flex-1 p-8 flex flex-col justify-between space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-400 text-xs font-extrabold rounded-lg uppercase tracking-wider">
                  Tier: {tkt.ticketTypeName}
                </span>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-2 leading-tight">{tkt.eventTitle}</h3>
              </div>

              <!-- Status Badge -->
              <div>
                {#if tkt.isUsed}
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 font-extrabold text-[11px]">
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    SUDAH CHECK-IN
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px] animate-pulse">
                    <Clock class="w-3.5 h-3.5" />
                    SIAP DIGUNAKAN
                  </span>
                {/if}
              </div>
            </div>

            <!-- Detail Venue & Tanggal -->
            <div class="flex items-center gap-8 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{new Date(tkt.eventDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{tkt.eventLocation}</span>
              </div>
            </div>

            <div class="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              Pass ID: <span class="text-slate-700 dark:text-slate-300 font-semibold">{tkt.id}</span>
            </div>
          </div>

          <!-- Garis Robek Perforasi Putus-putus -->
          <div class="border-r-2 border-dashed border-slate-200 dark:border-white/[0.1] my-4"></div>

          <!-- Right Stub (QR Code Scanner) -->
          <div class="w-[230px] p-6 bg-slate-50/70 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center space-y-3">
            <div class="bg-white p-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md">
              <img src={tkt.qrDataUrl} alt="QR Code" class="w-32 h-32 rounded-lg" />
            </div>
            <div class="space-y-0.5">
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Single-Use Token</span>
              <span class="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 block truncate max-w-[170px]">{tkt.qrToken}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
