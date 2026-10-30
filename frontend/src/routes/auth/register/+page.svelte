<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import Swal from 'sweetalert2';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let role = $state<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT');
  let isLoading = $state(false);

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();
    isLoading = true;

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil',
        text: 'Akun Anda telah terdaftar! Silakan login.',
        timer: 1500,
        showConfirmButton: false,
      });

      goto('/auth/login');
    } catch {
      // Ditangani otomatis oleh apiHelper (Swal)
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-md w-full bg-white p-8 border border-slate-200 rounded-3xl shadow-sm">
  <div class="text-center mb-6">
    <span class="text-3xl">📝</span>
    <h2 class="text-2xl font-bold text-slate-900 mt-2">Daftar Akun Baru</h2>
    <p class="text-xs text-slate-500 mt-1">Bergabung dengan ekosistem Eventify</p>
  </div>

  <form onsubmit={handleRegister} class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap</label>
      <input type="text" bind:value={name} required placeholder="Contoh: Budi Santoso" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
      <input type="email" bind:value={email} required placeholder="budi@gmail.com" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
      <input type="password" bind:value={password} required placeholder="Minimal 6 karakter" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Daftar Sebagai</label>
      <select bind:value={role} class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600 bg-white">
        <option value="PARTICIPANT">Peserta Acara (Participant)</option>
        <option value="ORGANIZER">Penyelenggara Acara (Organizer)</option>
      </select>
    </div>

    <button type="submit" disabled={isLoading} class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition cursor-pointer">
      {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
    </button>
  </form>

  <div class="mt-6 text-center text-xs text-slate-500">
    Sudah punya akun? 
    <a href="/auth/login" class="font-bold text-indigo-600 hover:underline">Masuk di sini</a>
  </div>
</div>
