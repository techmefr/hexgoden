<script lang="ts">
  import { SYMBOLS } from "./icons";

  let { name, cls = "icon" }: { name: string; cls?: string } = $props();
</script>

<svg class={cls} viewBox="0 0 24 24" aria-hidden="true" focusable="false">{@html SYMBOLS[name] ?? ""}</svg>
