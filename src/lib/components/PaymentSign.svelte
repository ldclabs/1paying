<script lang="ts">
  import { page } from '$app/state'
  import PaymentRequirementCard from '$lib/components/PaymentRequirementCard.svelte'
  import RefreshLine from '$lib/icons/refresh-line.svelte'
  import { authStore, EventLogin } from '$lib/stores/auth.svelte'
  import { showModal } from '$lib/stores/modal.svelte.ts'
  import { paymentStore } from '$lib/stores/payment.svelte.ts'
  import { toastRun } from '$lib/stores/toast.svelte'
  import PrimaryButton from '$lib/ui/PrimaryButton.svelte'
  import { pruneAddress, pruneText } from '$lib/utils/helper'
  import {
    parseAndVerifyPaymentMessage,
    PaymentInfo,
    selectedPaymentRequirements
  } from '$src/lib/utils/payment.svelte'
  import { onMount, tick } from 'svelte'
  import QuillPenAiLine from '../icons/quill-pen-ai-line.svelte'
  import ConnectWalletModal from './ConnectWalletModal.svelte'
  import { type VersionedTransaction } from '@solana/web3.js'
  import type { ResourceInfo } from '@ldclabs/1paying-kit'

  const myIcpAddress = $derived(authStore.identity.getPrincipal().toText())
  const isAuthenticated = $derived(authStore.identity.isAuthenticated)

  let { isReady = $bindable() }: { isReady: boolean } = $props()

  let isLoading = $state<boolean>(false)
  let isSigningIn = $state<boolean>(false)
  let signFinished = $state(false)
  let signFailed = $state('')
  let selectedId = $state('')
  let responseError = $state('')
  let x402Version = $state(1)
  let tx = $state<string>('')
  let accepts = $state<PaymentInfo[]>([])
  let selected = $state<PaymentInfo | null>(null)
  let selectedAddress = $state<string>('')
  let solTransaction = $state<VersionedTransaction | undefined>(undefined)
  let resource = $state<ResourceInfo | null>(null)

  const success = $derived(signFinished && !signFailed)

  function onSignInModal() {
    showModal({
      title: 'Connect wallet',
      component: ConnectWalletModal
    })
  }

  async function handleSelectRequirement(id: string) {
    if (id && selectedId === id) {
      return
    }

    const item = id
      ? accepts.find((info) => info.id === id)
      : accepts.find((info) => !info.isDisabled)
    if (!item) {
      selectedId = ''
      selected = null
      selectedAddress = ''
      solTransaction = undefined
      return
    }

    selectedId = item.id
    selected = item
    if (!isAuthenticated) return

    solTransaction = undefined
    selectedAddress = ''
    switch (selected.network) {
      case 'solana':
        isLoading = true
        selectedAddress = `${pruneAddress(authStore.identity.svmAddress)} on Solana`
        solTransaction = await paymentStore.solBuildX402Transaction(selected)
        isLoading = false
        break
      case 'solana-devnet':
        isLoading = true
        selectedAddress = `${pruneAddress(authStore.identity.svmAddress)} on Solana Devnet`
        solTransaction = await paymentStore.solBuildX402Transaction(selected)
        isLoading = false
        break
      case 'icp':
        selectedAddress = `${pruneAddress(myIcpAddress)} on Internet Computer`
        break
      case 'base':
        selectedAddress = `${pruneAddress(authStore.identity.evmAddress)} on Base`
        break
      case 'base-testnet':
        selectedAddress = `${pruneAddress(authStore.identity.evmAddress)} on Base Sepolia`
        break
    }
  }

  function handlePay() {
    if (!selected || !tx || !isAuthenticated || isLoading) {
      return
    }

    isLoading = true
    const promise = paymentStore.buildX402Request(selected, solTransaction)

    toastRun(async () => {
      const result = await promise
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

  async function fetchMyBalance() {
    if (!authStore.identity.isAuthenticated) {
      return
    }
    for (const info of accepts) {
      info.supportNetworks = authStore.supportNetworks

      switch (info.network) {
        case 'solana':
        case 'solana-devnet':
          await info.fetchBalance(paymentStore, authStore.identity.svmAddress)
          break
        case 'base':
        case 'base-testnet':
          await info.fetchBalance(paymentStore, authStore.identity.evmAddress)
          break
        case 'icp':
          await info.fetchBalance(
            paymentStore,
            authStore.identity.getPrincipal().toText()
          )
          break
      }
    }

    accepts.sort((a, b) => {
      if (a.isDisabled !== b.isDisabled) {
        return a.isDisabled ? 1 : -1
      }
      return 0
    })
    if (!selected && accepts.length > 0) {
      await tick()
      await handleSelectRequirement('')
    }
  }

  onMount(() => {
    const rt = toastRun(async (_signal, abortingQue) => {
      const url = new URL(page.url)
      const { txid, paymentRequired } = await parseAndVerifyPaymentMessage(
        url.hash.slice(1)
      )
      tx = txid

      x402Version = paymentRequired.x402Version
      accepts = selectedPaymentRequirements(
        paymentRequired,
        authStore.supportNetworks
      )
      resource = accepts[0]?.resource() || null
      responseError = paymentRequired.error || ''
      await tick()
      await handleSelectRequirement('')
      await fetchMyBalance()

      authStore.addEventListener(EventLogin, fetchMyBalance)
      abortingQue.push(() => {
        authStore.removeEventListener(EventLogin, fetchMyBalance)
      })
    })
    rt.finally(() => {
      isReady = true
    })
    return rt.abort
  })
</script>

<main class="w-full flex-1 bg-slate-50 p-4 sm:p-8">
  {#key myIcpAddress}
    <div class="relative m-auto flex max-w-5xl flex-col gap-6">
      <section
        class="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur md:gap-6 md:p-6"
      >
        <header class="flex flex-col gap-2">
          <div class="">
            <span
              class="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-600"
              >x402 V{x402Version}</span
            >
            {#if responseError && !success}
              <span class="ml-2 text-sm text-red-600">{responseError}</span>
            {/if}
          </div>

          {#if resource}
            <div class="space-y-2">
              <p
                class="flex items-center gap-2 text-sm text-pretty wrap-break-word text-slate-500"
              >
                <span class="break-all"
                  >{pruneText(resource.url || '--', 100)}</span
                >
                {#if resource.mimeType}
                  <span class="rounded-full bg-sky-100 px-2 py-1 text-xs"
                    >{resource.mimeType}</span
                  >
                {/if}
              </p>
              {#if resource.description}
                <h3 class="font-semibold text-slate-900">
                  {resource.description}
                </h3>
              {/if}
            </div>
          {/if}

          <hr class="my-2 border-slate-200" />

          {#if success}
            <div class="m-auto mt-4 text-green-600 *:size-10"
              ><QuillPenAiLine /></div
            >
            <h1
              class="text-center text-lg font-semibold text-green-600 sm:text-2xl"
            >
              Payment Signed Successfully!
            </h1>
            <p class="text-center text-slate-600"
              >You can close this tab and return to your app.</p
            >
          {:else}
            <h2 class="text-lg font-semibold text-slate-900 sm:text-2xl">
              Please select a payment request to proceed:
            </h2>
          {/if}
        </header>

        {#if accepts.length > 0}
          <div class="m-auto w-fit max-w-full rounded-xl p-0 shadow-inner">
            <div class="flex snap-x snap-mandatory gap-4 overflow-x-auto p-4">
              {#each accepts as info (info.id)}
                <div class="snap-center">
                  <PaymentRequirementCard
                    {info}
                    selected={info.id === selectedId}
                    disabled={isLoading ||
                      signFinished ||
                      !authStore.supportNetworks.includes(info.payment.network)}
                    onSelect={handleSelectRequirement}
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
                >{selected.formatAmount(selected.amountRequired)}</span
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
