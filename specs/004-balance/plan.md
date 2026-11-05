# Implementation Plan: Simulation Balance

**Branch**: `004-balance` | **Spec**: [spec.md](spec.md)

## Summary

Measure, then adjust climate rates, the humidity baseline, fire and vegetation decline, and point rates; lock the result with regression tests.

## Decisions

- Humidity diffusion 0.15 to 0.06, temperature diffusion 0.1 to 0.04, temperature relaxation 0.003, humidity baseline relaxation 0.006.
- Rain adds 0.12 and sun removes 0.1 to the baseline humidity.
- Ocean humidity pull 0.03, rain threshold 0.9, water to humidity 0.03.
- Fire: vegetation above 0.3, humidity under 0.3, temperature above 0.6, chance 0.006 per tick.
- Vegetation decline capped at 1.2 percent per tick.
- Points: 0.004 per species and 0.0002 per vegetated tile.
- A new world settles for 300 climate ticks (`src/sim/start.ts`).
