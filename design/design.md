# HexGoden design

Visual and interaction decisions for the mockups in `design/mockups/`. Spec: `specs/002-mockup-gallery`.

## Direction

- The planet is the hero. Very dark blue-violet space, sparse stars, flat-shaded hexagonal tiles in pastel biome colours with gentle per-tile variation.
- Low poly only: faceted tiles, small triangle trees, raised lilac mountain peaks. No realistic texture, no neon, no harsh transitions.
- Calm and observational: no score, countdown, failure state or game over. Time indicators are observation only (season label).

## Tokens

All colours, spacing, radii and type sizes live in `tokens.css`. Screens reference custom properties only, including SVG fills and strokes (through classes in `shared.css`).

- Spacing: 4, 8, 12, 16, 24, 32, 48 px. Radii: 12, 20, 28 px. Type: 12, 14, 16, 20, 28, 40 px, rounded sans-serif with system fallbacks.
- One aqua accent for the active power, always paired with a check mark, a border and a text state.
- Controls are at least 44 by 44 px.

## Layout

- Content-driven breakpoint at 960 px.
- Below 960 px: powers in a bottom dock above the safe area, details in a bottom sheet that scrolls by itself and sits beside the world, never over the selected tile.
- From 960 px: powers in a left rail, details in a right panel.
- Panels use opaque surfaces so text never sits on planet colours.

## Corrections to the reference board

| Reference board | Decision |
| --- | --- |
| Serif presentation title | UI uses a rounded sans-serif |
| Pause and fast-forward controls | Removed: time acceleration belongs to a future time god |
| Species panel covers the planet | Planet stays visible; mobile sheet and desktop panel |
| Species lineage reads as a loop | Directional: Dune fly to Marsh fly with a From label |
| Consequences shown as one tile strip | Four complete states with symbols, patterns and labels |
| Tiny text | Minimum 12 px, labels under 20 characters |

## Interaction rules

- Powers: Rain, Sun, Raise land, Lower land. Selected state is a check, border and fill. Resting is a dashed border and a progress bar; it is a pause, never a failure. Magnitude (Light, Steady, Heavy) is a separate control.
- Tile inspector: Biome, Altitude, Humidity, Temperature, Tension, Life with units; scales 0 to 1.
- Species and populations are read-only: no spawn, move or command action anywhere.
- Consequences are readable before they happen (fault strain, dry ground, water rising) and never rely on colour or motion alone.
- Run start: Water available, Wind and Stone locked with a lock icon and the word Locked; Begin links to the planet mockup. The seed is a visual example only.
- Reduced motion suppresses optional transitions.
