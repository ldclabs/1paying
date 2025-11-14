<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte'
  import TextClipboardButton from '$lib/ui/TextClipboardButton.svelte'
  import { pruneAddress } from '$lib/utils/helper'

  const icpAddress = $derived(authStore.identity.getPrincipal().toText())
  const solAddress = $derived(authStore.identity.svmAddress || '')
  const evmAddress = $derived(authStore.identity.evmAddress || '')
</script>

<div class="mb-6 flex flex-col gap-6">
  <section class="">
    <div class="flex flex-col gap-1">
      <h3 class="text-base font-semibold text-slate-900">
        <span>Your address</span>
        <span
          class="inline w-fit rounded-full bg-sky-100 px-2 py-1 text-xs text-slate-500"
          >backed by {authStore.backedBy}</span
        >
      </h3>
      <div class="flex flex-row items-center gap-2 text-sm text-slate-500">
        <span class="font-medium tracking-wide uppercase">ICP:</span>
        <span>{pruneAddress(icpAddress, true)}</span>
        <TextClipboardButton
          value={icpAddress}
          class="text-slate-400 transition *:size-5 hover:text-slate-600"
        />
      </div>
      <div class="flex flex-row items-center gap-2 text-sm text-slate-500">
        <span class="font-medium tracking-wide uppercase">Solana:</span>
        {#if solAddress}
          <span>{pruneAddress(solAddress, true)}</span>
          <TextClipboardButton
            value={solAddress}
            class="text-slate-400 transition *:size-5 hover:text-slate-600"
          />
        {:else}
          <span class="text-slate-400">Not connected</span>
        {/if}
      </div>
      <div class="flex flex-row items-center gap-2 text-sm text-slate-500">
        <span class="font-medium tracking-wide uppercase">EVM:</span>
        {#if evmAddress}
          <span>{pruneAddress(evmAddress, true)}</span>
          <TextClipboardButton
            value={evmAddress}
            class="text-slate-400 transition *:size-5 hover:text-slate-600"
          />
        {:else}
          <span class="text-slate-400">Not connected</span>
        {/if}
      </div>
      <h3 class="mt-2 text-base font-semibold text-slate-900">
        <span>Support networks</span>
      </h3>
      <div class="space-x-2">
        <span class="font-mono text-slate-500">
          {authStore.supportNetworks.join(', ')}
        </span>
      </div>
    </div>
  </section>
</div>
