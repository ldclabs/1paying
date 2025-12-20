<script lang="ts">
  import { fadeIn } from '$lib/animations/motion'
  import { onMount } from 'svelte'

  let { children = undefined } = $props()
  let scrolled = $state(false)

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 10
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  })
</script>

<header
  use:fadeIn={{ y: -20, duration: 600 }}
  class="sticky top-0 z-50 w-full py-2 transition-all duration-300 {scrolled
    ? 'border-b border-slate-100 bg-white/80 shadow-sm backdrop-blur-xl'
    : 'bg-transparent'}"
>
  <div
    class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6"
  >
    <a
      href="/"
      class="group flex items-center gap-4 transition-all hover:opacity-90"
    >
      <div
        class="relative flex size-12 items-center justify-center overflow-hidden rounded-xl bg-slate-900 shadow-lg ring-1 ring-white/10 transition-transform group-hover:scale-105 group-active:scale-95"
      >
        <img
          src="/_assets/logo.webp"
          alt="1Pay.ing"
          class="size-12 object-cover"
        />
        <div
          class="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        ></div>
      </div>
      <div class="flex flex-col gap-1.5 leading-none">
        <span
          class="font-outfit text-2xl font-bold tracking-tight text-slate-900"
          >1Pay.ing</span
        >
        <span
          class="text-[10px] font-bold tracking-[0.25em] text-sky-600 uppercase"
          >Universal Wallet</span
        >
      </div>
    </a>

    <div class="flex items-center">
      {@render children?.()}
    </div>
  </div>
</header>
