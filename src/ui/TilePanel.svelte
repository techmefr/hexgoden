<script lang="ts">
  import { t, type MessageKey } from "../i18n/en";
  import { BIOMES } from "../sim/terrain";
  import type { Snapshot } from "../worker/protocol";
  import Icon from "./Icon.svelte";

  let { snapshot, tile }: { snapshot: Snapshot; tile: number } = $props();

  const level = (value: number): string => (value < 0.34 ? t("low") : value < 0.67 ? t("medium") : t("high"));
  const biome = $derived(BIOMES[snapshot.biome[tile]]);
  const life = $derived(snapshot.species.find((s) => s.id === snapshot.dominant[tile])?.name ?? t("none"));
</script>

<div class="sheet-head"><h2>{t("tile")}</h2><span class="chip up"><Icon name="leaf" />{t(biome as MessageKey)}</span></div>
<dl class="dl">
  <dt><Icon name="grid" />{t("biome")}</dt><dd>{t(biome as MessageKey)}</dd>
  <dt><Icon name="mountain" />{t("altitude")}</dt><dd>{Math.round(snapshot.altitude[tile] * 1000)} m</dd>
  <dt><Icon name="drop" />{t("humidity")}</dt><dd>{Math.round(snapshot.humidity[tile] * 100)}%</dd>
  <dt><Icon name="thermo" />{t("temperature")}</dt><dd>{Math.round(snapshot.temperature[tile] * 70 - 30)} °C</dd>
  <dt><Icon name="bolt" />{t("tension")}</dt><dd>{level(snapshot.tension[tile])} ({snapshot.tension[tile].toFixed(2)})</dd>
  <dt><Icon name="fly" />{t("life")}</dt><dd>{life}</dd>
  <dt><Icon name="home" />{t("people")}</dt><dd>{snapshot.settlement[tile] > 0.02 ? Math.round(snapshot.settlement[tile] * 100) + "%" : t("none")}</dd>
</dl>
<p class="note">{t("scales")}</p>
