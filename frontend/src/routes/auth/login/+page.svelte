<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiRequest } from '../../../helpers/apiHelper.ts';
  import { Ticket, ArrowRight, Shield, User, Briefcase } from 'lucide-svelte';
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
      // Handled otomatis oleh apiHelper
    } finally {
      isLoading = false;
    }
  }

  // Fungsi pengisian demo instan
  function fillDemo(demoEmail: string) {
    email = demoEmail;
    password = 'password123';
  }
</script>

<div class="max-w-md w-full mx-auto bg-white dark:bg-[#0F172A] p-10 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-xl">
  <div class="text-center mb-8">
    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
      <Ticket class="w-6 h-6 -rotate-12" />
    </div>
    <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Selamat Datang</h2>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Masuk untuk mengelola reservasi dan tiket Anda.</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Alamat Email</label>
      <input 
        type="email" 
        bind:value={email} 
        required 
        placeholder="nama@email.com" 
        class="w-full px-4 py-3 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs font-medium focus:outline-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" 
      />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Kata Sandi</label>
      <input 
        type="password" 
        bind:value={password} 
        required 
        placeholder="••••••••" 
        class="w-full px-4 py-3 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs font-medium focus:outline-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" 
      />
    </div>

    <button type="submit" disabled={isLoading} class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2">
      <span>{isLoading ? 'Memproses...' : 'Masuk ke Platform'}</span>
      <ArrowRight class="w-4 h-4" />
    </button>
  </form>

  <!-- Tombol Akun Uji Coba Cepat (Menggunakan type="button" agar tidak reload) -->
  <div class="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.08]">
    <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 text-center">Login Cepat Akun Demo (1-Klik)</div>
    <div class="grid grid-cols-3 gap-2">
      <button 
        type="button" 
        onclick={() => fillDemo('admin@eventify.com')} 
        class="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer">
        <Shield class="w-4 h-4 mb-1 text-rose-500" />
        <span class="text-[10px] font-bold">Admin</span>
      </button>

      <button 
        type="button" 
        onclick={() => fillDemo('organizer@eventify.com')} 
        class="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer">
        <Briefcase class="w-4 h-4 mb-1 text-indigo-500" />
        <span class="text-[10px] font-bold">Organizer</span>
      </button>

      <button 
        type="button" 
        onclick={() => fillDemo('budi@gmail.com')} 
        class="flex flex-col items-center p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer">
        <User class="w-4 h-4 mb-1 text-emerald-500" />
        <span class="text-[10px] font-bold">Peserta</span>
      </button>
    </div>
  </div>
</div>
