<script lang="ts">
  import { t } from "../i18n/en";
  import type { Power } from "../sim/powers";
  import Icon from "./Icon.svelte";

  let { active, onpick }: { active: Power | null; onpick: (power: Power) => void } = $props();

  const POWERS: { id: Power; icon: string; label: "rain" | "sun" | "raise" | "lower"; hint: "rainHint" | "sunHint" | "raiseHint" | "lowerHint" }[] = [
    { id: "rain", icon: "drop", label: "rain", hint: "rainHint" },
    { id: "sun", icon: "sun", label: "sun", hint: "sunHint" },
    { id: "raise", icon: "up", label: "raise", hint: "raiseHint" },
    { id: "lower", icon: "down", label: "lower", hint: "lowerHint" },
  ];
</script>

<ul class="powers" aria-label={t("powers")}>
  {#each POWERS as power (power.id)}
    <li>
      <button class="btn" type="button" aria-pressed={active === power.id} onclick={() => onpick(power.id)}>
        <Icon name={power.icon} />
        <span>{t(power.label)}</span>
        {#if active === power.id}<Icon name="check" cls="icon check" />{/if}
        <span class="hint">{t(power.hint)}</span>
      </button>
    </li>
  {/each}
</ul>
