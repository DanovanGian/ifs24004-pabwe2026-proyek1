<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { formatRupiah } from '../../../helpers/toolsHelper.ts';
  import { Image, Edit3, Trash2, Calendar, MapPin, QrCode, PlusCircle, CheckCircle2 } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let activeTab = $state<'list' | 'create' | 'scanner'>('list');
  let myEvents = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let isLoadingEvents = $state(true);

  // Scanner State
  let qrTokenInput = $state('');
  let scanResult = $state<any>(null);
  let scanError = $state('');
  let isScanning = $state(false);

  // Form Buat / Edit Acara
  let isEditMode = $state(false);
  let editEventId = $state<string | null>(null);
  let title = $state('');
  let description = $state('');
  let categoryId = $state('');
  let date = $state('');
  let location = $state('');
  let imageUrl = $state('');
  let ticketName = $state('General Admission');
  let ticketPrice = $state(100000);
  let ticketQuota = $state(50);
  let isSubmitting = $state(false);

  // Muat Acara Milik Organizer Ini
  async function loadMyEvents() {
    isLoadingEvents = true;
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) return;

      const res = await apiRequest(`/events?organizerId=${user.id}`);
      myEvents = res.data || [];
    } catch {
      // Handled
    } finally {
      isLoadingEvents = false;
    }
  }

  // Mulai Mode Edit
  function startEdit(event: any) {
    isEditMode = true;
    editEventId = event.id;
    title = event.title;
    description = event.description;
    categoryId = event.categoryId;
    // Format input datetime-local: YYYY-MM-DDTHH:MM
    date = new Date(event.date).toISOString().slice(0, 16);
    location = event.location;
    imageUrl = event.imageUrl || '';
    activeTab = 'create'; // Beralih ke tab form
  }

  // Reset Form ke Mode Buat Baru
  function resetForm() {
    isEditMode = false;
    editEventId = null;
    title = '';
    description = '';
    date = '';
    location = '';
    imageUrl = '';
    if (categories.length > 0) categoryId = categories[0].id;
  }

  // Submit Buat atau Update Acara
  async function handleSubmitEvent(e: SubmitEvent) {
    e.preventDefault();
    isSubmitting = true;

    try {
      if (isEditMode && editEventId) {
        // Panggil endpoint PUT untuk UPDATE
        await apiRequest(`/events/${editEventId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title,
            description,
            categoryId,
            date,
            location,
            imageUrl: imageUrl.trim() || null,
          }),
        });

        Swal.fire({
          icon: 'success',
          title: 'Perubahan Disimpan',
          text: 'Detail acara berhasil diperbarui!',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // Panggil endpoint POST untuk BUAT BARU
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
          }),
        });

        Swal.fire({
          icon: 'success',
          title: 'Acara Berhasil Diajukan',
          text: 'Acara Anda telah didaftarkan dan menunggu persetujuan Admin.',
        });
      }

      resetForm();
      await loadMyEvents();
      activeTab = 'list';
    } catch {
      // Handled otomatis
    } finally {
      isSubmitting = false;
    }
  }

  // Hapus Acara
  async function handleDeleteEvent(id: string, title: string) {
    const confirm = await Swal.fire({
      title: 'Hapus Acara?',
      text: `Apakah Anda yakin ingin menghapus acara "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Acara',
      cancelButtonText: 'Batal',
    });

    if (confirm.isConfirmed) {
      try {
        await apiRequest(`/events/${id}`, { method: 'DELETE' });
        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Acara berhasil dihapus.', timer: 1500, showConfirmButton: false });
        loadMyEvents();
      } catch {
        // Handled
      }
    }
  }

  // Scanner Check-In
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

  onMount(async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      Swal.fire({ icon: 'warning', title: 'Akses Terbatas', text: 'Halaman khusus Organizer.' });
      goto('/auth/login');
      return;
    }

    try {
      const catRes = await apiRequest('/events/categories');
      categories = catRes.data || [];
      if (categories.length > 0) categoryId = categories[0].id;
      loadMyEvents();
    } catch {
      // Handled
    }
  });
</script>

<div class="max-w-6xl mx-auto space-y-8">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Organizer Dashboard</h1>
      <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Kelola dan edit acara Anda, publikasikan acara baru, serta validasi tiket hari-H.</p>
    </div>

    <!-- Tab Menu Navigasi -->
    <div class="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl gap-1">
      <button 
        onclick={() => activeTab = 'list'}
        class="px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'list' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        📋 Acara Saya ({myEvents.length})
      </button>
      <button 
        onclick={() => { resetForm(); activeTab = 'create'; }}
        class="px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'create' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        {isEditMode ? '✏️ Edit Acara' : '➕ Buat Acara Baru'}
      </button>
      <button 
        onclick={() => activeTab = 'scanner'}
        class="px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'scanner' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        📷 Scanner Check-In
      </button>
    </div>
  </div>

  <!-- TAB 1: DAFTAR ACARA ORGANIZER -->
  {#if activeTab === 'list'}
    <div class="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] overflow-hidden shadow-xs">
      <div class="p-6 border-b border-slate-100 dark:border-white/[0.06] flex justify-between items-center">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white">Daftar Acara yang Anda Buat</h3>
        <button onclick={() => { resetForm(); activeTab = 'create'; }} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
          <PlusCircle class="w-3.5 h-3.5" />
          Tambah Acara Baru
        </button>
      </div>

      {#if isLoadingEvents}
        <div class="text-center py-20 text-slate-400 text-xs">Memuat daftar acara Anda...</div>
      {:else if myEvents.length === 0}
        <div class="text-center py-20 text-slate-400 text-xs">
          Anda belum membuat acara apa pun. Klik tombol "Tambah Acara Baru" di atas.
        </div>
      {:else}
        <div class="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {#each myEvents as evt}
            <div class="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
              <div class="flex items-center gap-5">
                <div class="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img src={evt.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300'} alt={evt.title} class="w-full h-full object-cover" />
                </div>
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase {evt.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800' : evt.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800'}">
                      {evt.status}
                    </span>
                    <span class="text-xs text-slate-400">{evt.category?.name}</span>
                  </div>
                  <h4 class="font-extrabold text-base text-slate-900 dark:text-white">{evt.title}</h4>
                  <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
                    <span>📅 {new Date(evt.date).toLocaleDateString('id-ID')}</span>
                    <span>📍 {evt.location}</span>
                  </div>
                </div>
              </div>

              <!-- Tombol Aksi Edit & Hapus -->
              <div class="flex items-center gap-2">
                <button 
                  onclick={() => startEdit(evt)}
                  class="px-4 py-2 border border-slate-200 dark:border-white/10 hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <Edit3 class="w-3.5 h-3.5" />
                  Edit
                </button>
                <button 
                  onclick={() => handleDeleteEvent(evt.id, evt.title)}
                  class="px-4 py-2 border border-slate-200 dark:border-white/10 hover:border-rose-500 hover:text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <Trash2 class="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- TAB 2: FORMULIR BUAT / EDIT ACARA -->
  {:else if activeTab === 'create'}
    <div class="max-w-3xl mx-auto bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-bold text-xl text-slate-900 dark:text-white">
            {isEditMode ? 'Formulir Edit Acara' : 'Formulir Publikasi Acara Baru'}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEditMode ? 'Perbarui informasi dan tautan sampul acara ini.' : 'Acara akan ditinjau Admin sebelum tayang di katalog publik.'}
          </p>
        </div>
        {#if isEditMode}
          <button onclick={resetForm} class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white underline cursor-pointer">
            Batal Edit
          </button>
        {/if}
      </div>

      <form onsubmit={handleSubmitEvent} class="space-y-5">
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

        <!-- Input Sampul Gambar -->
        <div class="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl space-y-3">
          <label class="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1.5">
            <Image class="w-4 h-4" />
            URL Foto Sampul Acara (Cover Banner)
          </label>
          <input 
            type="url" 
            bind:value={imageUrl} 
            placeholder="https://images.unsplash.com/photo-..." 
            class="w-full px-4 py-2.5 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs bg-white dark:bg-slate-800 focus:outline-indigo-600" 
          />
          {#if imageUrl}
            <div class="mt-2 relative h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
              <img src={imageUrl} alt="Pratinjau Sampul" class="w-full h-full object-cover" />
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

        {#if !isEditMode}
          <!-- Pengaturan Tiket (Hanya saat buat baru) -->
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
        {/if}

        <button type="submit" disabled={isSubmitting} class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/25">
          {isSubmitting ? 'Menyimpan...' : isEditMode ? '✓ Simpan Perubahan Acara' : 'Kirimkan Acara untuk Ditinjau Admin'}
        </button>
      </form>
    </div>

  <!-- TAB 3: SCANNER CHECK-IN -->
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
