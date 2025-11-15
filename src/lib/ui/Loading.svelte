<script lang="ts">
  let {
    message
  } = $props<{ message: string }>()
</script>

<div class="flex flex-1 items-center justify-center bg-slate-50 p-8 w-full">
  <div class="flex flex-col items-center gap-3 text-center text-slate-500 m-auto">
    <div class="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
    <p class="text-sm font-medium text-slate-600">
      {message}
    </p>
    <p class="text-xs text-slate-400">
      This usually takes only a moment. Please keep this tab open.
    </p>
  </div>
</div>
