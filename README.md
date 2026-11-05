# HexGoden

A zen, contemplative low-poly pastel god game. You are a god acting only on the weather of a hexagonal planet; life appears, evolves and builds on its own. You modify and observe, nothing ever ends the run.

**Play:** https://techmefr.github.io/hexgoden/ · **Design mockups:** https://techmefr.github.io/hexgoden/mockups/

Responsive, installable as a PWA and playable offline. No account, no server, progress is saved on your device.

## The idea

- A geodesic planet of 642 flat-shaded tiles (630 hexagons and 12 pentagons) in soft pastel colors.
- You are the god of water. Rain and sun shape biomes: too much sun makes a desert, rain wakes it up.
- Life emerges by itself: herbivores, predators and flies spread, mutate and split into new species that keep their lineage.
- Catastrophes (earthquakes, fires, floods) are punishing but never final. Forests burn and regrow, life comes back.
- Roguelite progression: earn Harmony points from a thriving planet, unlock other gods (Wind, later Stone), climb a ranking of gods and buy or rent their powers from a power menu.

## Roadmap

| Lot | Spec | Status |
| --- | --- | --- |
| Living planet prototype | 001 | done |
| Mockup gallery | 002 | done |
| Points, Wind god, ranking, power market | 003 | done |
| Simulation balance | 004 | done |
| From desert to life: arid start, vitality stages, powers earned per stage, tutorial | 005 | specified |
| Random events: meteorites, drought, volcano, ice age | 006 | planned |
| Civilizations that emerge and grow | 007 | planned |
| Stone god, time god, space map | later | planned |

## Develop

Needs Node 24 and pnpm.

```bash
pnpm install
pnpm dev
pnpm test      # simulation and progression unit tests
pnpm check     # type check
pnpm build
```

Helper scripts live in `scripts/`: `smoke.mjs` (Playwright smoke test, set `GAME_URL` and `PLAYWRIGHT_DIR`), `check-mockups.mjs`, `shoot-mockups.mjs`, `make-icons.mjs`.

## Layout

- `src/sim` pure deterministic simulation (seeded random generator), `src/render` Three.js, `src/worker` Web Worker and snapshots, `src/meta` progress, ranking and market, `src/ui` Svelte 5 components, `src/i18n` texts.
- `specs/` Spec Kit feature specs and plans; `.specify/` constitution and templates.
- `design/` mockups, design notes and tokens shared with the game.

## Workflow

Every feature goes through Spec Kit (`specs/NNN-name`), one pull request per lot, squash merged. `main` is deployed to GitHub Pages on each push after tests, type check and build pass. `dev` is the integration branch. Both branches are protected.

## Stack

Svelte 5, Vite, TypeScript, Three.js, vite-plugin-pwa, vitest, GitHub Pages.
