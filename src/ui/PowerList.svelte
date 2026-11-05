<script lang="ts">
  import { t, type MessageKey } from "../i18n/en";
  import type { Power } from "../sim/powers";
  import Icon from "./Icon.svelte";

  let { powers, active, onpick }: { powers: Power[]; active: Power | null; onpick: (power: Power) => void } = $props();

  const ICONS: Record<Power, string> = { rain: "drop", sun: "sun", raise: "up", lower: "down", gust: "wind", chill: "thermo", fog: "wave", storm: "bolt", monsoon: "leaf", warmwind: "flame" };
</script>

<ul class="powers" aria-label={t("powers")}>
  {#each powers as power (power)}
    <li>
      <button class="btn" type="button" aria-pressed={active === power} onclick={() => onpick(power)}>
        <Icon name={ICONS[power]} />
        <span>{t(power)}</span>
        {#if active === power}<Icon name="check" cls="icon check" />{/if}
        <span class="hint">{t(`${power}Hint` as MessageKey)}</span>
      </button>
    </li>
  {/each}
</ul>
