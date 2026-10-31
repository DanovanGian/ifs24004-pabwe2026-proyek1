<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  onMount(() => {
    goto('/auth/login');
  });
</script>
<div class="text-center py-20 text-xs text-slate-400">Mengalihkan ke halaman masuk...</div>
