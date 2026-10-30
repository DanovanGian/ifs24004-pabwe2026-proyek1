<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { Image, Edit3, Trash2, PlusCircle, FileSpreadsheet, Camera, CameraOff, RefreshCw, CheckCircle2 } from 'lucide-svelte';
  import { Html5Qrcode } from 'html5-qrcode';
  import Swal from 'sweetalert2';

  let activeTab = $state<'list' | 'create' | 'scanner'>('scanner');
  let myEvents = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let isLoadingEvents = $state(true);

  // Scanner State
  let qrTokenInput = $state('');
  let scanResult = $state<any>(null);
  let scanError = $state('');
  let isScanning = $state(false);
  let isCameraActive = $state(false);
  let html5QrCode: Html5Qrcode | null = null;

  // Form State
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

  // ==========================================
  // LOGIKA SCANNER KAMERA WEBCAM LANGSUNG
  // ==========================================
  async function startCameraScanner() {
    scanResult = null;
    scanError = '';

    try {
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode('qr-reader');
      }

      isCameraActive = true;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Mengutamakan kamera depan/webcam
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Ketika QR Code terbaca oleh kamera
          await processCheckIn(decodedText);
          stopCameraScanner(); // Jeda sementara kamera setelah berhasil scan
        },
        () => {
          // Frame scanner sedang membaca (silent)
        }
      );
    } catch (err: any) {
      isCameraActive = false;
      Swal.fire({
        icon: 'error',
        title: 'Kamera Gagal Dibuka',
        text: 'Pastikan Anda memberikan izin akses kamera (Camera Permission) pada browser.',
      });
    }
  }

  async function stopCameraScanner() {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop();
      } catch (e) {
        console.error(e);
      }
    }
    isCameraActive = false;
  }

  // Proses Validasi Check-In ke Backend
  async function processCheckIn(token: string) {
    scanResult = null;
    scanError = '';
    isScanning = true;

    try {
      const res = await apiRequest('/check-in', {
        method: 'POST',
        body: JSON.stringify({ qrToken: token.trim() }),
      });
      scanResult = res.data;
      qrTokenInput = '';
    } catch (err: any) {
      scanError = err.message || 'Check-in gagal: Tiket tidak valid atau sudah digunakan.';
    } finally {
      isScanning = false;
    }
  }

  // Check-In Manual via Form Input
  async function handleManualCheckIn(e: SubmitEvent) {
    e.preventDefault();
    if (qrTokenInput.trim()) {
      await processCheckIn(qrTokenInput.trim());
    }
  }

  // ==========================================
  // MANAJEMEN ACARA
  // ==========================================
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

  async function handleExportCSV(eventId: string, eventTitle: string) {
    try {
      const res = await apiRequest(`/events/${eventId}/participants`);
      const participants = res.data.participants || [];

      if (participants.length === 0) {
        Swal.fire({ icon: 'info', title: 'Belum Ada Peserta', text: 'Acara ini belum memiliki peserta terdaftar.' });
        return;
      }

      const headers = ['No', 'ID Tiket', 'Nama Peserta', 'Email', 'Kategori Tiket', 'Harga Tiket (Rp)', 'Status Kehadiran', 'Waktu Check-in', 'Tanggal Pesan'];
      const rows = participants.map((p: any, index: number) => [
        index + 1,
        `"${p.ticketId}"`,
        `"${p.participantName}"`,
        `"${p.participantEmail}"`,
        `"${p.ticketType}"`,
        p.pricePaid,
        p.isUsed ? 'Sudah Check-In' : 'Belum Hadir',
        `"${p.checkedInAt}"`,
        `"${p.registeredAt}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Peserta_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({ icon: 'success', title: 'Ekspor Berhasil', text: `Data ${participants.length} peserta telah diunduh.`, timer: 1500, showConfirmButton: false });
    } catch {
      // Handled
    }
  }

  function startEdit(event: any) {
    isEditMode = true;
    editEventId = event.id;
    title = event.title;
    description = event.description;
    categoryId = event.categoryId;
    date = new Date(event.date).toISOString().slice(0, 16);
    location = event.location;
    imageUrl = event.imageUrl || '';
    activeTab = 'create';
  }

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

  async function handleSubmitEvent(e: SubmitEvent) {
    e.preventDefault();
    isSubmitting = true;

    try {
      if (isEditMode && editEventId) {
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

        Swal.fire({ icon: 'success', title: 'Perubahan Disimpan', text: 'Detail acara berhasil diperbarui!', timer: 1500, showConfirmButton: false });
      } else {
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

        Swal.fire({ icon: 'success', title: 'Acara Berhasil Diajukan', text: 'Acara menunggu persetujuan Admin.' });
      }

      resetForm();
      await loadMyEvents();
      activeTab = 'list';
    } catch {
      // Handled
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteEvent(id: string, eventTitle: string) {
    const confirm = await Swal.fire({
      title: 'Hapus Acara?',
      text: `Apakah Anda yakin ingin menghapus acara "${eventTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
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

  onDestroy(() => {
    stopCameraScanner();
  });
</script>

<div class="max-w-6xl mx-auto space-y-8">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Organizer Dashboard</h1>
      <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Scanner QR Kamera Webcam langsung, kelola acara, dan ekspor laporan peserta.</p>
    </div>

    <!-- Tab Navigasi -->
    <div class="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl gap-1">
      <button 
        type="button"
        onclick={() => { stopCameraScanner(); activeTab = 'scanner'; }}
        class="px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'scanner' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        📷 Scanner Check-In
      </button>
      <button 
        type="button"
        onclick={() => { stopCameraScanner(); activeTab = 'list'; }}
        class="px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'list' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        📋 Acara Saya ({myEvents.length})
      </button>
      <button 
        type="button"
        onclick={() => { stopCameraScanner(); resetForm(); activeTab = 'create'; }}
        class="px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'create' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        {isEditMode ? '✏️ Edit Acara' : '➕ Buat Acara Baru'}
      </button>
    </div>
  </div>

  <!-- TAB 1: SCANNER CHECK-IN DENGAN KAMERA WEBCAM -->
  {#if activeTab === 'scanner'}
    <div class="grid grid-cols-2 gap-8">
      <!-- Panel Pemindai (Kamera / Manual) -->
      <div class="bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-5">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-lg text-slate-900 dark:text-white">Pemindai Tiket Hari-H</h3>
            <p class="text-slate-500 dark:text-slate-400 text-xs">Pindai QR Code via webcam atau ketik token tiket manual.</p>
          </div>

          <!-- Tombol Saklar Kamera -->
          {#if isCameraActive}
            <button 
              type="button"
              onclick={stopCameraScanner}
              class="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <CameraOff class="w-3.5 h-3.5" />
              <span>Matikan Kamera</span>
            </button>
          {:else}
            <button 
              type="button"
              onclick={startCameraScanner}
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/25">
              <Camera class="w-3.5 h-3.5" />
              <span>Aktifkan Kamera</span>
            </button>
          {/if}
        </div>

        <!-- Viewport Kamera Scanner -->
        <div class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 min-h-[260px] flex items-center justify-center">
          <div id="qr-reader" class="w-full"></div>

          {#if !isCameraActive}
            <div class="text-center p-8 space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Camera class="w-6 h-6" />
              </div>
              <p class="text-xs text-slate-400 max-w-xs">
                Kamera nonaktif. Klik tombol <strong>"Aktifkan Kamera"</strong> di atas untuk memindai otomatis via webcam laptop.
              </p>
            </div>
          {/if}
        </div>

        <!-- Form Cadangan (Input Token Manual) -->
        <div class="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Atau Masukkan Token Manual:</span>
          <form onsubmit={handleManualCheckIn} class="flex gap-2">
            <input 
              type="text" 
              bind:value={qrTokenInput} 
              placeholder="Contoh: tkn_a1b2c3d4-..." 
              class="flex-1 font-mono px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs focus:outline-indigo-600 bg-slate-50 dark:bg-slate-800"
            />
            <button 
              type="submit" 
              disabled={isScanning || !qrTokenInput.trim()}
              class="px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50">
              {isScanning ? 'Cek...' : 'Validasi'}
            </button>
          </form>
        </div>
      </div>

      <!-- Panel Feedback Status Validasi -->
      <div class="flex flex-col justify-center">
        {#if scanResult}
          <div class="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 dark:border-emerald-700 p-8 rounded-3xl space-y-4 shadow-sm animate-in fade-in duration-300">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-emerald-600" />
              <span class="px-3 py-1 bg-emerald-600 text-white text-[11px] font-black rounded-full uppercase">Check-In Sah & Berhasil</span>
            </div>
            
            <div>
              <h2 class="text-2xl font-black text-emerald-950 dark:text-white leading-tight">{scanResult.eventTitle}</h2>
              <div class="text-emerald-800 dark:text-emerald-300 text-sm mt-1">Peserta: <strong>{scanResult.participantName}</strong></div>
              <div class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Waktu: {new Date(scanResult.checkedInAt).toLocaleTimeString('id-ID')} WIB</div>
            </div>

            <!-- Tombol Lanjut Scan Antrean Berikutnya -->
            <button 
              type="button"
              onclick={startCameraScanner}
              class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md">
              <RefreshCw class="w-4 h-4" />
              <span>Scan Tiket Antrean Berikutnya</span>
            </button>
          </div>
        {:else if scanError}
          <div class="bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-700 p-8 rounded-3xl space-y-4 shadow-sm animate-in fade-in duration-300">
            <span class="px-3 py-1 bg-rose-600 text-white text-[11px] font-black rounded-full uppercase">Check-In Ditolak</span>
            <h2 class="text-xl font-bold text-rose-900 dark:text-rose-200">Tiket Tidak Sah / Sudah Digunakan</h2>
            <p class="text-rose-700 dark:text-rose-400 text-xs">{scanError}</p>
            <button 
              type="button"
              onclick={startCameraScanner}
              class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
              <RefreshCw class="w-4 h-4" />
              <span>Coba Scan Ulang</span>
            </button>
          </div>
        {:else}
          <div class="border-2 border-dashed border-slate-200 dark:border-white/10 p-12 rounded-3xl text-center text-slate-400 dark:text-slate-500 font-medium">
            <Camera class="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p class="text-xs">Hasil validasi scan tiket kamera akan muncul di sini secara seketika.</p>
          </div>
        {/if}
      </div>
    </div>

  <!-- TAB 2: DAFTAR ACARA ORGANIZER -->
  {:else if activeTab === 'list'}
    <div class="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] overflow-hidden shadow-xs">
      <div class="p-6 border-b border-slate-100 dark:border-white/[0.06] flex justify-between items-center">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white">Daftar Acara yang Anda Buat</h3>
        <button type="button" onclick={() => { resetForm(); activeTab = 'create'; }} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
          <PlusCircle class="w-3.5 h-3.5" />
          Tambah Acara Baru
        </button>
      </div>

      {#if isLoadingEvents}
        <div class="text-center py-20 text-slate-400 text-xs">Memuat daftar acara...</div>
      {:else if myEvents.length === 0}
        <div class="text-center py-20 text-slate-400 text-xs">Anda belum membuat acara apa pun.</div>
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

              <div class="flex items-center gap-2">
                <button 
                  type="button"
                  onclick={() => handleExportCSV(evt.id, evt.title)}
                  class="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <FileSpreadsheet class="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>

                <button 
                  type="button"
                  onclick={() => startEdit(evt)}
                  class="px-3.5 py-2 border border-slate-200 dark:border-white/10 hover:border-indigo-600 hover:text-indigo-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <Edit3 class="w-3.5 h-3.5" />
                  Edit
                </button>

                <button 
                  type="button"
                  onclick={() => handleDeleteEvent(evt.id, evt.title)}
                  class="px-3.5 py-2 border border-slate-200 dark:border-white/10 hover:border-rose-500 hover:text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <Trash2 class="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- TAB 3: FORMULIR ACARA -->
  {:else if activeTab === 'create'}
    <div class="max-w-3xl mx-auto bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-bold text-xl text-slate-900 dark:text-white">
            {isEditMode ? 'Formulir Edit Acara' : 'Formulir Publikasi Acara Baru'}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEditMode ? 'Perbarui informasi dan tautan sampul acara.' : 'Acara akan ditinjau Admin sebelum tayang di katalog publik.'}
          </p>
        </div>
        {#if isEditMode}
          <button type="button" onclick={resetForm} class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white underline cursor-pointer">
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
  {/if}
</div>
