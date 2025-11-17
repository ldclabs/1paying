<script lang="ts">
  import ConnectWalletModal from '$lib/components/ConnectWalletModal.svelte'
  import Header from '$lib/components/Header.svelte'
  import PaymentSign from '$lib/components/PaymentSign.svelte'
  import WalletModal from '$lib/components/WalletModal.svelte'
  import LogoutCircleRLine from '$lib/icons/logout-circle-r-line.svelte'
  import Wallet3Line from '$lib/icons/wallet-3-line.svelte'
  import { authStore } from '$lib/stores/auth.svelte'
  import { showModal } from '$lib/stores/modal.svelte.ts'
  import Loading from '$lib/ui/Loading.svelte'
  import PrimaryButton from '$lib/ui/PrimaryButton.svelte'

  const isAuthenticated = $derived(authStore.identity.isAuthenticated)

  let isSigningIn = $state<boolean>(false)
  let isSigningReady = $state<boolean>(false)

  function onSignInModal() {
    showModal({
      title: 'Sign In With',
      component: ConnectWalletModal
    })
  }

  function onWalletModal() {
    showModal({
      title: 'Wallet',
      component: WalletModal,
      closeOnBackdrop: false
    })
  }
</script>

<div class="flex min-h-screen flex-col bg-white text-slate-900">
  <Header>
    <div class="flex items-center sm:gap-4">
      {#if isAuthenticated}
        <button
          type="button"
          class:invisible={!isAuthenticated}
          class="flex items-center gap-2 px-3 py-1 text-slate-500 hover:text-slate-900"
          onclick={onWalletModal}
        >
          <span><Wallet3Line /></span>
        </button>
        <button
          type="button"
          class:invisible={!isAuthenticated}
          class="flex items-center gap-2 px-3 py-1 text-slate-500 hover:text-slate-900"
          onclick={() => authStore.logout()}
        >
          <span><LogoutCircleRLine /></span>Logout
        </button>
      {:else}
        <PrimaryButton
          onclick={onSignInModal}
          isLoading={isSigningIn}
          class="py-2!"
        >
          <span>Connect wallet</span>
        </PrimaryButton>
      {/if}
    </div>
  </Header>

  {#if !isSigningReady}
    <Loading message="Preparing secure signing session · 1Pay.ing" />
  {/if}
  <PaymentSign bind:isReady={isSigningReady} />

  <footer class="border-t border-slate-100 bg-slate-50 py-8">
    <div class="mx-auto max-w-6xl px-6">
      <div
        class="flex flex-col gap-2 border-t border-slate-100 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
      >
        <p
          >© {new Date().getFullYear()}
          <span class="font-outfit font-bold text-black">1Pay.ing</span>. All
          rights reserved.</p
        >
        <a class="hover:text-slate-900" href="mailto:team@1pay.ing"
          >hi@1pay.ing</a
        >
      </div>
    </div>
  </footer>
</div>
