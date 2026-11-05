<script lang="ts">
  import { t, type MessageKey } from "../i18n/en";
  import { OFFERS, offerStatus } from "../meta/market";
  import type { Progress } from "../meta/store";
  import type { Power } from "../sim/powers";
  import Icon from "./Icon.svelte";

  let { progress, onbuy, onrent }: { progress: Progress; onbuy: (power: Power) => void; onrent: (power: Power) => void } = $props();

  const ICONS: Record<Power, string> = { rain: "drop", sun: "sun", raise: "up", lower: "down", gust: "wind", chill: "thermo", fog: "wave", storm: "bolt", monsoon: "leaf", warmwind: "flame" };
  const now = Date.now();
</script>

<section class="card" aria-label={t("market")}>
  <h2>{t("market")}</h2>
  <p class="note">{t("rentNote")}</p>
  <ul class="market">
    {#each OFFERS as offer (offer.power)}
      {@const status = offerStatus(progress, offer, now)}
      <li>
        <span><Icon name={ICONS[offer.power]} /> {t(offer.power)} · {t(offer.god)}</span>
        {#if status === "owned"}
          <span class="hint">{t("owned")}</span>
        {:else if status === "locked"}
          <span class="hint"><Icon name="lock" /> {t("rank")} {t(offer.tier as MessageKey)}</span>
        {:else}
          {#if status === "rented"}<span class="hint">{t("rented")}</span>{/if}
          <button class="btn" type="button" disabled={progress.points < offer.buy} onclick={() => onbuy(offer.power)}>{t("buy")} {offer.buy}</button>
          {#if status === "available"}
            <button class="btn" type="button" disabled={progress.points < offer.rent} onclick={() => onrent(offer.power)}>{t("rent")} {offer.rent}</button>
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
</section>
