<script lang="ts">
  import { apiRequest } from '#lib/api/client.ts';
  import { auth } from '#lib/stores/auth.svelte.ts';

  let email = $state('');
  let password = $state('');
  let errorMessage = $state('');
  let isLoading = $state(false);

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = '';
    isLoading = true;

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      auth.setSession(res.data.user, res.data.token);
      
      // Arahkan sesuai peran
      if (res.data.user.role === 'ADMIN') window.location.href = '/dashboard/admin';
      else if (res.data.user.role === 'ORGANIZER') window.location.href = '/dashboard/organizer';
      else window.location.href = '/';
    } catch (err: any) {
      errorMessage = err.message;
    } finally {
      isLoading = false;
    }
  }

  function fillDemo(demoEmail: string) {
    email = demoEmail;
    password = 'password123';
  }
</script>

<div class="max-w-md mx-auto mt-12 bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
  <h2 class="text-2xl font-bold text-slate-900 mb-1">Masuk ke Eventify</h2>
  <p class="text-sm text-slate-500 mb-6">Kelola acara dan tiket Anda dengan mudah.</p>

  {#if errorMessage}
    <div class="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
      {errorMessage}
    </div>
  {/if}

  <form onsubmit={handleLogin} class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
      <input 
        type="email" 
        bind:value={email} 
        required 
        placeholder="nama@email.com" 
        class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600" />
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
      <input 
        type="password" 
        bind:value={password} 
        required 
        placeholder="••••••••" 
        class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-indigo-600" />
    </div>

    <button 
      type="submit" 
      disabled={isLoading}
      class="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer">
      {isLoading ? 'Memproses...' : 'Masuk Akun'}
    </button>
  </form>

  <!-- Tombol Akun Mock Cepat -->
  <div class="mt-8 pt-6 border-t border-slate-200">
    <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Login Cepat (Akun Demo In-Memory):</div>
    <div class="grid grid-cols-3 gap-2">
      <button onclick={() => fillDemo('admin@eventify.com')} class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold">Admin</button>
      <button onclick={() => fillDemo('organizer@eventify.com')} class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold">Organizer</button>
      <button onclick={() => fillDemo('budi@gmail.com')} class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold">Peserta</button>
    </div>
  </div>
</div>
