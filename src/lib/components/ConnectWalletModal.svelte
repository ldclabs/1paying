<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte'
  import { toastRun } from '$lib/stores/toast.svelte'
  import Button from '$lib/ui/Button.svelte'
  import { BrowserSDK } from '@phantom/browser-sdk'
  import { onMount } from 'svelte'

  let {
    closeModal = () => {}
  }: {
    closeModal?: () => void
  } = $props()

  let isSigningIn = $state<boolean>(false)
  let isPhantomAvailable = $state<boolean>(false)
  let signWith = $state<'phantom' | 'ii' | ''>('')
  function onSignWith(type: 'phantom' | 'ii') {
    isSigningIn = true
    signWith = type
    toastRun(async () => {
      switch (type) {
        case 'phantom':
          await authStore.signInWithPhantom()
          break
        case 'ii':
          await authStore.signIn()
          break
      }
      closeModal()
    }).finally(() => {
      isSigningIn = false
    })
  }

  onMount(async () => {
    isPhantomAvailable = await BrowserSDK.isPhantomInstalled(3000)
  })
</script>

<div
  class="m-auto mb-6 flex w-full max-w-sm flex-col items-center justify-center gap-6"
>
  <Button
    onclick={() => onSignWith('ii')}
    disabled={isSigningIn}
    isLoading={isSigningIn && signWith === 'ii'}
    class="w-full justify-between rounded-xl bg-slate-100 px-4 py-2 text-lg hover:bg-slate-200 hover:shadow-md disabled:hover:bg-slate-100 disabled:hover:shadow-none"
  >
    <img
      src="/_assets/images/icp.webp"
      alt="Internet Computer Logo"
      class="h-6 w-auto"
    />
    <span>Internet Identity</span>
  </Button>
  <Button
    onclick={() => onSignWith('phantom')}
    disabled={!isPhantomAvailable || isSigningIn}
    isLoading={isSigningIn && signWith === 'phantom'}
    class="w-full justify-between rounded-xl bg-slate-100 px-4 py-2 text-lg hover:bg-slate-200 hover:shadow-md disabled:hover:bg-slate-100 disabled:hover:shadow-none"
  >
    <img
      src="/_assets/images/phantom.webp"
      alt="Phantom Logo"
      class="h-6 w-auto"
    />
    <span
      >Phantom wallet{#if !isPhantomAvailable}
        <small class="ml-2 text-slate-400">(Not installed)</small>
      {/if}</span
    >
  </Button>
</div>
