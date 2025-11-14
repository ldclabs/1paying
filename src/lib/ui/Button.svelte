<script lang="ts">
  import Spinner from '$lib/ui/Spinner.svelte'

  let {
    children,
    onclick = undefined,
    disabled = false,
    isLoading = false,
    class: selfClass = '',
    spinnerClass = '',
    ...props
  } = $props()
</script>

<button
  {...props}
  disabled={disabled || isLoading}
  {onclick}
  class="flex-cow inline-flex items-center gap-4 disabled:cursor-not-allowed {selfClass}"
>
  {@render children()}
  <Spinner class="size-5 {spinnerClass} {isLoading ? '' : 'invisible'}" />
</button>
