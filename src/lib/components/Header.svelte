<script lang="ts">
  import { fadeIn } from '$lib/animations/motion'

  let { children = undefined } = $props()
</script>

<header
  use:fadeIn={{ y: -20, duration: 600 }}
  class="sticky top-0 z-50 border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur"
>
  <div
    class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-1 sm:px-6"
  >
    <a href="/" class="flex flex-col items-start">
      <img src="/_assets/1pay_dark.webp" alt="1Pay.ing" class="h-10 w-auto" />
      <span class="font-outfit text-sm text-slate-500"
        >The Web3 Payment Wallet</span
      >
    </a>
    {@render children?.()}
  </div>
</header>
