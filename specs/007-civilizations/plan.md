# Implementation Plan: Civilizations

- `src/sim/civilization.ts`: settlement array per tile, emergence, growth, spread, decline, eras, points.
- World fields `settlement`, `civilizations`; `newWorld(seed, true)` enables them; wired in `tick.ts`; events scale settlements.
- Snapshot carries `settlement` and `era`; tiles tinted warm; tile panel row; era in the header; points include settlements.
