<script lang="ts">
  import '../index.css';
  import { page } from '$app/state';
  import AppLayout from '../features/common/components/AppLayout.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let isAuthRoute = $derived(page.url.pathname.startsWith('/auth'));
</script>

{#if isAuthRoute}
  <!-- Fullscreen Edge-to-Edge untuk Rute Auth tanpa Padding Pembatas -->
  <div class="min-w-[1024px] min-h-screen w-full bg-white dark:bg-[#090D16]">
    {@render children()}
  </div>
{:else}
  <AppLayout>
    {@render children()}
  </AppLayout>
{/if}
