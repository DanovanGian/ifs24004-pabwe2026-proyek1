<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
  <span class="text-6xl font-black text-indigo-600">{page.status}</span>
  <h1 class="text-2xl font-bold text-slate-800">Halaman Tidak Ditemukan</h1>
  <p class="text-slate-500 max-w-md">{page.error?.message || 'Maaf, rute yang Anda tuju tidak tersedia.'}</p>
  <a href="/" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
    Kembali ke Beranda
  </a>
</div>
