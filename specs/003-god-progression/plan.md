# Implementation Plan: God Progression

**Branch**: `003-god-progression` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

## Summary

Points computed by the pure simulation, banked in local storage by a small meta store, a god registry with per-god powers, and a start screen that unlocks the Wind god with points.

## Technical Context

**Language/Version**: TypeScript strict, Svelte 5, Node 24.

**Storage**: `localStorage`, one versioned key, wrapped in try/catch.

**Testing**: Vitest (points, gods, store with an injected storage).

**Constraints**: simulation stays pure and deterministic; the store never runs in the worker.

## Constitution Check

- Never failing (I): points never decrease except when spent.
- Modify and observe only (II): new powers act on weather and terrain only.
- Simulation separate (IV): scoring lives in `src/sim/score.ts`; storage in `src/meta`.
- Simplicity (VII): one key, three gods, two new powers.

## Project Structure

```text
src/sim/gods.ts     god registry and powers per god
src/sim/score.ts    points per tick
src/meta/store.ts   progress load, save, unlock (injectable storage)
src/ui/StartScreen.svelte, PowerList.svelte  god-aware UI
tests/progress.test.ts
```

## Decisions

- Points per tick: 0.02 per living species plus 0.002 per tile with vegetation above 0.3.
- Wind unlocks at 150 points, Stone is listed at 400 and stays locked.
- The snapshot carries cumulative run points; the app banks the delta.
