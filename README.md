# HexGoden

A zen, contemplative low-poly pastel god game. You are the god of water: shape the weather and the terrain of a hexagonal planet, then watch life emerge and evolve on its own. You can only modify and observe.

Play: https://techmefr.github.io/hexgoden/ · Design mockups: https://techmefr.github.io/hexgoden/mockups/

## What the prototype does

- A geodesic planet of 642 flat-shaded hexagonal tiles (12 pentagons), rendered with Three.js, responsive and installable as a PWA.
- Four powers: rain, sun, raise land, lower land. Tap a tile to use the selected power; tap the selected power again to only inspect tiles.
- Biomes emerge from altitude, humidity and temperature. Water flows downhill.
- Raising land builds tension and causes earthquakes; dry forests can burn and slowly regrow; floods drown low ground. Nothing ends the run.
- Herbivores, predators and flies live on per-tile populations, spread, mutate and split into new species that keep their lineage.
- The simulation is pure TypeScript running in a Web Worker and is deterministic for a given seed.

## Develop

```bash
pnpm install
pnpm dev
pnpm test      # simulation unit tests
pnpm check     # type check
pnpm build
```

## Layout

- `src/sim` pure simulation, `src/render` Three.js, `src/worker` worker and snapshots, `src/ui` Svelte.
- `specs/` Spec Kit feature specs (001 prototype, 002 mockup gallery); `design/` mockups and design notes.
