<script lang="ts">
  import { t } from "../i18n/en";
  import type { Snapshot } from "../worker/protocol";

  let { snapshot, history }: { snapshot: Snapshot; history: Map<number, number[]> } = $props();

  const sorted = $derived([...snapshot.species].sort((a, b) => b.total - a.total));
  const nameOf = (id: number): string => snapshot.species.find((s) => s.id === id)?.name ?? "";
  const climate = (heat: number, moist: number): string => `${heat < 0.4 ? "Cool" : heat > 0.65 ? "Warm" : "Mild"}, ${moist < 0.4 ? "dry" : moist > 0.65 ? "wet" : "damp"}`;
  const line = (id: number): string => {
    const values = history.get(id) ?? [];
    if (values.length < 2) return "";
    const max = Math.max(...values, 0.01);
    return values.map((v, i) => `${i ? "L" : "M"}${(i / (values.length - 1)) * 92 + 2} ${26 - (v / max) * 24}`).join(" ");
  };
</script>

<div class="sheet-head"><h2>{t("species")}</h2></div>
{#if sorted.length === 0}
  <p class="note">{t("noSpecies")}</p>
{:else}
  <ul class="species">
    {#each sorted as s, i (s.id)}
      <li>
        <details open={i === 0}>
          <summary>
            <span>{s.name}{#if s.parent >= 0 && nameOf(s.parent)}<span class="lineage">{t("from")} {nameOf(s.parent)}</span>{/if}</span>
            <span class="chip" class:up={s.trend === "rising"}>{t(s.trend)}</span>
            <svg class="spark" viewBox="0 0 96 28" aria-hidden="true" focusable="false"><path d={line(s.id)} /></svg>
          </summary>
          <dl class="dl">
            <dt>{t("diet")}</dt><dd>{t(s.diet)}</dd>
            <dt>{t("size")}</dt><dd>{s.size.toFixed(0)} mm</dd>
            <dt>{t("mobility")}</dt><dd>{s.mobility < 0.3 ? "Slow" : s.mobility > 0.6 ? "Flies" : "Walks"}</dd>
            <dt>{t("climate")}</dt><dd>{climate(s.heat, s.moist)}</dd>
            <dt>{t("population")}</dt><dd>{s.total.toFixed(0)}</dd>
          </dl>
        </details>
      </li>
    {/each}
  </ul>
{/if}
<p class="note">{t("observeOnly")}</p>
