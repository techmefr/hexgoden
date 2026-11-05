# Implementation Plan: Random Events

**Branch**: `006-random-events` | **Spec**: [spec.md](spec.md)

## Decisions

- `src/sim/disasters.ts`: `stepDisasters(world)`, kinds and effects, ring helper; wired in `tick.ts` when `world.disasters` is true.
- World gets `disasters` flag and `lastEvent`; `newWorld(seed, true)` enables them.
- Snapshot carries `event`; `App.svelte` shows an auto-dismissed notice; i18n keys per kind.
- Chance 0.002 per tick after tick 1200; weights meteorite 0.2, drought 0.25, flood 0.2, volcano 0.1, cold snap 0.25.
