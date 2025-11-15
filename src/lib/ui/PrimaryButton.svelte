<script lang="ts">
  import Spinner from '$lib/ui/Spinner.svelte'

  let {
    children,
    onclick = undefined,
    disabled = false,
    isLoading = false,
    class: selfClass = '',
    ...props
  } = $props()
</script>

<button
  {...props}
  disabled={disabled || isLoading}
  {onclick}
  class="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-400 {selfClass}"
>
  {#if isLoading}
    <Spinner class="mr-3 -ml-1 size-5 text-white" />
  {/if}
  {@render children()}
</button>
