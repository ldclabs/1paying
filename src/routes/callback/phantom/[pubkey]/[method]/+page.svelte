<script lang="ts">
  import { page } from '$app/state'
  import { onMount } from 'svelte'
  import { createCborRequest } from '$lib/utils/fetcher'

  const api = createCborRequest('https://api.1pay.ing/phantom')
  const params = page.params as { pubkey: string; method: string }

  let submitting = true
  let submitError: string | null = null

  onMount(async () => {
    try {
      const msg = new URLSearchParams(page.url.search)
      const body: Record<string, string> = Object.fromEntries(msg.entries())

      await api.post<void>(`/${params.pubkey}/${params.method}`, body)
    } catch (err) {
      submitError = 'Failed to relay data to 1Pay.ing. You may try again.'
      console.error('Phantom callback relay error', err)
    } finally {
      submitting = false
    }
  })
</script>

<div class="flex min-h-screen flex-col bg-white text-slate-900">
  <main
    class="flex flex-1 flex-col items-center justify-start px-6 text-center"
  >
    <header class="my-10 sm:my-20">
      <a href="/" class="flex flex-col items-start">
        <img src="/_assets/1pay_dark.webp" alt="1Pay.ing" class="h-10 w-auto" />
        <span class="font-outfit text-sm text-slate-500"
          >The Web3 Payment Wallet</span
        >
      </a>
    </header>
    {#if submitting}
      <h1 class="mb-3 text-lg font-semibold">Processing your request…</h1>
      <p class="max-w-md text-sm text-slate-600">
        Please wait while we relay the response from Phantom back to 1Pay.ing.
        This page will be safe to close in a moment.
      </p>
    {:else if submitError}
      <h1 class="mb-3 text-lg font-semibold">Something went wrong</h1>
      <p class="text max-w-md text-slate-600">
        {submitError}
      </p>
      <p class="mt-3 max-w-md text-sm text-slate-500">
        After closing this page, return to your 1Pay.ing session and try the
        action again.
      </p>
    {:else}
      <h1 class="mb-3 text-lg font-semibold">You can go back now</h1>
      <p class="text max-w-md text-slate-600">
        The response from Phantom has been successfully relayed to 1Pay.ing.
        Please return to the original 1Pay.ing tab or app to continue.
      </p>
      <p class="mt-3 max-w-md text-sm text-slate-500">
        This window is only used as a temporary relay page and can now be safely
        closed.
      </p>
    {/if}
  </main>

  <footer class="border-t border-slate-100 bg-slate-50 py-8">
    <div class="mx-auto max-w-6xl px-6">
      <div
        class="flex flex-col gap-2 border-t border-slate-100 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
      >
        <p
          >© {new Date().getFullYear()}
          <span class="font-outfit font-bold text-black">1Pay.ing</span>. All
          rights reserved.</p
        >
        <a class="hover:text-slate-900" href="mailto:team@1pay.ing"
          >hi@1pay.ing</a
        >
      </div>
    </div>
  </footer>
</div>
