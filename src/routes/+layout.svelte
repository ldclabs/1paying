<script lang="ts">
  import Modal from '$lib/ui/Modal.svelte'
  import Toast from '$lib/ui/Toast.svelte'
  import '../app.css'

  let { children } = $props()

  const search = new URLSearchParams(window.location.search)
  const ref = search.get('ref')
  if (ref && !localStorage.getItem('ref')) {
    localStorage.setItem('ref', ref)
  }

  const loader = document.getElementById('app-loading-root')
  if (loader && loader.parentElement) {
    loader.parentElement.removeChild(loader)
  }
</script>

{@render children()}

<Modal />
<Toast />
