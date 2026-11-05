<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { t } from "./i18n/en";
  import { buyPower, rentPower, runPowers } from "./meta/market";
import { addPoints, loadProgress, saveProgress, unlockGod, type Progress } from "./meta/store";
  import { PlanetView } from "./render/planet-view";
  import { type GodId } from "./sim/gods";
  import { buildGrid } from "./sim/grid";
  import type { Power } from "./sim/powers";
  import { GRID_FREQUENCY } from "./sim/world";
  import PowerList from "./ui/PowerList.svelte";
  import SpeciesPanel from "./ui/SpeciesPanel.svelte";
  import StartScreen from "./ui/StartScreen.svelte";
  import TilePanel from "./ui/TilePanel.svelte";
  import type { FromWorker, Snapshot, ToWorker } from "./worker/protocol";

  let playing = $state(false);
  let canvas = $state<HTMLCanvasElement | null>(null);
  let snapshot = $state.raw<Snapshot | null>(null);
  let progress = $state<Progress>(loadProgress(storage()));
  let god = $state<GodId>("water");
  let active = $state<Power | null>("rain");
  let banked = 0;
  let tile = $state(-1);
  let view = $state<"tile" | "species">("species");
  let history = $state.raw(new Map<number, number[]>());

  function storage(): Storage | null {
    try { return localStorage; } catch { return null; }
  }

  let worker: Worker | null = null;
  let planet: PlanetView | null = null;
  const grid = buildGrid(GRID_FREQUENCY);

  let powers = $state<Power[]>([]);

  const commit = (next: Progress): void => { progress = next; saveProgress(storage(), next); };

  const send = (message: ToWorker): void => worker?.postMessage(message);

  const onSnapshot = (next: Snapshot): void => {
    snapshot = next;
    if (next.points > banked) { commit(addPoints(progress, next.points - banked)); banked = next.points; }
    if (next.tick % 4 === 0) {
      const map = new Map(history);
      for (const s of next.species) map.set(s.id, [...(map.get(s.id) ?? []), s.total].slice(-24));
      history = map;
    }
    planet?.update(next, tile);
  };

  const begin = (seed: number, chosen: GodId): void => {
    god = chosen;
    powers = runPowers(progress, chosen, Date.now());
    active = powers[0] ?? null;
    banked = 0;
    playing = true;
    queueMicrotask(() => {
      if (!canvas) return;
      planet = new PlanetView(canvas, grid, (picked) => {
        tile = picked;
        if (picked < 0) return;
        view = "tile";
        if (active) send({ type: "power", tile: picked, power: active });
      });
      worker = new Worker(new URL("./worker/sim.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<FromWorker>) => onSnapshot(event.data.snapshot);
      worker.postMessage({ type: "init", seed, powers: [...powers] } satisfies ToWorker);
    });
  };

  const pick = (power: Power): void => { active = active === power ? null : power; };

  const onVisibility = (): void => send({ type: "visible", visible: !document.hidden });
  onMount(() => document.addEventListener("visibilitychange", onVisibility));
  onDestroy(() => {
    document.removeEventListener("visibilitychange", onVisibility);
    worker?.terminate();
    planet?.dispose();
  });
</script>

{#snippet details(current: Snapshot)}
  {#if view === "tile" && tile >= 0}<TilePanel snapshot={current} {tile} />
  {:else if view === "tile"}<p class="note">{t("tapHint")}</p>
  {:else}<SpeciesPanel snapshot={current} {history} />{/if}
{/snippet}

{#if !playing}
  <div class="start"><StartScreen {progress} onbegin={begin} onunlock={(id) => commit(unlockGod(progress, id))} onbuy={(power) => commit(buyPower(progress, power, Date.now()))} onrent={(power) => commit(rentPower(progress, power, Date.now()))} /></div>
{:else}
  <div class="stage" data-screen="game">
    <header class="topbar">
      <div class="title"><h1>{t("planet")}</h1><p>{t("season")} · {t("harmony")} {Math.floor(progress.points)}</p></div>
      <nav class="examples" aria-label={t("tile")}>
        <button class="btn" type="button" aria-pressed={view === "tile"} onclick={() => (view = "tile")}>{t("tile")}</button>
        <button class="btn" type="button" aria-pressed={view === "species"} onclick={() => (view = "species")}>{t("species")}</button>
      </nav>
    </header>
    <aside class="rail" aria-label={t("powers")}><PowerList {powers} {active} onpick={pick} /></aside>
    <main class="world"><canvas bind:this={canvas} aria-label={t("planet")}></canvas></main>
    {#if snapshot}
      <section class="sheet" aria-label={t(view)}><span class="grip" aria-hidden="true"></span>{@render details(snapshot)}</section>
      <aside class="panel" aria-label={t(view)}>{@render details(snapshot)}</aside>
    {/if}
    <nav class="dock" aria-label={t("powers")}><PowerList {powers} {active} onpick={pick} /></nav>
  </div>
{/if}
