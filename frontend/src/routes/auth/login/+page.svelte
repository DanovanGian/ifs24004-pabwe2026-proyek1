<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../helpers/apiHelper.ts';
  import Swal from 'sweetalert2';

  let email = $state('');
  let password = $state('');
  let isLoading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    isLoading = true;

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Masuk',
        text: `Selamat datang, ${res.data.user.name}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      if (res.data.user.role === 'ADMIN') goto('/dashboard/admin');
      else if (res.data.user.role === 'ORGANIZER') goto('/dashboard/organizer');
      else goto('/');
    } catch {
      // Ditangani oleh apiHelper Swal
    } finally {
      isLoading = false;
    }
  }

  function setDemo(demoEmail: string) {
    email = demoEmail;
    password = 'password123';
  }
</script>

<div class="max-w-md w-full bg-white p-8 border border-slate-200 rounded-3xl shadow-sm">
  <div class="text-center mb-6">
    <span class="text-3xl">🎟️</span>
    <h2 class="text-2xl font-bold text-slate-900 mt-2">Masuk ke Eventify</h2>
    <p class="text-xs text-slate-500 mt-1">Platform Acara Desktop Delcom</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
      <input type="email" bind:value={email} required class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
      <input type="password" bind:value={password} required class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-indigo-600" />
    </div>

    <button type="submit" disabled={isLoading} class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition cursor-pointer">
      {isLoading ? 'Memproses...' : 'Masuk Akun'}
    </button>
  </form>

  <div class="mt-6 pt-6 border-t border-slate-100">
    <div class="text-xs text-slate-400 font-semibold mb-2">Login Demo Cepat:</div>
    <div class="grid grid-cols-3 gap-2">
      <button onclick={() => setDemo('admin@eventify.com')} class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">Admin</button>
      <button onclick={() => setDemo('organizer@eventify.com')} class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">Organizer</button>
      <button onclick={() => setDemo('budi@gmail.com')} class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">Peserta</button>
    </div>
  </div>
</div>
