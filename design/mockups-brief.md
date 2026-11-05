# HexGoden: mockups brief

## Goal

Design the key screens of HexGoden, a zen, contemplative low-poly pastel god game. The player is a god of water who shapes the weather and terrain of a hexagonal planet, then observes life emerge and evolve on its own. The player never controls life directly.

## Deliverables

Static, self-contained HTML + CSS mockups (no framework, no build step), one file per screen, in `design/mockups/`. The planet is drawn as inline SVG or CSS (flat low-poly hexagons, no 3D library, no raster textures). Each screen exists in two viewports:

- Mobile portrait: 390 x 844.
- Desktop: 1440 x 900.

Also provide `design/mockups/tokens.css` with the palette, spacing, radius and type scale used by every screen.

## Style

- Low poly, flat shading, soft pastel palette, calm and airy. No harsh contrast, no realistic textures, no neon.
- Dark deep-space background (very dark blue-violet) so the pastel planet glows.
- Biome colours (pastel): ocean, desert, grassland, forest, jungle, swamp, tundra, ice, mountain. Slight per-tile variation.
- Rounded, soft UI; large touch targets (min 44 px); one clear accent colour for the active power.
- Typography: friendly rounded sans-serif, light weights; short labels only.
- Meet RGAA / WCAG AA contrast for all text and controls; never rely on colour alone.
- The UI stays out of the way: the planet is always the hero.

## Screens

1. **Planet view (hero).** Full-screen planet, a subtle star field, a minimal top bar (planet name, tick or season indicator), power bar. Mobile: power bar at the bottom. Desktop: side panel.
2. **Power bar.** Four powers for the water god: rain, sun, raise land, lower land. Show the selected state and a small cooldown or magnitude hint.
3. **Tile inspector.** Opens on tapping a tile: biome, altitude, humidity, temperature, tectonic tension, life present. Mobile: bottom sheet. Desktop: side panel.
4. **Life and species panel.** List of species with a trait summary (size, diet, mobility, climate tolerance), a population trend, and the lineage (which species evolved from which). Read-only: no action on life.
5. **Consequences.** Visual states for tectonic tension rising (glowing cracks), an earthquake, a spreading fire, a flood. Always readable before it happens, never a game-over screen.
6. **Run start.** Choose a god (water available, others locked and teased), planet type and seed. Calm, minimal, one primary button.
7. **Empty and quiet states.** A bare planet at the start of a run, and a planet that has become, for example, a world of flies, to show the emergent payoff.

## Constraints

- The player can only modify and observe: no button may spawn, move or command creatures.
- No score, no timer, no failure state.
- All text goes through short English labels (i18n later); keep every label under 20 characters.
- Mobile first; no horizontal scroll from 360 px to 1920 px.

## Output checklist

- [ ] 7 screens, mobile and desktop.
- [ ] Shared `tokens.css`, no hard-coded colours in screen files.
- [ ] Contrast checked on every text/background pair.
- [ ] A short `design/mockups/README.md` listing each file and the design decisions.
