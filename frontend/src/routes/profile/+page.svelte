<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../helpers/apiHelper.ts';
  import { 
    User, Mail, Lock, Shield, Briefcase, Ticket, 
    Save, KeyRound, Eye, EyeOff, Sparkles, UploadCloud, Camera, Trash2, CheckCircle2 
  } from 'lucide-svelte';
  import Swal from 'sweetalert2';

  let profileData = $state<any>(null);
  let name = $state('');
  let email = $state('');
  let avatarUrl = $state('');
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmNewPassword = $state('');

  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);
  let isLoading = $state(true);
  let isSaving = $state(false);
  let uploadMethod = $state<'local' | 'url'>('local');

  // Preset Avatar Cepat
  const avatarPresets = [
    { name: 'Pria Bisnis', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
    { name: 'Wanita Kreatif', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
    { name: 'Tech Engineer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
    { name: '3D Avatar', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300' }
  ];

  async function loadProfile() {
    isLoading = true;
    try {
      const res = await apiRequest('/auth/profile');
      profileData = res.data;
      name = profileData.name;
      email = profileData.email;
      avatarUrl = profileData.avatarUrl || '';
    } catch {
      // Handled
    } finally {
      isLoading = false;
    }
  }

  // ==========================================
  // FITUR UPLOAD FOTO DARI LAPTOP / LOKAL
  // ==========================================
  function handleLocalFileUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    // Batasan maksimal ukuran file 10MB
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Ukuran Terlalu Besar',
        text: 'Ukuran foto maksimal adalah 10MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Otomatis crop & kompresi cerdas ke ukuran 300x300 piksel melingkar
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        // Center Crop
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        ctx?.drawImage(img, startX, startY, size, size, 0, 0, 300, 300);

        // Ubah menjadi Base64 Data URL berkualitas tinggi yang sangat ringan
        avatarUrl = canvas.toDataURL('image/jpeg', 0.88);

        Swal.fire({
          icon: 'success',
          title: 'Foto Terpilih',
          text: 'Foto profil lokal berhasil dimuat. Jangan lupa klik "Simpan Perubahan Profil".',
          timer: 1500,
          showConfirmButton: false,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdateProfile(e: SubmitEvent) {
    e.preventDefault();

    if (newPassword && newPassword !== confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Kata Sandi Tidak Cocok',
        text: 'Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru.',
      });
      return;
    }

    isSaving = true;

    try {
      const res = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          avatarUrl: avatarUrl.trim() || null,
          currentPassword: currentPassword.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      // Update data di localStorage agar avatar di navbar langsung berganti seketika
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.name = res.data.name;
      currentUser.email = res.data.email;
      currentUser.avatarUrl = res.data.avatarUrl;
      localStorage.setItem('user', JSON.stringify(currentUser));

      Swal.fire({
        icon: 'success',
        title: 'Profil Diperbarui',
        text: 'Data profil dan foto baru Anda berhasil disimpan!',
        timer: 1500,
        showConfirmButton: false,
      });

      currentPassword = '';
      newPassword = '';
      confirmNewPassword = '';
      loadProfile();
    } catch {
      // Handled
    } finally {
      isSaving = false;
    }
  }

  onMount(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      goto('/auth/login');
      return;
    }
    loadProfile();
  });
</script>

<div class="max-w-4xl mx-auto space-y-8">
  <div>
    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
      <Sparkles class="w-3.5 h-3.5" />
      Pengaturan Akun Pengguna
    </div>
    <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Profil & Foto Akun</h1>
    <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Upload foto dari komputer, perbarui identitas akun, dan kelola kata sandi.</p>
  </div>

  {#if isLoading}
    <div class="text-center py-24 text-slate-400">Memuat profil Anda...</div>
  {:else if profileData}
    <div class="grid grid-cols-12 gap-8">
      
      <!-- KARTU KIRI: AVATAR LIVE PREVIEW & STATISTIK (4 Kolom) -->
      <div class="col-span-4 space-y-6">
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-xs text-center space-y-4">
          <!-- Lingkaran Avatar Live Preview -->
          <div class="relative w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20">
            <div class="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-white font-black text-3xl">
              {#if avatarUrl}
                <img src={avatarUrl} alt={name} class="w-full h-full object-cover" />
              {:else}
                <span class="text-slate-700 dark:text-slate-200">{name.charAt(0).toUpperCase()}</span>
              {/if}
            </div>
            <label 
              for="avatar-file-input"
              class="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md cursor-pointer hover:scale-105 transition" 
              title="Ganti Foto dari Laptop">
              <Camera class="w-3.5 h-3.5" />
            </label>
          </div>

          <div>
            <h3 class="font-extrabold text-lg text-slate-900 dark:text-white">{profileData.name}</h3>
            <p class="text-xs text-slate-400 font-mono mt-0.5">{profileData.email}</p>
          </div>

          <!-- Lencana Role -->
          <div>
            <span class="px-3 py-1 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5 {profileData.role === 'ADMIN' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900' : profileData.role === 'ORGANIZER' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border border-indigo-200 dark:border-indigo-900' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-900'}">
              {#if profileData.role === 'ADMIN'}
                <Shield class="w-3.5 h-3.5" />
              {:else if profileData.role === 'ORGANIZER'}
                <Briefcase class="w-3.5 h-3.5" />
              {:else}
                <User class="w-3.5 h-3.5" />
              {/if}
              <span>Role: {profileData.role}</span>
            </span>
          </div>

          <!-- Statistik Aktivitas Role -->
          <div class="pt-4 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 space-y-2 text-left">
            {#if profileData.role === 'ORGANIZER'}
              <div class="flex justify-between items-center">
                <span>Acara Dikelola:</span>
                <strong class="text-slate-800 dark:text-slate-200">{profileData._count?.events || 0} Acara</strong>
              </div>
            {:else if profileData.role === 'PARTICIPANT'}
              <div class="flex justify-between items-center">
                <span>Tiket Dimiliki:</span>
                <strong class="text-slate-800 dark:text-slate-200">{profileData._count?.tickets || 0} Tiket</strong>
              </div>
            {:else}
              <div class="flex justify-between items-center">
                <span>Hak Istimewa:</span>
                <strong class="text-rose-600">Super Administrator</strong>
              </div>
            {/if}
            <div class="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span>Bergabung Sejak:</span>
              <span>{new Date(profileData.createdAt).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KARTU KANAN: FORM EDIT PROFIL & FOTO LOKAL (8 Kolom) -->
      <div class="col-span-8 bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
        <form onsubmit={handleUpdateProfile} class="space-y-6">
          
          <!-- SEKSI 1: UPLOAD FOTO PROFIL (LOKAL DARI LAPTOP ATAU URL) -->
          <div class="space-y-3.5 p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl">
            <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                <Camera class="w-4 h-4 text-indigo-500" />
                Foto Profil Pengguna (Avatar)
              </span>

              {#if avatarUrl}
                <button type="button" onclick={() => avatarUrl = ''} class="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer">
                  <Trash2 class="w-3 h-3" />
                  <span>Hapus Foto</span>
                </button>
              {/if}
            </div>

            <!-- Tab Pemilih Metode: File Laptop vs Tautan URL -->
            <div class="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl gap-1 w-fit text-xs font-bold">
              <button 
                type="button" 
                onclick={() => uploadMethod = 'local'} 
                class="px-3.5 py-1.5 rounded-lg transition {uploadMethod === 'local' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
                📁 Upload dari Laptop
              </button>
              <button 
                type="button" 
                onclick={() => uploadMethod = 'url'} 
                class="px-3.5 py-1.5 rounded-lg transition {uploadMethod === 'url' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'}">
                🔗 Tautan Web (URL)
              </button>
            </div>

            <!-- Input File Lokal (Membuka Finder / File Explorer) -->
            {#if uploadMethod === 'local'}
              <div class="space-y-2">
                <!-- Hidden Real File Input -->
                <input 
                  id="avatar-file-input"
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onchange={handleLocalFileUpload}
                  class="hidden" 
                />

                <label 
                  for="avatar-file-input"
                  class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800/50 cursor-pointer transition group">
                  <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    <UploadCloud class="w-5 h-5" />
                  </div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Klik untuk memilih foto dari Laptop / Komputer Anda
                  </span>
                  <span class="text-[10px] text-slate-400 mt-1">Mendukung file PNG, JPG, JPEG, atau WebP (Maks. 10MB)</span>
                </label>
              </div>

            <!-- Input Tautan URL & Preset -->
            {:else}
              <div class="space-y-3">
                <input 
                  id="profile-avatar-url"
                  type="url" 
                  bind:value={avatarUrl} 
                  placeholder="https://images.unsplash.com/photo-..." 
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-slate-800 text-xs font-medium focus:outline-indigo-600 text-slate-900 dark:text-white" 
                />

                <div class="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span class="font-semibold text-slate-400">Pilihan Cepat:</span>
                  {#each avatarPresets as preset}
                    <button 
                      type="button" 
                      onclick={() => avatarUrl = preset.url}
                      class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold hover:border-indigo-500 hover:text-indigo-600 cursor-pointer">
                      {preset.name}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <!-- SEKSI 2: INFORMASI PRIBADI -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User class="w-4 h-4 text-indigo-500" />
              Informasi Pribadi
            </h4>

            <div>
              <label for="profile-name" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Nama Lengkap</label>
              <input 
                id="profile-name"
                type="text" 
                bind:value={name} 
                required 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-indigo-600 text-slate-900 dark:text-white" 
              />
            </div>

            <div>
              <label for="profile-email" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Alamat Email</label>
              <input 
                id="profile-email"
                type="email" 
                bind:value={email} 
                required 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-indigo-600 text-slate-900 dark:text-white font-mono" 
              />
            </div>
          </div>

          <!-- SEKSI 3: GANTI KATA SANDI (OPSIONAL) -->
          <div class="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-4">
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound class="w-4 h-4 text-amber-500" />
                Ganti Kata Sandi (Opsional)
              </h4>
              <p class="text-[11px] text-slate-400 mt-0.5">Biarkan kosong jika Anda tidak ingin mengubah kata sandi.</p>
            </div>

            <div>
              <label for="current-pwd" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Kata Sandi Saat Ini</label>
              <div class="relative">
                <input 
                  id="current-pwd"
                  type={showCurrentPassword ? 'text' : 'password'} 
                  bind:value={currentPassword} 
                  placeholder="Masukkan sandi lama jika ingin mengganti" 
                  class="w-full px-4 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800 text-xs focus:outline-indigo-600 text-slate-900 dark:text-white" 
                />
                <button 
                  type="button" 
                  onclick={() => showCurrentPassword = !showCurrentPassword}
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                  {#if showCurrentPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="new-pwd" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Kata Sandi Baru</label>
                <div class="relative">
                  <input 
                    id="new-pwd"
                    type={showNewPassword ? 'text' : 'password'} 
                    bind:value={newPassword} 
                    placeholder="Minimal 6 karakter" 
                    class="w-full px-4 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800 text-xs focus:outline-indigo-600 text-slate-900 dark:text-white" 
                  />
                  <button 
                    type="button" 
                    onclick={() => showNewPassword = !showNewPassword}
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                    {#if showNewPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
                  </button>
                </div>
              </div>

              <div>
                <label for="confirm-pwd" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Konfirmasi Sandi Baru</label>
                <input 
                  id="confirm-pwd"
                  type="password" 
                  bind:value={confirmNewPassword} 
                  placeholder="Ulangi sandi baru" 
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-slate-800 text-xs focus:outline-indigo-600 text-slate-900 dark:text-white" 
                />
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center gap-2 disabled:opacity-50">
              <Save class="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
