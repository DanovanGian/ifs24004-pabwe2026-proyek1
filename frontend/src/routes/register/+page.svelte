<script lang="ts">
  import { apiRequest } from '#lib/api/client.ts';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let role = $state<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT');
  let errorMessage = $state('');
  let successMessage = $state('');
  let isLoading = $state(false);

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = '';
    successMessage = '';
    isLoading = true;

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      successMessage = 'Registrasi berhasil! Mengalihkan ke login...';
      setTimeout(() => window.location.href = '/login', 1500);
    } catch (err: any) {
      errorMessage = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-md mx-auto mt-12 bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
  <h2 class="text-2xl font-bold text-slate-900 mb-1">Daftar Akun Baru</h2>
  <p class="text-sm text-slate-500 mb-6">Pilih peran dan mulai nikmati acara digital.</p>

  {#if errorMessage}
    <div class="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{errorMessage}</div>
  {/if}

  {#if successMessage}
    <div class="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">{successMessage}</div>
  {/if}

  <form onsubmit={handleRegister} class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap</label>
      <input type="text" bind:value={name} required placeholder="Contoh: Alex Pratama" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
      <input type="email" bind:value={email} required placeholder="alex@email.com" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
      <input type="password" bind:value={password} required placeholder="Minimal 6 karakter" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Daftar Sebagai</label>
      <select bind:value={role} class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600 bg-white">
        <option value="PARTICIPANT">Peserta Acara (Participant)</option>
        <option value="ORGANIZER">Penyelenggara Acara (Organizer)</option>
      </select>
    </div>

    <button type="submit" disabled={isLoading} class="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer">
      {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
    </button>
  </form>
</div>
