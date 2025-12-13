<script lang="ts">
  import ArrowRightUpLine from '$lib/icons/arrow-right-up-line.svelte'
  import CheckLine from '$lib/icons/check-line.svelte'
  import { authStore } from '$lib/stores/auth.svelte'
  import TextClipboardButton from '$lib/ui/TextClipboardButton.svelte'
  import { pruneAddress } from '$lib/utils/helper'
  import { PaymentInfo } from '$lib/utils/payment.svelte'

  let {
    info,
    selected = false,
    disabled = false,
    onSelect = undefined
  }: {
    info: PaymentInfo
    selected?: boolean
    disabled?: boolean
    onSelect?: (id: string) => void
  } = $props()

  const isAuthenticated = $derived(authStore.identity.isAuthenticated)
  const isDisabled = $derived<boolean>(disabled || info.isDisabled)

  function handleSelect() {
    if (isDisabled) {
      return
    }
    onSelect?.(info.id)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (isDisabled) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.(info.id)
    }
  }
</script>

<div
  role="radio"
  id={info.id}
  aria-checked={selected}
  tabindex={isDisabled ? -1 : 0}
  class={`group flex h-full w-2xs max-w-sm flex-col rounded-xl border bg-white/80 p-4 text-left shadow-sm backdrop-blur transition sm:w-lg ${
    selected
      ? 'border-sky-400/50 ring-2 ring-sky-200'
      : 'border-slate-200 hover:border-sky-300 hover:shadow-lg'
  } ${isDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
  onclick={handleSelect}
  onkeydown={handleKeydown}
>
  <div class="flex h-6 items-center justify-between gap-3">
    <span
      class="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase"
    >
      {info.payment.scheme === 'exact' ? 'Exact Amount' : 'Up To Amount'}
    </span>
    {#if selected}
      <p
        class="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold tracking-wide text-sky-600 uppercase"
      >
        <span class="size-3 [&>svg]:size-full">
          <CheckLine />
        </span>
        <span>Selected</span>
      </p>
    {/if}
  </div>

  <dl class="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
    <div>
      <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Asset
      </dt>
      <dd class="mt-1 font-semibold text-slate-900">
        {info.token ? `${info.token.name} (${info.token.symbol})` : '--'}
      </dd>
    </div>
    <div>
      <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Max Amount
      </dt>
      <dd class="mt-1 font-semibold text-slate-900">
        {info.formatAmount(info.amountRequired)}
      </dd>
    </div>
    <div class="col-span-2">
      <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Asset address
      </dt>
      <dd
        class="mt-1 flex items-center gap-2 font-mono text-xs text-slate-900"
        title={info.payment.asset}
      >
        <span>{pruneAddress(info.payment.asset, true)}</span>
        <TextClipboardButton
          value={info.payment.asset}
          class="text-slate-400 transition *:size-4 hover:text-slate-600"
        />
        {#if info.assetUrl}
          <a
            href={info.assetUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-slate-400 transition *:size-5 hover:text-sky-400"
            title="View Asset Address"
          >
            <ArrowRightUpLine />
          </a>
        {/if}
      </dd>
    </div>
    <div class="col-span-2">
      <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Pay To
      </dt>
      <dd
        class="mt-1 flex items-center gap-2 font-mono text-xs text-slate-900"
        title={info.payment.payTo}
      >
        <span>{pruneAddress(info.payment.payTo, true)}</span>
        <TextClipboardButton
          value={info.payment.payTo}
          class="text-slate-400 transition *:size-4 hover:text-slate-600"
        />
        {#if info.payToUrl}
          <a
            href={info.payToUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-slate-400 transition *:size-5 hover:text-sky-400"
            title="View Pay To Address"
          >
            <ArrowRightUpLine />
          </a>
        {/if}
      </dd>
    </div>

    <div class="">
      <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Network
      </dt>
      <dd
        class="mt-1 font-mono text-xs text-slate-900"
        title={info.payment.network}
      >
        {info.network}
      </dd>
    </div>
    {#if isAuthenticated}
      <div>
        <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">
          Balance
        </dt>
        <dd
          class="mt-1 font-semibold {info.balance > info.amountRequired
            ? 'text-green-500'
            : 'text-slate-900'}"
        >
          {info.formatAmount(info.balance)}
        </dd>
      </div>
    {/if}
  </dl>
</div>
