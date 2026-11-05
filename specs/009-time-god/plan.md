# Implementation Plan: Time God

- `src/sim/gods.ts`: `time` god with `speeds`; every god lists its speeds.
- Worker: `speed` message validated against the speeds given at init; interval is `TICK_MS / speed`.
- UI: speed buttons in the header for Time runs; Time icon; i18n keys.
