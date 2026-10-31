<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  onMount(() => {
    goto('/auth/register');
  });
</script>
<div class="text-center py-20 text-xs text-slate-400">Mengalihkan ke pendaftaran...</div>
