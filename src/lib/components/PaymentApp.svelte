<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte'
  import { toastRun } from '$lib/stores/toast.svelte'
  import { onMount } from 'svelte'
  import PaymentHistory from './PaymentHistory.svelte'

  const myIcpAddress = $derived(authStore.identity.getPrincipal().toText())

  onMount(() => {
    return toastRun(async () => {
      // await refreshHistory()
    }).abort
  })
</script>

<main class="w-full flex-1 bg-slate-50 p-4 sm:p-8">
  {#key myIcpAddress}
    <PaymentHistory />
  {/key}
</main>
