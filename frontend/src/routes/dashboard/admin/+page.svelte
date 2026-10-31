<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { formatRupiah } from '../../../helpers/toolsHelper.ts';
  import { 
    Shield, Users, Tag, Calendar, Plus, Trash2, 
    CheckCircle2, XCircle, AlertCircle, Sparkles 
  } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let activeTab = $state<'overview' | 'users' | 'categories' | 'events'>('overview');

  let summary = $state<any>(null);
  let pendingEvents = $state<any[]>([]);
  let allEvents = $state<any[]>([]);
  let allUsers = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let newCategoryName = $state('');
  let isSubmittingCategory = $state(false);
  let isLoading = $state(true);

  async function loadAdminData() {
    isLoading = true;
    try {
      const [sumRes, pendingRes, allEvtRes, usersRes, catRes] = await Promise.all([
        apiRequest('/dashboard/summary'),
        apiRequest('/events?status=PENDING_APPROVAL'),
        apiRequest('/events'),
        apiRequest('/auth/users'),
        apiRequest('/events/categories'),
      ]);

      summary = sumRes.data;
      pendingEvents = pendingRes.data || [];
      allEvents = allEvtRes.data || [];
      allUsers = usersRes.data || [];
      categories = catRes.data || [];
    } catch {
      // Handled
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
      Swal.fire({
        icon: 'success',
        title: 'Status Diperbarui',
        text: `Acara telah di-${newStatus}`,
        timer: 1500,
        showConfirmButton: false,
      });
      loadAdminData();
    } catch {
      // Handled
    }
  }

  async function handleAddCategory(e: SubmitEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    isSubmittingCategory = true;

    try {
      await apiRequest('/events/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      Swal.fire({
        icon: 'success',
        title: 'Kategori Ditambahkan',
        text: `Kategori "${newCategoryName}" berhasil dibuat.`,
        timer: 1500,
        showConfirmButton: false,
      });

      newCategoryName = '';
      loadAdminData();
    } catch {
      // Handled
    } finally {
      isSubmittingCategory = false;
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    const confirm = await Swal.fire({
      title: 'Hapus Kategori?',
      text: `Apakah Anda yakin ingin menghapus kategori "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (confirm.isConfirmed) {
      try {
        await apiRequest(`/events/categories/${id}`, { method: 'DELETE' });
        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Kategori berhasil dihapus.', timer: 1500, showConfirmButton: false });
        loadAdminData();
      } catch {
        // Handled
      }
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    const confirm = await Swal.fire({
      title: 'Hapus Pengguna?',
      text: `Yakin ingin menghapus akun "${userName}"? Semua tiket terkait pengguna ini akan dibersihkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Pengguna',
      cancelButtonText: 'Batal',
    });

    if (confirm.isConfirmed) {
      try {
        await apiRequest(`/auth/users/${userId}`, { method: 'DELETE' });
        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Pengguna berhasil dihapus.', timer: 1500, showConfirmButton: false });
        loadAdminData();
      } catch {
        // Handled
      }
    }
  }

  async function handleAdminDeleteEvent(eventId: string, eventTitle: string) {
    const confirm = await Swal.fire({
      title: 'Hapus Acara Paksa?',
      text: `Sebagai Admin, Anda akan menghapus acara "${eventTitle}" secara permanen dari platform.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Paksa',
      cancelButtonText: 'Batal',
    });

    if (confirm.isConfirmed) {
      try {
        await apiRequest(`/events/${eventId}`, { method: 'DELETE' });
        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Acara berhasil dihapus dari platform.', timer: 1500, showConfirmButton: false });
        loadAdminData();
      } catch {
        // Handled
      }
    }
  }

  onMount(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'ADMIN') {
      Swal.fire({ icon: 'warning', title: 'Akses Terbatas', text: 'Halaman ini khusus Administrator.' });
      goto('/auth/login');
      return;
    }
    loadAdminData();
  });
</script>

<div class="max-w-6xl mx-auto space-y-8">
  <div class="flex justify-between items-center">
    <div>
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
        <Shield class="w-3.5 h-3.5" />
        Superuser Control Center
      </div>
      <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Moderation & Governance</h1>
      <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Pantau analitik global, moderasi acara masuk, tata kelola kategori, dan hak akses pengguna.</p>
    </div>

    <!-- Tab Navigasi Admin -->
    <div class="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl gap-1">
      <button 
        type="button"
        onclick={() => activeTab = 'overview'}
        class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'overview' ? 'bg-white dark:bg-rose-600 text-rose-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        📊 Ringkasan & Moderasi
      </button>
      <button 
        type="button"
        onclick={() => activeTab = 'users'}
        class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'users' ? 'bg-white dark:bg-rose-600 text-rose-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        👥 Pengguna ({allUsers.length})
      </button>
      <button 
        type="button"
        onclick={() => activeTab = 'categories'}
        class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'categories' ? 'bg-white dark:bg-rose-600 text-rose-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        🗂️ Kategori ({categories.length})
      </button>
      <button 
        type="button"
        onclick={() => activeTab = 'events'}
        class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer {activeTab === 'events' ? 'bg-white dark:bg-rose-600 text-rose-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
        📅 Semua Acara ({allEvents.length})
      </button>
    </div>
  </div>

  <!-- TAB 1: OVERVIEW METRIK & MODERASI ACARA PENDING -->
  {#if activeTab === 'overview'}
    {#if summary}
      <div class="grid grid-cols-4 gap-6">
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div class="text-slate-400 text-xs font-bold uppercase">Total Pendapatan</div>
          <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{formatRupiah(summary.totalRevenue)}</div>
        </div>
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div class="text-slate-400 text-xs font-bold uppercase">Tiket Terjual</div>
          <div class="text-2xl font-black text-slate-800 dark:text-white mt-2">{summary.totalTicketsSold} Tiket</div>
        </div>
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div class="text-slate-400 text-xs font-bold uppercase">Total Acara</div>
          <div class="text-2xl font-black text-slate-800 dark:text-white mt-2">{summary.totalEvents} Acara</div>
        </div>
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <div class="text-slate-400 text-xs font-bold uppercase">Pengguna Terdaftar</div>
          <div class="text-2xl font-black text-slate-800 dark:text-white mt-2">{summary.totalUsers} User</div>
        </div>
      </div>
    {/if}

    <div class="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] overflow-hidden shadow-xs">
      <div class="p-6 border-b border-slate-100 dark:border-white/[0.06] flex justify-between items-center">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white">Antrean Moderasi Acara Baru</h3>
        <span class="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-900">
          {pendingEvents.length} Menunggu Verifikasi
        </span>
      </div>

      {#if pendingEvents.length === 0}
        <div class="text-center py-16 text-slate-400 text-xs">
          Tidak ada acara baru yang memerlukan tinjauan saat ini.
        </div>
      {:else}
        <div class="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {#each pendingEvents as event}
            <div class="p-6 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
              <div class="space-y-1 max-w-xl">
                <span class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Perlu Review</span>
                <h4 class="font-extrabold text-base text-slate-900 dark:text-white">{event.title}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{event.description}</p>
                <div class="text-xs text-slate-400 pt-1">
                  📍 {event.location} • 📅 {new Date(event.date).toLocaleDateString('id-ID')}
                </div>
              </div>

              <div class="flex gap-2">
                <button 
                  type="button"
                  onclick={() => updateStatus(event.id, 'APPROVED')}
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                  ✓ Setujui
                </button>
                <button 
                  type="button"
                  onclick={() => updateStatus(event.id, 'REJECTED')}
                  class="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold cursor-pointer transition">
                  ✕ Tolak
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- TAB 2: MANAJEMEN PENGGUNA (USER MANAGEMENT) -->
  {:else if activeTab === 'users'}
    <div class="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] overflow-hidden shadow-xs">
      <div class="p-6 border-b border-slate-100 dark:border-white/[0.06]">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white">Daftar Pengguna Terdaftar di Platform</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin dapat mengawasi seluruh akun dan menghapus akun yang melanggar.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-white/[0.06]">
            <tr>
              <th class="p-4 pl-6">Pengguna</th>
              <th class="p-4">Email</th>
              <th class="p-4">Peran (Role)</th>
              <th class="p-4">Aktivitas</th>
              <th class="p-4">Tanggal Gabung</th>
              <th class="p-4 pr-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {#each allUsers as u}
              <tr class="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                <td class="p-4 pl-6 font-bold text-slate-900 dark:text-white">{u.name}</td>
                <td class="p-4 text-slate-500 dark:text-slate-400 font-mono">{u.email}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase {u.role === 'ADMIN' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900' : u.role === 'ORGANIZER' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-900' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-900'}">
                    {u.role}
                  </span>
                </td>
                <td class="p-4 text-slate-500 dark:text-slate-400">
                  {u.role === 'ORGANIZER' ? `${u._count.events} Acara Dibuat` : `${u._count.registrations} Tiket Dipesan`}
                </td>
                <td class="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                <td class="p-4 pr-6 text-right">
                  {#if u.role !== 'ADMIN'}
                    <button 
                      type="button"
                      onclick={() => handleDeleteUser(u.id, u.name)}
                      class="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg font-bold transition cursor-pointer">
                      Hapus Akun
                    </button>
                  {:else}
                    <span class="text-slate-400 text-[10px]">Superuser</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

  <!-- TAB 3: MANAJEMEN KATEGORI (CATEGORY MANAGEMENT) -> DIPERBAIKI LABEL A11Y DENGAN for="" -->
  {:else if activeTab === 'categories'}
    <div class="grid grid-cols-3 gap-8">
      <!-- Form Tambah Kategori -->
      <div class="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-4 h-fit">
        <div>
          <h3 class="font-bold text-base text-slate-900 dark:text-white">Tambah Kategori Acara</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelompokkan acara baru di platform.</p>
        </div>

        <form onsubmit={handleAddCategory} class="space-y-4">
          <div>
            <!-- LABEL TELAH DIHUBUNGKAN DENGAN id="category-name-input" AGAR BEBAS DARI WARNING A11Y -->
            <label for="category-name-input" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Nama Kategori
            </label>
            <input 
              id="category-name-input"
              type="text" 
              bind:value={newCategoryName} 
              required 
              placeholder="Contoh: Olahraga & Marathon" 
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-rose-500 text-slate-900 dark:text-white" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmittingCategory}
            class="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5">
            <Plus class="w-4 h-4" />
            <span>Simpan Kategori</span>
          </button>
        </form>
      </div>

      <!-- Daftar Kategori Aktif -->
      <div class="col-span-2 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] overflow-hidden shadow-xs">
        <div class="p-6 border-b border-slate-100 dark:border-white/[0.06]">
          <h3 class="font-bold text-base text-slate-900 dark:text-white">Kategori Acara Aktif</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar kategori yang tampil di filter pencarian beranda.</p>
        </div>

        <div class="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {#each categories as cat}
            <div class="p-4 px-6 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
              <div>
                <span class="font-bold text-xs text-slate-900 dark:text-white">{cat.name}</span>
                <span class="text-[10px] text-slate-400 font-mono block">slug: {cat.slug}</span>
              </div>

              <div class="flex items-center gap-4">
                <span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold">
                  {cat._count?.events || 0} Acara
                </span>
                <button 
                  type="button" 
                  onclick={() => handleDeleteCategory(cat.id, cat.name)}
                  class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer"
                  title="Hapus Kategori">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

  <!-- TAB 4: KONTROL SEMUA ACARA PLATFORM -->
  {:else if activeTab === 'events'}
    <div class="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] overflow-hidden shadow-xs">
      <div class="p-6 border-b border-slate-100 dark:border-white/[0.06]">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white">Semua Acara yang Sedang Tayang di Platform</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sebagai Superuser, Admin dapat menghapus paksa acara yang melanggar ketentuan.</p>
      </div>

      <div class="divide-y divide-slate-100 dark:divide-white/[0.06]">
        {#each allEvents as evt}
          <div class="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
            <div class="space-y-1">
              <span class="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800 rounded-md text-[10px] font-black uppercase">
                {evt.status}
              </span>
              <h4 class="font-extrabold text-base text-slate-900 dark:text-white">{evt.title}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                📍 {evt.location} • 📅 {new Date(evt.date).toLocaleDateString('id-ID')} • Kategori: <strong>{evt.category?.name}</strong>
              </p>
            </div>

            <button 
              type="button"
              onclick={() => handleAdminDeleteEvent(evt.id, evt.title)}
              class="px-4 py-2 border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus Paksa Acara</span>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
