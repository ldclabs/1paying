<script lang="ts">
  import {
    authStore,
    hasPhantomSDK,
    type SignInWithParams
  } from '$lib/stores/auth.svelte'
  import { toastRun } from '$lib/stores/toast.svelte'
  import Button from '$lib/ui/Button.svelte'
  import { onMount } from 'svelte'

  let {
    closeModal = () => {}
  }: {
    closeModal?: () => void
  } = $props()

  let isAuthReady = $state<boolean>(false)
  let isPhantomReady = $state<boolean>(false)
  let isSigningIn = $state<boolean>(false)
  let signWith = $state<'phantom' | 'ii' | ''>('')
  let signInParams = $state<SignInWithParams | null>(null)
  function onSignWith(ty: 'phantom' | 'ii') {
    isSigningIn = true
    signWith = ty
    // 尽量确保 window.open 在同步调用栈内被触发，以避免被浏览器拦截
    const result =
      ty === 'phantom'
        ? authStore.signInWithPhantom(signInParams)
        : authStore.signIn()

    toastRun(async () => {
      const rt = await result
      if (rt) {
        signInParams = rt
        // wait for signing completed
      } else {
        closeModal()
      }
    }).finally(() => {
      isSigningIn = false
    })
  }

  onMount(() => {
    return toastRun(async () => {
      await authStore.ready()
      isAuthReady = true

      if (authStore.phantomConnected && !hasPhantomSDK) {
        // connect Phantom app by deeplink
        const params = await authStore.getSignInWithSolanaMessage()
        signInParams = params
      }
      isPhantomReady = true
    }).abort
  })
</script>

<div
  class="m-auto mb-6 flex w-full max-w-sm flex-col items-center justify-center gap-6"
>
  <Button
    onclick={() => onSignWith('phantom')}
    disabled={isSigningIn || !isAuthReady || !isPhantomReady}
    isLoading={!isPhantomReady || (isSigningIn && signWith === 'phantom')}
    class="w-full justify-between rounded-xl bg-slate-100 px-4 py-2 text-lg hover:bg-slate-200 hover:shadow-md disabled:hover:bg-slate-100 disabled:hover:shadow-none"
  >
    <img
      src="/_assets/images/phantom.webp"
      alt="Phantom Logo"
      class="h-8 w-auto"
    />
    <div class="flex flex-row items-center gap-2">
      {#if authStore.phantomConnected}
        <span>Sign with Phantom</span>
        <span class="relative flex size-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
          ></span>
          <span class="relative inline-flex size-2 rounded-full bg-green-500"
          ></span>
        </span>
      {:else}
        <span>Connect Phantom</span>
      {/if}
    </div>
  </Button>
  <Button
    onclick={() => onSignWith('ii')}
    disabled={isSigningIn || !isAuthReady}
    isLoading={!isAuthReady || (isSigningIn && signWith === 'ii')}
    class="w-full justify-between rounded-xl bg-slate-100 px-4 py-2 text-lg hover:bg-slate-200 hover:shadow-md disabled:hover:bg-slate-100 disabled:hover:shadow-none"
  >
    <img
      src="/_assets/images/icp.webp"
      alt="Internet Computer Logo"
      class="h-8 w-auto"
    />
    <span>Internet Identity</span>
  </Button>
</div>
