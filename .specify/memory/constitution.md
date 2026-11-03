# HexGoden Constitution

## Core Principles

### I. Contemplative, Never Failing
The game has no game over, no timer pressure and no score to lose. Losses (fires, quakes, extinctions) are real and sometimes harsh, but life always eventually recolonises. The player must never be blocked or forced to restart.

### II. Modify and Observe Only
The player acts exclusively through divine levers (weather and terrain). Life, species, evolution and civilisations are never directly controlled. Every player action has a readable consequence and a side effect.

### III. Emergence Over Scripting
Biomes, ecosystems and species arise from local rules applied to hexagonal tiles, never from scripted events. Randomness is seeded, so a run is reproducible from its seed.

### IV. Simulation Is Separate From Rendering
The simulation is pure TypeScript with no DOM or Three.js dependency, runs in a Web Worker, and is fully unit-testable. Rendering and UI only read simulation snapshots.

### V. Responsive and Offline-First
One codebase, mobile and desktop: touch and mouse inputs, installable PWA, playable offline. The target is a stable 60 fps on a mid-range phone for the prototype planet.

### VI. Low-Poly Pastel Identity
Flat-shaded low-poly geometry, pastel palette per biome, calm motion. No realistic textures, no harsh colours.

### VII. Simplicity
Start with the smallest model that produces emergent behaviour. Add a rule only when the previous one is observable and tested. Populations are numbers per tile, not individual agents.

## Technical Stack

- Svelte 5 + Vite, single-page app (no SvelteKit), TypeScript strict.
- Three.js for the planet canvas; Svelte only for UI overlays.
- Web Worker for the simulation; Vitest for unit tests; Playwright for end-to-end.
- `vite-plugin-pwa` for installability and offline; deployed on GitHub Pages.
- Code and repository content are written in English.

## Workflow

- Spec-kit is the single process: specify, clarify, plan, tasks, analyze, implement. `tasks.md` is the progress tracker.
- Simulation rules ship with unit tests; each lot is one PR; CI must stay green.

**Version**: 1.0.0 | **Ratified**: 2026-11-03 | **Last Amended**: 2026-11-03
