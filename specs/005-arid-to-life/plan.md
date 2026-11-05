# Implementation Plan: From Desert to Life

**Branch**: `005-arid-to-life` | **Spec**: [spec.md](spec.md)

## Summary

Make the start arid, add a vitality value and stages, grant weather powers per stage inside a run, and move terrain powers out of the Water god.

## Decisions

- `src/sim/world.ts`: arid parameters (low humidity baseline, lower sea level share, hotter bands) behind `createWorld`; `newWorld` still settles the climate.
- `src/sim/vitality.ts`: `vitality(world)` and `STAGES` with thresholds; pure and tested.
- `src/sim/powers.ts`: add `fog`, `storm`, `monsoon`, `warmwind`; effects only on humidity, temperature and seeds.
- `src/sim/gods.ts`: Water keeps `rain`, `sun`; terrain powers move to Stone (not playable yet).
- Worker publishes `vitality` and `stage` in the snapshot; the app grants powers when a stage is first reached and keeps them for the run.
- UI: stage banner with progress bar, power menu grows as stages are reached, i18n keys for stages and powers.
- Market offers updated: terrain powers leave the market, new weather powers are not offered (earned in run only).
- Progress save stays version 1 and valid.
