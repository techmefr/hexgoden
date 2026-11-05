# Implementation Plan: Living Planet Prototype

**Branch**: `001-living-planet-prototype` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

## Summary

A playable single-page prototype: one geodesic hexagonal planet rendered in flat-shaded low poly with Three.js, a deterministic ecological simulation running in a Web Worker, a Svelte 5 interface following the mockup gallery (`design/mockups`), installable as a PWA and deployed on GitHub Pages next to the mockups.

## Technical Context

**Language/Version**: TypeScript strict, Node 24.

**Primary Dependencies**: Svelte 5, Vite, Three.js, vite-plugin-pwa; Vitest and Playwright for tests.

**Storage**: none (a run lives in memory; the seed reproduces it).

**Testing**: Vitest for the simulation and grid, Playwright for a browser smoke test.

**Target Platform**: modern mobile and desktop browsers, installable PWA.

**Project Type**: single-page web app.

**Performance Goals**: 60 fps rendering; simulation tick under 8 ms for the prototype grid.

**Constraints**: offline-capable, no network calls, pure simulation without DOM or Three.js.

**Scale/Scope**: frequency 8 geodesic grid, 642 tiles (12 pentagons, 630 hexagons), up to 24 species per run.

## Constitution Check

- Contemplative, never failing (I): no game over, catastrophes recoverable.
- Modify and observe only (II): the UI exposes only rain, sun, raise and lower land.
- Emergence and seeded randomness (III): species, biomes and events come from rules and a seeded generator.
- Simulation separate from rendering (IV): `src/sim` is pure and runs in a worker; `src/render` reads snapshots.
- Responsive and offline-first (V): PWA, dock and sheet below 960 px, rail and panel above.
- Low-poly pastel identity (VI): palette taken from `design/mockups/tokens.css`.
- Simplicity (VII): populations per tile, three trophic levels plus detritivores, small rule set.

## Project Structure

```text
src/
  sim/        rng, grid, climate, terrain, life, events, world (pure)
  render/     scene, planet mesh, picking, controls
  worker/     simulation worker and message types
  ui/         Svelte components (topbar, powers, inspector, species, start)
  i18n/       en messages
  main.ts  App.svelte
tests/        grid, determinism, climate, terrain, life
public/       icons
```

## Decisions

- **Grid**: dual of a subdivided icosahedron (frequency 8): each vertex is a tile, its polygon is the ring of incident triangle centroids.
- **Time**: fixed tick of 250 ms; no acceleration (reserved for a future time god).
- **Snapshots**: the worker posts typed arrays (transferred) after each tick and on every action.
- **Evolution**: per-tile populations with mutation of climate tolerance and reproduction rate; new species keep their parent id.
- **Deploy**: the Pages workflow builds the game at `/hexgoden/` and copies the mockup gallery to `/hexgoden/mockups/`.
