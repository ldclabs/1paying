<script lang="ts">
  import ArrowRightUpLine from '$lib/icons/arrow-right-up-line.svelte'
  import RefreshLine from '$lib/icons/refresh-line.svelte'
  import { authStore } from '$lib/stores/auth.svelte'
  import { paymentStore } from '$lib/stores/payment.svelte.ts'
  import { toastRun } from '$lib/stores/toast.svelte'
  import type { PaymentLog } from '$lib/types/pay'
  import { errMessage } from '$lib/types/result.ts'
  import { formatTimeAgo, pruneAddress, pruneText } from '$lib/utils/helper'
  import { PaymentLogInfo } from '$lib/utils/payment.svelte.ts'
  import { onMount } from 'svelte'

  const isAuthenticated = $derived(authStore.identity.isAuthenticated)

  // new PaymentLogInfo({
  //   'id': 'd4avu1v31kbhhjo030c0',
  //   'x402Version': 1,
  //   'network': 'solana-devnet',
  //   'scheme': 'exact',
  //   'payer': 'DAwdzsTLW8tTEe7j6cwjjqwujUmTvcmZXuAAAHGAm4NK',
  //   'payTo': 'FRVJU92DEkT6yQyQtyEKwUeKWPqhHeYJqsTCdxUjq8iP',
  //   'asset': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  //   'resource': 'https://example.1pay.ing/1paying-coffee/Cappuccino',
  //   'description': 'Grande Cappuccino with oat milk',
  //   'amountRequired': '1000000',
  //   'amountPaid': '1000000',
  //   'tx': '3dZkinoKibFTcWPnTzEwP5azWMUwaHzmxeT2bmhLsVKKYLXjMNU34B3m4oy1ewoQtdFstXxGvXSyZMYQfhWo4TgH',
  //   'txStatus': 'finalized',
  //   'signedAt': 1763049214720,
  //   'updatedAt': 1763049229276
  // })

  let history = $state<PaymentLogInfo[]>([])
  let historyCursor = $state<string | undefined>(undefined)
  let historyLoading = $state(false)
  let historyLoadingMore = $state(false)
  let historyError = $state('')

  const hasMoreHistory = $derived(Boolean(historyCursor))

  const statusLabels: Record<PaymentLog['txStatus'], string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    finalized: 'Finalized',
    failed: 'Failed'
  }

  const statusStyles: Record<PaymentLog['txStatus'], string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-600',
    confirmed: 'border-sky-200 bg-sky-50 text-sky-600',
    finalized: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    failed: 'border-rose-200 bg-rose-50 text-rose-600'
  }

  const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  function formatDateTime(timestamp: number): string {
    try {
      return dateTimeFormatter.format(timestamp)
    } catch (error) {
      return new Date(timestamp).toLocaleString()
    }
  }

  async function refreshHistory() {
    if (historyLoading) {
      return
    }

    historyLoading = true
    historyError = ''
    try {
      const [logs, nextCursor] = await paymentStore.listMyHistory()
      history = logs.map((log) => new PaymentLogInfo(log))
      historyCursor = nextCursor
    } catch (error) {
      historyError = errMessage(error)
    } finally {
      historyLoading = false
    }
  }

  async function loadMoreHistory() {
    if (!historyCursor || historyLoadingMore) {
      return
    }

    historyLoadingMore = true
    historyError = ''
    try {
      const [logs, nextCursor] = await paymentStore.listMyHistory(historyCursor)
      history.push(...logs.map((log) => new PaymentLogInfo(log)))
      historyCursor = nextCursor
    } catch (error) {
      historyError = errMessage(error)
    } finally {
      historyLoadingMore = false
    }
  }

  onMount(() => {
    return toastRun(async () => {
      await refreshHistory()
    }).abort
  })
</script>

<section
  class="m-auto w-full max-w-5xl space-y-4 rounded-xl border border-slate-100 bg-white/80 shadow-sm backdrop-blur"
  aria-labelledby="history-heading"
>
  <header
    class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6"
  >
    <div>
      <h2
        id="history-heading"
        class="text-lg font-semibold text-slate-900 sm:text-xl"
      >
        Payment history
      </h2>
      <p class="mt-1 text-sm text-slate-600">
        Each signed x402 request is stored securely so your wallet can rehydrate
        recent checkouts.
      </p>
    </div>
    <button
      type="button"
      class="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      onclick={refreshHistory}
      disabled={historyLoading}
    >
      <span class="*:size-4">
        <RefreshLine />
      </span>
      <span>{historyLoading ? 'Refreshing…' : 'Refresh'}</span>
    </button>
  </header>

  {#if historyError}
    <div class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
      Failed to load history: {historyError}
    </div>
  {/if}

  {#if historyLoading && history.length === 0}
    <div class="flex items-center justify-center p-6 text-sm text-slate-500">
      Loading recent signatures…
    </div>
  {:else if !isAuthenticated || history.length === 0}
    <div class="px-4 py-12 text-center text-sm text-slate-500">
      No signed payments yet. Complete a checkout and it will appear here.
    </div>
  {:else}
    <ul class="divide-y divide-slate-200">
      {#each history as info (info.log.id)}
        <li class="p-4 md:p-6">
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div class="space-y-2">
              <p
                class="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase"
              >
                x402 v{info.log.x402Version}
              </p>
              <h3 class="text-base font-semibold text-slate-900">
                {info.log.description || 'Signed payment'}
              </h3>
              <p
                class="text-xs break-all text-slate-500"
                title={info.log.resource}
              >
                <span class="flex-1 break-all"
                  >{pruneText(info.log.resource || '--', 100)}</span
                >
              </p>
            </div>
            <div class="flex flex-col items-start gap-2 sm:items-end">
              <span
                class={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.3em] uppercase ${statusStyles[info.log.txStatus]}`}
              >
                {statusLabels[info.log.txStatus]}
              </span>
              <div class="text-sm text-slate-600 sm:text-right">
                <p
                  class="font-semibold text-slate-900"
                  title={`Paid (atomic units): ${info.log.amountPaid}`}
                >
                  {info.formatAmount(info.amountPaid)}
                  <span class="ml-1 text-xs font-normal text-slate-500"
                    >paid</span
                  >
                </p>
                <p
                  class="text-xs text-slate-500"
                  title={`Required (atomic units): ${info.log.amountRequired}`}
                >
                  Required {info.formatAmount(info.maxAmountRequired)}
                </p>
              </div>
            </div>
          </div>
          <dl
            class="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-3"
          >
            <div>
              <dt class="font-semibold tracking-wide text-slate-500 uppercase">
                Network
              </dt>
              <dd class="font-mono text-slate-900">
                {info.log.network}
              </dd>
            </div>
            <div>
              <dt class="font-semibold tracking-wide text-slate-500 uppercase">
                Scheme
              </dt>
              <dd class="text-slate-900">{info.log.scheme}</dd>
            </div>
            <div>
              <dt class="font-semibold tracking-wide text-slate-500 uppercase">
                Asset
              </dt>
              <dd class="font-mono text-slate-900" title={info.log.asset}>
                {info.token
                  ? `${info.token.name} (${info.token.symbol})`
                  : '--'}
              </dd>
            </div>
            <div>
              <dt class="font-semibold tracking-wide text-slate-500 uppercase">
                Payer
              </dt>
              <dd
                class="flex items-center font-mono text-slate-900"
                title={info.log.payer}
              >
                <span>{pruneAddress(info.log.payer)}</span>
                {#if info.payerUrl}
                  <a
                    href={info.payerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="transition *:size-4 hover:text-sky-400"
                    title="View Transaction"
                  >
                    <ArrowRightUpLine />
                  </a>
                {/if}
              </dd>
            </div>
            <div>
              <dt class="font-semibold tracking-wide text-slate-500 uppercase">
                Pay to
              </dt>
              <dd
                class="flex items-center font-mono text-slate-900"
                title={info.log.payTo}
              >
                <span>{pruneAddress(info.log.payTo)}</span>
                {#if info.payToUrl}
                  <a
                    href={info.payToUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="transition *:size-4 hover:text-sky-400"
                    title="View Transaction"
                  >
                    <ArrowRightUpLine />
                  </a>
                {/if}
              </dd>
            </div>

            {#if info.log.tx}
              {@const txUrl = info.txUrl}
              <div>
                <dt
                  class="font-semibold tracking-wide text-slate-500 uppercase"
                >
                  Tx
                </dt>
                <dd
                  class="flex items-center font-mono text-slate-900"
                  title={info.log.tx}
                >
                  <span>{pruneAddress(info.log.tx)}</span>
                  {#if txUrl}
                    <a
                      href={txUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="transition *:size-4 hover:text-sky-400"
                      title="View Transaction"
                    >
                      <ArrowRightUpLine />
                    </a>
                  {/if}
                </dd>
              </div>
            {/if}
          </dl>
          <div class="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>
              Signed {formatTimeAgo(info.log.signedAt)} &bull;
              {formatDateTime(info.log.signedAt)}
            </span>
            <span>
              Updated {formatTimeAgo(info.log.updatedAt)} &bull;
              {formatDateTime(info.log.updatedAt)}
            </span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  {#if hasMoreHistory}
    <div class="flex justify-center pb-4">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        onclick={loadMoreHistory}
        disabled={historyLoadingMore}
      >
        {#if historyLoadingMore}
          <span>Loading…</span>
        {:else}
          <span>Load more</span>
        {/if}
      </button>
    </div>
  {/if}
</section>
