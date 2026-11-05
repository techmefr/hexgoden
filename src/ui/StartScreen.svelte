<script lang="ts">
  import { t } from "../i18n/en";
  import { canUnlock, missingPoints, type Progress } from "../meta/store";
  import { GODS, type GodId } from "../sim/gods";
  import type { Power } from "../sim/powers";
  import MarketPanel from "./MarketPanel.svelte";
  import Icon from "./Icon.svelte";
  import RankingPanel from "./RankingPanel.svelte";

  let { progress, onbegin, onunlock, onbuy, onrent }: { progress: Progress; onbegin: (seed: number, god: GodId) => void; onunlock: (god: GodId) => void; onbuy: (power: Power) => void; onrent: (power: Power) => void } = $props();
  let seedText = $state(String(Math.floor(100000 + Math.random() * 900000)));
  let chosen = $state<GodId>("water");
  const seed = $derived(Number.parseInt(seedText, 10) || 1);
  const ICONS: Record<GodId, string> = { water: "drop", wind: "wind", stone: "stone" };
</script>

<form class="card" onsubmit={(e) => { e.preventDefault(); onbegin(seed, chosen); }}>
  <h1>{t("appName")}</h1>
  <p class="note">{t("harmony")}: {Math.floor(progress.points)}</p>
  <h2>{t("newRun")}</h2>
  <fieldset class="field">
    <legend>{t("god")}</legend>
    {#each GODS as god (god.id)}
      {#if progress.unlocked.includes(god.id)}
        <button class="btn" type="button" aria-pressed={chosen === god.id} onclick={() => (chosen = god.id)}>
          <Icon name={ICONS[god.id]} />{t(god.id)}{#if chosen === god.id}<Icon name="check" cls="icon check" />{/if}<span class="hint">{t("available")}</span>
        </button>
      {:else if canUnlock(progress, god.id)}
        <button class="btn" type="button" onclick={() => onunlock(god.id)}>
          <Icon name={ICONS[god.id]} />{t(god.id)}<span class="hint">{t("unlock")} {god.price}</span>
        </button>
      {:else}
        <button class="btn" type="button" aria-disabled="true">
          <Icon name={ICONS[god.id]} />{t(god.id)}<Icon name="lock" /><span class="hint">{god.playable ? `${t("need")} ${missingPoints(progress, god.id)} ${t("more")}` : t("locked")}</span>
        </button>
      {/if}
    {/each}
  </fieldset>
  <div class="field">
    <label for="seed">{t("seed")}</label>
    <input id="seed" type="text" inputmode="numeric" bind:value={seedText} />
  </div>
  <button class="btn primary" type="submit">{t("begin")}</button>
</form>

<MarketPanel {progress} {onbuy} {onrent} />

<RankingPanel earned={progress.earned} />
