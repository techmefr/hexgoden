<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { t, type MessageKey } from "./i18n/en";
  import { buyPower, rentPower, runPowers } from "./meta/market";
import { advanceTutorial, replayTutorial, skipTutorial, tutorialActive } from "./meta/tutorial";
  import { ERAS } from "./sim/civilization";
  import { STAGES, stageIndex } from "./sim/vitality";
  import Tutorial from "./ui/Tutorial.svelte";
  import { addPoints, loadProgress, saveProgress, unlockGod, type Progress } from "./meta/store";
  import { PlanetView } from "./render/planet-view";
  import { godById, type GodId } from "./sim/gods";
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
  let stageReached = $state(0);
  let speed = $state(1);
  const speeds = $derived(godById(god).speeds);
  const setSpeed = (factor: number): void => { speed = factor; send({ type: "speed", factor }); };
  let notice = $state("");
  let lastEventTick = -1;
  let noticeTimer: ReturnType<typeof setTimeout> | null = null;
  const stage = $derived(stageIndex(snapshot?.vitality ?? 0));
  const nextFrom = $derived(STAGES[stage + 1]?.from ?? 1);
  const stageProgress = $derived(stage + 1 < STAGES.length ? Math.min(1, Math.max(0, ((snapshot?.vitality ?? 0) - STAGES[stage].from) / (nextFrom - STAGES[stage].from))) : 1);
  const step = (from: number): void => { if (progress.tutorial === from) commit(advanceTutorial(progress, from)); };
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
    if (next.event && next.event.tick !== lastEventTick) {
      lastEventTick = next.event.tick;
      const key = `event${next.event.kind[0].toUpperCase()}${next.event.kind.slice(1)}` as MessageKey;
      notice = t(key);
      if (noticeTimer) clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => (notice = ""), 7000);
    }
    const reached = stageIndex(next.vitality);
    if (reached > stageReached) {
      stageReached = reached;
      powers = runPowers(progress, god, Date.now(), stageReached);
      send({ type: "powers", powers: [...powers] });
      step(3);
    }
    planet?.update(next, tile);
  };

  const begin = (seed: number, chosen: GodId): void => {
    god = chosen;
    stageReached = 0;
    speed = 1;
    lastEventTick = -1;
    notice = "";
    powers = runPowers(progress, chosen, Date.now(), 0);
    active = powers[0] ?? null;
    banked = 0;
    playing = true;
    queueMicrotask(() => {
      if (!canvas) return;
      planet = new PlanetView(canvas, grid, (picked) => {
        tile = picked;
        if (picked < 0) return;
        step(1);
        view = "tile";
        if (active) { send({ type: "power", tile: picked, power: active }); step(2); }
      });
      worker = new Worker(new URL("./worker/sim.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<FromWorker>) => onSnapshot(event.data.snapshot);
      worker.postMessage({ type: "init", seed, powers: [...powers], speeds: [...godById(chosen).speeds] } satisfies ToWorker);
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
  <div class="start"><StartScreen {progress} onbegin={begin} onunlock={(id) => commit(unlockGod(progress, id))} onbuy={(power) => commit(buyPower(progress, power, Date.now()))} onrent={(power) => commit(rentPower(progress, power, Date.now()))} onreplay={() => commit(replayTutorial(progress))} /></div>
{:else}
  <div class="stage" data-screen="game">
    <header class="topbar">
      <div class="title"><h1>{t("planet")}</h1><p>{t(`stage${STAGES[stage].id[0].toUpperCase()}${STAGES[stage].id.slice(1)}` as MessageKey)} · {Math.round(stageProgress * 100)}% · {t("harmony")} {Math.floor(progress.points)}{#if (snapshot?.era ?? 0) > 0 || (snapshot && snapshot.settlement.some((v) => v > 0.02))} · {t(`era${ERAS[snapshot?.era ?? 0].id[0].toUpperCase()}${ERAS[snapshot?.era ?? 0].id.slice(1)}` as MessageKey)}{/if}</p><progress max="1" value={stageProgress} aria-label={t("vitality")}></progress></div>
      {#if speeds.length > 1}<nav class="examples" aria-label={t("speed")}>{#each speeds as factor (factor)}<button class="btn" type="button" aria-pressed={speed === factor} onclick={() => setSpeed(factor)}>x{factor}</button>{/each}</nav>{/if}
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
    {#if notice}<div class="hint-layer notice-layer"><p class="card notice" role="alert">{notice}</p></div>{/if}
    {#if tutorialActive(progress)}<div class="hint-layer"><Tutorial step={progress.tutorial} onnext={() => step(progress.tutorial)} onskip={() => commit(skipTutorial(progress))} /></div>{/if}
    <nav class="dock" aria-label={t("powers")}><PowerList {powers} {active} onpick={pick} /></nav>
  </div>
{/if}
