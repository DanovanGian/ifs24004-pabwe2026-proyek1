<script lang="ts">
  import '../index.css';
  import { page } from '$app/state';
  import AppLayout from '../features/common/components/AppLayout.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let isAuthRoute = $derived(page.url.pathname.startsWith('/auth'));
</script>

{#if isAuthRoute}
  <div class="min-w-[1024px] min-h-screen bg-slate-50 flex items-center justify-center p-6">
    {@render children()}
  </div>
{:else}
  <AppLayout>
    {@render children()}
  </AppLayout>
{/if}
