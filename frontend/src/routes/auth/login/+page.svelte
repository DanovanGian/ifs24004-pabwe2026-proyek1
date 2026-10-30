<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { Ticket, Sparkles, ArrowRight, Shield, User, Briefcase } from 'lucide-svelte';
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
      // Handled
    } finally {
      isLoading = false;
    }
  }

  function setDemo(demoEmail: string) {
    email = demoEmail;
    password = 'password123';
  }
</script>

<div class="max-w-md w-full bg-white p-10 border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50">
  <div class="text-center mb-8">
    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
      <Ticket class="w-6 h-6 -rotate-12" />
    </div>
    <h2 class="text-2xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
    <p class="text-xs text-slate-500 mt-1">Masuk untuk mengelola reservasi dan tiket Anda.</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Alamat Email</label>
      <input type="email" bind:value={email} required placeholder="nama@email.com" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-indigo-600 focus:bg-white bg-slate-50 transition" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Kata Sandi</label>
      <input type="password" bind:value={password} required placeholder="••••••••" class="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-indigo-600 focus:bg-white bg-slate-50 transition" />
    </div>

    <button type="submit" disabled={isLoading} class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2">
      <span>{isLoading ? 'Memproses Otentikasi...' : 'Masuk ke Platform'}</span>
      <ArrowRight class="w-4 h-4" />
    </button>
  </form>

  <!-- Akun Uji Coba Cepat 1-Klik -->
  <div class="mt-8 pt-6 border-t border-slate-100">
    <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 text-center">Login Cepat Akun Demo (1-Klik)</div>
    <div class="grid grid-cols-3 gap-2">
      <button onclick={() => setDemo('admin@eventify.com')} class="flex flex-col items-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition">
        <Shield class="w-4 h-4 mb-1 text-rose-500" />
        <span class="text-[10px] font-bold">Admin</span>
      </button>

      <button onclick={() => setDemo('organizer@eventify.com')} class="flex flex-col items-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition">
        <Briefcase class="w-4 h-4 mb-1 text-indigo-500" />
        <span class="text-[10px] font-bold">Organizer</span>
      </button>

      <button onclick={() => setDemo('budi@gmail.com')} class="flex flex-col items-center p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition">
        <User class="w-4 h-4 mb-1 text-emerald-500" />
        <span class="text-[10px] font-bold">Peserta</span>
      </button>
    </div>
  </div>
</div>
