<script lang="ts">
  import { t } from "../i18n/en";
  import Icon from "./Icon.svelte";

  let { onbegin }: { onbegin: (seed: number) => void } = $props();
  let seedText = $state(String(Math.floor(100000 + Math.random() * 900000)));
  const seed = $derived(Number.parseInt(seedText, 10) || 1);
</script>

<form class="card" onsubmit={(e) => { e.preventDefault(); onbegin(seed); }}>
  <h1>{t("appName")}</h1>
  <h2>{t("newRun")}</h2>
  <fieldset class="field">
    <legend>{t("god")}</legend>
    <button class="btn is-selected" type="button" aria-pressed="true"><Icon name="drop" />{t("water")}<Icon name="check" cls="icon check" /><span class="hint">{t("available")}</span></button>
    <button class="btn" type="button" aria-disabled="true"><Icon name="wind" />{t("wind")}<Icon name="lock" /><span class="hint">{t("locked")}</span></button>
    <button class="btn" type="button" aria-disabled="true"><Icon name="stone" />{t("stone")}<Icon name="lock" /><span class="hint">{t("locked")}</span></button>
  </fieldset>
  <div class="field">
    <label for="seed">{t("seed")}</label>
    <input id="seed" type="text" inputmode="numeric" bind:value={seedText} />
  </div>
  <button class="btn primary" type="submit">{t("begin")}</button>
</form>
