<script lang="ts">
  import { page } from '$app/state'
  import PaymentRequirementCard from '$lib/components/PaymentRequirementCard.svelte'
  import RefreshLine from '$lib/icons/refresh-line.svelte'
  import { authStore, EventLogin } from '$lib/stores/auth.svelte'
  import { showModal } from '$lib/stores/modal.svelte.ts'
  import { paymentStore } from '$lib/stores/payment.svelte.ts'
  import { toastRun } from '$lib/stores/toast.svelte'
  import PrimaryButton from '$lib/ui/PrimaryButton.svelte'
  import { pruneAddress } from '$lib/utils/helper'
  import {
    parseAndVerifyPaymentMessage,
    PaymentInfo,
    selectedPaymentRequirements
  } from '$src/lib/utils/payment.svelte'
  import { onMount, tick } from 'svelte'
  import QuillPenAiLine from '../icons/quill-pen-ai-line.svelte'
  import ConnectWalletModal from './ConnectWalletModal.svelte'

  const myIcpAddress = $derived(authStore.identity.getPrincipal().toText())
  const isAuthenticated = $derived(authStore.identity.isAuthenticated)

  let { isReady = $bindable() }: { isReady: boolean } = $props()

  let isLoading = $state<boolean>(false)
  let isSigningIn = $state<boolean>(false)
  let signFinished = $state(false)
  let signFailed = $state('')
  let selectedIndex = $state(-1)
  let responseError = $state('')
  let x402Version = $state(1)
  let tx = $state<string>('')
  let accepts = $state<PaymentInfo[]>([])

  const selected = $derived(
    selectedIndex >= 0 && selectedIndex < accepts.length
      ? accepts[selectedIndex]
      : null
  )
  const selectedAddress = $derived.by(() => {
    if (!isAuthenticated || !selected) return ''
    switch (selected.payment.network) {
      case 'solana':
        return `${pruneAddress(authStore.identity.svmAddress)} on Solana`
      case 'solana-devnet':
        return `${pruneAddress(authStore.identity.svmAddress)} on Solana Devnet`
      case 'icp':
        return `${pruneAddress(myIcpAddress)} on Internet Computer`
      default:
        return ''
    }
  })
  const success = $derived(signFinished && !signFailed)

  $effect(() => {
    accepts.sort((a, b) => {
      if (a.isDisabled !== b.isDisabled) {
        return a.isDisabled ? 1 : -1
      }
      return 0
    })
    tick().then(() => {
      selectedIndex = 0
    })
  })

  function onSignInModal() {
    showModal({
      title: 'Connect wallet',
      component: ConnectWalletModal
    })
  }

  function handleSelectRequirement(index: number) {
    if (index < 0 || index >= accepts.length) {
      return
    }
    selectedIndex = index
  }

  function handlePay() {
    if (!selected || !tx || !isAuthenticated || isLoading) {
      return
    }

    isLoading = true
    toastRun(async () => {
      const result = await paymentStore.buildX402Request(selected, x402Version)
      await paymentStore.submitTransaction(tx, result)
      signFinished = true
      if (result.error) {
        signFailed = result.error.message
        throw result.error.message
      }
    }).finally(() => {
      isLoading = false
    })
  }

  function fetchMyBalance() {
    for (const info of accepts) {
      switch (info.payment.network) {
        case 'solana':
        case 'solana-devnet':
          info.fetchBalance(paymentStore, authStore.identity.svmAddress)
          break
        case 'base':
        case 'base-sepolia':
          info.fetchBalance(paymentStore, authStore.identity.evmAddress)
          break
        case 'icp':
          info.fetchBalance(
            paymentStore,
            authStore.identity.getPrincipal().toText()
          )
          break
      }
    }
  }

  onMount(() => {
    return toastRun((_signal, abortingQue) => {
      const url = new URL(page.url)
      const { txid, paymentRequirementsResponse } =
        parseAndVerifyPaymentMessage(url.hash.slice(1))
      tx = txid
      x402Version = paymentRequirementsResponse.x402Version
      accepts = selectedPaymentRequirements(paymentRequirementsResponse.accepts)
      responseError = paymentRequirementsResponse.error
      selectedIndex = accepts.length > 0 ? 0 : -1
      authStore.addEventListener(EventLogin, fetchMyBalance)
      isReady = true

      abortingQue.push(() => {
        authStore.removeEventListener(EventLogin, fetchMyBalance)
      })
    }).abort
  })
</script>

<main class="w-full flex-1 bg-slate-50 p-4 sm:p-8">
  {#key myIcpAddress}
    <div class="relative m-auto flex max-w-5xl flex-col gap-6">
      <section
        class="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur md:gap-6 md:p-6"
      >
        <header class="flex flex-col gap-2">
          <span class="text-xs font-semibold text-sky-600"
            >x402 v{x402Version}</span
          >
          {#if success}
            <div class="m-auto mt-6 text-green-600 *:size-10"
              ><QuillPenAiLine /></div
            >
            <h1
              class="text-center text-lg font-semibold text-green-600 sm:text-2xl"
            >
              Payment Signed Successfully!
            </h1>
            <p class="mb-10 text-center text-slate-600"
              >You can close this tab and return to your app.</p
            >
          {:else}
            <h1 class="text-lg font-semibold text-slate-900 sm:text-2xl">
              Please select a payment request to proceed.
            </h1>
          {/if}
        </header>

        {#if responseError && !success}
          <div
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm"
          >
            <span>Server response message:</span><span class="ml-2 text-red-600"
              >{responseError}</span
            >
          </div>
        {/if}

        {#if accepts.length > 0}
          <div class="m-auto w-fit max-w-full rounded-xl p-0 shadow-inner">
            <div class="flex snap-x snap-mandatory gap-4 overflow-x-auto p-4">
              {#each accepts as info, index}
                <div class="snap-center">
                  <PaymentRequirementCard
                    {info}
                    selected={index === selectedIndex}
                    disabled={signFinished ||
                      !authStore.supportNetworks.includes(info.payment.network)}
                    onSelect={() => handleSelectRequirement(index)}
                  />
                </div>
              {/each}
            </div>
          </div>
        {:else if !success}
          <div
            class="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
          >
            There are no available payment requests to choose.
          </div>
        {/if}

        <div class="flex flex-col space-y-2 text-sm text-slate-600">
          <div class="space-x-2">
            <span
              class="text-xs font-medium tracking-wide text-slate-500 uppercase"
            >
              Support networks:
            </span>
            <span class="font-mono text-slate-500">
              {authStore.supportNetworks.join(', ')}
            </span>
          </div>
          {#if selected}
            <div class="flex items-center space-x-2">
              <span
                class="text-xs font-medium tracking-wide text-slate-500 uppercase"
              >
                Selected:
              </span>
              <span class="font-medium text-slate-900"
                >{selected.formatAmount(selected.maxAmountRequired)}</span
              >
              <span class="truncate font-medium text-slate-900">
                {`${selected.token!.name} (${selected.token!.symbol})`}
              </span>
            </div>
            <div class="space-x-2">
              <span
                class="text-xs font-medium tracking-wide text-slate-500 uppercase"
              >
                Payer Address:
              </span>
              <span class="font-mono text-slate-500">
                {selectedAddress}
              </span>
            </div>
            {#if signFailed}
              <div class="flex items-center space-x-2 text-red-600">
                <span class="text-xs font-medium tracking-wide uppercase">
                  Sign failed:
                </span>
                <span class="">
                  {signFailed}
                </span>
                <button
                  type="button"
                  class="flex items-center gap-2 px-3 py-1 text-sky-500 hover:text-sky-800"
                  onclick={() => window.location.reload()}
                >
                  <span class="*:size-5"><RefreshLine /></span>Retry
                </button>
              </div>
            {/if}
          {/if}
        </div>
      </section>

      {#if !isAuthenticated}
        <div class="flex justify-end">
          <PrimaryButton
            onclick={onSignInModal}
            isLoading={isSigningIn}
            class="bg-green-600! px-10 hover:bg-green-500!"
          >
            <span>Connect wallet</span>
          </PrimaryButton>
        </div>
      {:else}
        <div class="flex justify-end">
          <PrimaryButton
            onclick={handlePay}
            {isLoading}
            disabled={!isAuthenticated || signFinished || !selected}
            class="px-10 {success
              ? 'bg-green-400!'
              : 'bg-green-600!  hover:bg-green-500!'}"
          >
            {#if success}
              <span>Payment signed</span>
            {:else}
              <span>Sign payment</span>
            {/if}
          </PrimaryButton>
        </div>
      {/if}
    </div>
  {/key}
</main>
