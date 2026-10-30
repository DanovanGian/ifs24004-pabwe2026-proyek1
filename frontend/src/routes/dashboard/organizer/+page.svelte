<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { Image, Sparkles } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let activeTab = $state<'scanner' | 'create'>('create');
  let qrTokenInput = $state('');
  let scanResult = $state<any>(null);
  let scanError = $state('');
  let isScanning = $state(false);

  // Form Buat Acara
  let title = $state('');
  let description = $state('');
  let categoryId = $state('');
  let categories = $state<any[]>([]);
  let date = $state('');
  let location = $state('');
  let imageUrl = $state('');
  let ticketName = $state('General Admission');
  let ticketPrice = $state(100000);
  let ticketQuota = $state(50);
  let isSubmitting = $state(false);

  async function handleCheckIn(e: SubmitEvent) {
    e.preventDefault();
    scanResult = null;
    scanError = '';
    isScanning = true;

    try {
      const res = await apiRequest('/check-in', {
        method: 'POST',
        body: JSON.stringify({ qrToken: qrTokenInput.trim() }),
      });
      scanResult = res.data;
      qrTokenInput = '';
    } catch (err: any) {
      scanError = err.message || 'Check-in gagal.';
    } finally {
      isScanning = false;
    }
  }

  async function handleCreateEvent(e: SubmitEvent) {
    e.preventDefault();
    isSubmitting = true;

    try {
      await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          categoryId,
          date,
          location,
          imageUrl: imageUrl.trim() || null,
          ticketTypes: [
            { name: ticketName, price: Number(ticketPrice), quota: Number(ticketQuota) }
          ]
        })
      });

      Swal.fire({
        icon: 'success',
        title: 'Acara Berhasil Diajukan',
        text: 'Acara Anda telah didaftarkan dan menunggu persetujuan Admin.',
      });

      title = '';
      description = '';
      imageUrl = '';
      activeTab = 'scanner';
    } catch {
      // Handled otomatis
    } finally {
      isSubmitting = false;
    }
  }

  function applyPresetImage(url: string) {
    imageUrl = url;
  }

  onMount(async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas',
        text: 'Halaman ini khusus untuk Organizer.',
      });
      goto('/auth/login');
      return;
    }

    try {
      const catRes = await apiRequest('/events/categories');
      categories = catRes.data || [];
      if (categories.length > 0) categoryId = categories[0].id;
    } catch {
      // Handled
    }
  });
</script>

<div class="max-w-5xl mx-auto space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Organizer Dashboard</h1>
      <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Publikasikan acara lengkap dengan foto sampul dan validasi QR peserta.</p>
    </div>

    <div class="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl gap-1">
      <button 
        onclick={() => activeTab = 'create'}
        class="px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'create' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        ➕ Buat Acara Baru
      </button>
      <button 
        onclick={() => activeTab = 'scanner'}
        class="px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'scanner' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        📷 Scanner Check-In
      </button>
    </div>
  </div>

  {#if activeTab === 'create'}
    <div class="max-w-3xl mx-auto bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
      <h3 class="font-bold text-xl text-slate-900 dark:text-white mb-1">Formulir Publikasi Acara</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Lengkapi detail acara dan tautan gambar sampul untuk menarik minat peserta.</p>

      <form onsubmit={handleCreateEvent} class="space-y-5">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Judul Acara</label>
          <input type="text" bind:value={title} required placeholder="Contoh: Modern Web Summit 2026" class="w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs focus:outline-indigo-600 bg-slate-50 dark:bg-slate-800/60" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Kategori Acara</label>
          <select bind:value={categoryId} class="w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs focus:outline-indigo-600 bg-white dark:bg-slate-800">
            {#each categories as cat}
              <option value={cat.id}>{cat.name}</option>
            {/each}
          </select>
        </div>

        <!-- Input Sampul Gambar dengan Live Preview -->
        <div class="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl space-y-3">
          <div class="flex justify-between items-center">
            <label class="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1.5">
              <Image class="w-4 h-4" />
              URL Foto Sampul Acara (Cover Banner)
            </label>
            <span class="text-[10px] text-slate-400">Format: JPG, PNG, WebP URL</span>
          </div>

          <input 
            type="url" 
            bind:value={imageUrl} 
            placeholder="https://images.unsplash.com/photo-..." 
            class="w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs bg-white dark:bg-slate-800 focus:outline-indigo-600" 
          />

          <!-- Rekomendasi Sampul 1-Klik -->
          <div class="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
            <span class="font-semibold text-slate-400">Pilihan Cepat:</span>
            <button type="button" onclick={() => applyPresetImage('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000')} class="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] hover:border-indigo-500">Teknologi</button>
            <button type="button" onclick={() => applyPresetImage('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1000')} class="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] hover:border-indigo-500">Konser Musik</button>
            <button type="button" onclick={() => applyPresetImage('https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000')} class="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] hover:border-indigo-500">Bisnis & Seminar</button>
          </div>

          <!-- Live Preview Sampul Gambar -->
          {#if imageUrl}
            <div class="mt-3 relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xs">
              <img src={imageUrl} alt="Pratinjau Sampul" class="w-full h-full object-cover" />
              <div class="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-bold">
                ✓ Pratinjau Sampul Aktif
              </div>
            </div>
          {/if}
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Tanggal & Waktu</label>
            <input type="datetime-local" bind:value={date} required class="w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs focus:outline-indigo-600 bg-slate-50 dark:bg-slate-800/60" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Lokasi Venue</label>
            <input type="text" bind:value={location} required placeholder="Jakarta Convention Center" class="w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs focus:outline-indigo-600 bg-slate-50 dark:bg-slate-800/60" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Deskripsi Lengkap Acara</label>
          <textarea bind:value={description} rows="3" required placeholder="Jelaskan pembicara, agenda, dan manfaat..." class="w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs focus:outline-indigo-600 bg-slate-50 dark:bg-slate-800/60"></textarea>
        </div>

        <!-- Tiket -->
        <div class="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
          <span class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">Pengaturan Tiket Utama</span>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Nama Tiket</label>
              <input type="text" bind:value={ticketName} required class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Harga (Rp)</label>
              <input type="number" bind:value={ticketPrice} min="0" required class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Kuota Tiket</label>
              <input type="number" bind:value={ticketQuota} min="1" required class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/25">
          {isSubmitting ? 'Mengirim Data...' : 'Kirimkan Acara untuk Ditinjau Admin'}
        </button>
      </form>
    </div>

  <!-- Tab Scanner Check-In -->
  {:else}
    <div class="grid grid-cols-2 gap-8">
      <div class="bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white">Validasi Check-In Tiket</h3>
        <p class="text-slate-500 dark:text-slate-400 text-xs">Masukkan token QR tiket peserta untuk check-in.</p>

        <form onsubmit={handleCheckIn} class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">QR Token Tiket</label>
            <input 
              type="text" 
              bind:value={qrTokenInput} 
              required
              placeholder="Contoh: tkn_a1b2c3d4-..." 
              class="w-full font-mono px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs focus:outline-indigo-600 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button 
            type="submit" 
            disabled={isScanning}
            class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md disabled:opacity-50">
            {isScanning ? 'Memverifikasi...' : '✓ Validasi Tiket'}
          </button>
        </form>
      </div>

      <div class="flex flex-col justify-center">
        {#if scanResult}
          <div class="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 dark:border-emerald-700 p-8 rounded-3xl space-y-3">
            <span class="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-full uppercase">Check-In Berhasil</span>
            <h2 class="text-2xl font-black text-emerald-900 dark:text-white">{scanResult.eventTitle}</h2>
            <div class="text-emerald-800 dark:text-emerald-300 text-sm">Peserta: <strong>{scanResult.participantName}</strong></div>
            <div class="text-xs text-emerald-600 dark:text-emerald-400">Waktu: {new Date(scanResult.checkedInAt).toLocaleTimeString('id-ID')}</div>
          </div>
        {:else if scanError}
          <div class="bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-700 p-8 rounded-3xl space-y-2">
            <span class="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-full uppercase">Check-In Ditolak</span>
            <h2 class="text-xl font-bold text-rose-900 dark:text-rose-200">Tiket Tidak Sah / Sudah Digunakan</h2>
            <p class="text-rose-700 dark:text-rose-400 text-sm">{scanError}</p>
          </div>
        {:else}
          <div class="border-2 border-dashed border-slate-200 dark:border-white/10 p-12 rounded-3xl text-center text-slate-400 dark:text-slate-500 font-medium">
            Hasil verifikasi tiket akan muncul di sini.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
