<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../helpers/apiHelper.ts';
  import { Ticket, Calendar, MapPin, CheckCircle2, Clock, Sparkles, Printer, Armchair } from 'lucide-svelte';

  let tickets = $state<any[]>([]);
  let isLoading = $state(true);
  let activePrintTicketId = $state<string | null>(null);

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

  function handlePrintTicket(ticketId: string) {
    activePrintTicketId = ticketId;
    setTimeout(() => {
      window.print();
      activePrintTicketId = null;
    }, 150);
  }

  onMount(() => {
    loadMyTickets();
  });
</script>

<div class="max-w-5xl mx-auto space-y-8">
  <div class="no-print">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
      <Sparkles class="w-3.5 h-3.5" />
      Dompet Tiket Digital
    </div>
    <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Tiket Terdaftar Milik Anda</h1>
    <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">
      Tunjukkan QR Code di venue atau klik tombol <strong>Cetak / Unduh PDF</strong> untuk menyimpan dokumen fisik tiket.
    </p>
  </div>

  {#if isLoading}
    <div class="text-center py-24 text-slate-400 font-medium">Memuat tiket digital Anda...</div>
  {:else if tickets.length === 0}
    <div class="text-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs max-w-lg mx-auto p-10 no-print">
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
        <div class="relative bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/5 transition duration-300 flex overflow-hidden {activePrintTicketId === tkt.id ? 'ticket-print-target' : activePrintTicketId !== null ? 'hidden' : ''}">
          
          <div class="absolute right-[216px] -top-3.5 w-7 h-7 bg-[#F8FAFC] dark:bg-[#090D16] rounded-full border border-slate-200/80 dark:border-white/[0.08] z-10 no-print"></div>
          <div class="absolute right-[216px] -bottom-3.5 w-7 h-7 bg-[#F8FAFC] dark:bg-[#090D16] rounded-full border border-slate-200/80 dark:border-white/[0.08] z-10 no-print"></div>

          <!-- Bagian Kiri: Informasi Acara + NOMOR KURSI RESMI -->
          <div class="flex-1 p-8 flex flex-col justify-between space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-400 text-xs font-extrabold rounded-lg uppercase tracking-wider">
                    Tier: {tkt.ticketTypeName}
                  </span>
                  
                  <!-- Lencana Nomor Kursi Resmi -->
                  {#if tkt.seatNumber}
                    <span class="px-3 py-1 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-black rounded-lg uppercase flex items-center gap-1">
                      <Armchair class="w-3.5 h-3.5" />
                      {tkt.seatNumber}
                    </span>
                  {/if}
                </div>

                <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-2.5 leading-tight">{tkt.eventTitle}</h3>
              </div>

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

            <div class="flex justify-between items-center pt-2">
              <div class="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                Pass ID: <span class="text-slate-700 dark:text-slate-300 font-semibold">{tkt.id}</span>
              </div>

              <button 
                onclick={() => handlePrintTicket(tkt.id)}
                class="no-print px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer hover:scale-105 active:scale-95">
                <Printer class="w-3.5 h-3.5" />
                <span>Cetak / Unduh PDF</span>
              </button>
            </div>
          </div>

          <!-- Garis Robek Perforasi Putus-putus -->
          <div class="border-r-2 border-dashed border-slate-200 dark:border-white/[0.1] my-4"></div>

          <!-- Bagian Kanan: QR Code -->
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
