<script lang="ts">
  import { t, type MessageKey } from "../i18n/en";
  import { board, standing } from "../meta/ranking";
  import Icon from "./Icon.svelte";

  let { earned }: { earned: number } = $props();

  const now = $derived(standing(earned));
  const rows = $derived(board(earned));
  const visible = $derived.by(() => {
    const mine = rows.findIndex((row) => row.name === null);
    const start = Math.max(0, Math.min(mine - 2, rows.length - 5));
    return rows.slice(start, start + 5);
  });
</script>

<section class="card" aria-label={t("ranking")}>
  <h2><Icon name="mountain" /> {t("ranking")}</h2>
  <dl class="dl">
    <dt>{t("tier")}</dt><dd>{t(now.tier.id as MessageKey)}</dd>
    <dt>{t("place")}</dt><dd>{now.position} {t("of")} {now.total}</dd>
    <dt>{t("next")}</dt><dd>{now.next ? `${t(now.next.id as MessageKey)}, ${now.missing} ${t("more")}` : t("topTier")}</dd>
  </dl>
  <ol class="rank-list">
    {#each visible as row (row.position)}
      <li class:me={row.name === null}><span>{row.position}</span><span>{row.name ?? t("you")}</span><span class="score">{Math.floor(row.score)}</span></li>
    {/each}
  </ol>
</section>
