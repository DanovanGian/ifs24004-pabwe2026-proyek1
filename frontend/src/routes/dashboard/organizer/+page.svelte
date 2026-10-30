<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import Swal from 'sweetalert2';

  let activeTab = $state<'scanner' | 'create'>('scanner');
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
  let ticketName = $state('General Pass');
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
          ticketTypes: [
            { name: ticketName, price: Number(ticketPrice), quota: Number(ticketQuota) }
          ]
        })
      });

      Swal.fire({
        icon: 'success',
        title: 'Acara Diajukan',
        text: 'Acara Anda berhasil diajukan dan menunggu persetujuan Admin.',
      });

      title = '';
      description = '';
      activeTab = 'scanner';
    } catch {
      // Handled
    } finally {
      isSubmitting = false;
    }
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
      <h1 class="text-3xl font-black text-slate-900 tracking-tight">Organizer Dashboard</h1>
      <p class="text-slate-500 text-sm mt-1">Validasi check-in QR peserta dan buat acara baru.</p>
    </div>

    <div class="flex bg-slate-200 p-1.5 rounded-2xl gap-1">
      <button 
        onclick={() => activeTab = 'scanner'}
        class="px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'scanner' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}">
        📷 Scanner Check-In
      </button>
      <button 
        onclick={() => activeTab = 'create'}
        class="px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'create' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}">
        ➕ Buat Acara Baru
      </button>
    </div>
  </div>

  {#if activeTab === 'scanner'}
    <div class="grid grid-cols-2 gap-8">
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 class="font-bold text-lg text-slate-900">Validasi Check-In Tiket</h3>
        <p class="text-slate-500 text-xs">Masukkan token QR tiket peserta untuk check-in.</p>

        <form onsubmit={handleCheckIn} class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase mb-1">QR Token Tiket</label>
            <input 
              type="text" 
              bind:value={qrTokenInput} 
              required
              placeholder="Contoh: tkn_a1b2c3d4-..." 
              class="w-full font-mono px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-indigo-600 bg-slate-50"
            />
          </div>

          <button 
            type="submit" 
            disabled={isScanning}
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-md disabled:opacity-50">
            {isScanning ? 'Memverifikasi...' : '✓ Validasi Tiket'}
          </button>
        </form>
      </div>

      <div class="flex flex-col justify-center">
        {#if scanResult}
          <div class="bg-emerald-50 border-2 border-emerald-300 p-8 rounded-3xl space-y-3">
            <span class="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-full uppercase">Check-In Berhasil</span>
            <h2 class="text-2xl font-black text-emerald-900">{scanResult.eventTitle}</h2>
            <div class="text-emerald-800 text-sm">Peserta: <strong>{scanResult.participantName}</strong></div>
            <div class="text-xs text-emerald-600">Waktu: {new Date(scanResult.checkedInAt).toLocaleTimeString('id-ID')}</div>
          </div>
        {:else if scanError}
          <div class="bg-rose-50 border-2 border-rose-300 p-8 rounded-3xl space-y-2">
            <span class="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-full uppercase">Check-In Ditolak</span>
            <h2 class="text-xl font-bold text-rose-900">Tiket Tidak Sah / Sudah Digunakan</h2>
            <p class="text-rose-700 text-sm">{scanError}</p>
          </div>
        {:else}
          <div class="border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center text-slate-400 font-medium">
            Hasil verifikasi tiket akan muncul di sini.
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
      <h3 class="font-bold text-xl text-slate-900 mb-1">Formulir Publikasi Acara</h3>
      <p class="text-xs text-slate-500 mb-6">Acara akan direview Administrator sebelum tampil di publik.</p>

      <form onsubmit={handleCreateEvent} class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Acara</label>
          <input type="text" bind:value={title} required placeholder="Contoh: Workshop Cloud & Bun" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori</label>
          <select bind:value={categoryId} class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600 bg-white">
            {#each categories as cat}
              <option value={cat.id}>{cat.name}</option>
            {/each}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal Acara</label>
            <input type="datetime-local" bind:value={date} required class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Lokasi</label>
            <input type="text" bind:value={location} required placeholder="Auditorium Delcom" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi</label>
          <textarea bind:value={description} rows="3" required placeholder="Detail acara..." class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600"></textarea>
        </div>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <span class="text-xs font-extrabold text-indigo-600 uppercase">Pengaturan Tiket Utama</span>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nama Tiket</label>
              <input type="text" bind:value={ticketName} required class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">Harga (Rp)</label>
              <input type="number" bind:value={ticketPrice} min="0" required class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">Kuota</label>
              <input type="number" bind:value={ticketQuota} min="1" required class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition cursor-pointer">
          {isSubmitting ? 'Mengirim Data...' : 'Kirimkan Acara untuk Ditinjau'}
        </button>
      </form>
    </div>
  {/if}
</div>
