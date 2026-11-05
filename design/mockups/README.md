# HexGoden mockups

Seven static, responsive screens for HexGoden, plus a gallery index. Plain HTML and CSS, no framework and no build step to view them. Published at https://techmefr.github.io/hexgoden/mockups/

## Files

| File | Content |
| --- | --- |
| `index.html` | Gallery and the reference board |
| `01-planet.html` | Planet view with powers |
| `02-powers.html` | Powers, magnitude and resting state |
| `03-tile.html` | Tile inspector |
| `04-species.html` | Species, trends and lineage (read-only) |
| `05-consequences.html` | Tension, earthquake, fire and flood |
| `06-start.html` | Run start |
| `07-quiet.html` | Bare world and world of flies |
| `tokens.css` | Palette, borders, warnings, tile variants, spacing, radii, type |
| `shared.css` | Shared layout and components |
| `reference.png` | Generated reference board, kept unchanged |
| `screenshots/` | Review captures at 390 x 844 and 1440 x 900 |

The screens are generated from `scripts/mockups/` (`node scripts/mockups/build.mjs`); the generated HTML is committed and is what is published.

## Design decisions

See `design/design.md`. In short: the planet is the hero, one aqua accent marks the active power with a check mark, breakpoint at 960 px (bottom dock and sheet below, left rail and right panel above), species are read-only, and no screen contains a score, timer or failure state.

## Validation

Run from the repository root with Node 24.

```bash
node scripts/check-mockups.mjs
PLAYWRIGHT_DIR=/path/to/node_modules/playwright node scripts/shoot-mockups.mjs
```

- **Responsive:** every screen was loaded at 360, 390, 768, 1024, 1440 and 1920 px. No horizontal overflow in the 42 checks.
- **Touch targets:** every visible button, link, text input, select and summary is at least 44 x 44 px.
- **Labels:** all visible text and aria labels in the screens are under 20 characters.
- **Colours:** no literal colour in any screen file or in `shared.css`; every colour comes from `tokens.css`.
- **Contrast:** WCAG relative luminance computed from the token values. Normal text needs 4.5:1, control borders and focus rings 3:1.

| Use | Pair | Values | Ratio | Needs | Result |
| --- | --- | --- | --- | --- | --- |
| Body text on page | text on space | #f2f4fa on #0e1026 | 17.04:1 | 4.5:1 | pass |
| Text on panels | text on surface | #f2f4fa on #191d36 | 15.03:1 | 4.5:1 | pass |
| Text on controls | text on surface-raised | #f2f4fa on #252b47 | 12.60:1 | 4.5:1 | pass |
| Secondary text on page | text-muted on space | #c4cdde on #0e1026 | 11.72:1 | 4.5:1 | pass |
| Secondary text on panels | text-muted on surface | #c4cdde on #191d36 | 10.34:1 | 4.5:1 | pass |
| Secondary text on controls | text-muted on surface-raised | #c4cdde on #252b47 | 8.67:1 | 4.5:1 | pass |
| Text on selected power | accent-ink on accent | #102d32 on #7ccfc3 | 8.02:1 | 4.5:1 | pass |
| Rising chip text | life-ink on surface-raised | #bfe8c0 on #252b47 | 10.24:1 | 4.5:1 | pass |
| Warning chip text | warn-ink on warn-surface | #ffd9a8 on #3a2a2e | 10.15:1 | 4.5:1 | pass |
| Disabled and locked text | text-disabled on surface | #9aa4c0 on #191d36 | 6.65:1 | 4.5:1 | pass |
| Control border on page | border on space | #6f7aa3 on #0e1026 | 4.45:1 | 3:1 | pass |
| Control border on panels | border on surface | #6f7aa3 on #191d36 | 3.93:1 | 3:1 | pass |
| Chip border on cards | border on surface-raised | #6f7aa3 on #252b47 | 3.29:1 | 3:1 | pass |
| Selected border on panels | accent on surface | #7ccfc3 on #191d36 | 9.11:1 | 3:1 | pass |
| Selected border on page | accent on space | #7ccfc3 on #0e1026 | 10.32:1 | 3:1 | pass |
| Focus ring on page | focus on space | #e8ddaa on #0e1026 | 13.70:1 | 3:1 | pass |
| Focus ring on panels | focus on surface | #e8ddaa on #191d36 | 12.09:1 | 3:1 | pass |
| Focus ring on controls | focus on surface-raised | #e8ddaa on #252b47 | 10.13:1 | 3:1 | pass |
| Warning chip border | warn-border on warn-surface | #ffb86b on #3a2a2e | 7.95:1 | 3:1 | pass |
| Sparkline on cards | accent on surface-sunken | #7ccfc3 on #12152b | 9.91:1 | 3:1 | pass |

The focus ring sits 2 px outside the control, so it is measured against the surface behind it, not against the control fill.

## Limitations

- Colour measurements are not an RGAA audit. Screen reader and keyboard behaviour were designed (semantic landmarks, native controls, labelled SVG, visible focus) but not tested with assistive technology.
- The screens are static: Begin only links to the planet, powers and the seed field do not drive a simulation.
- The planet is an inline SVG illustration, not the production Three.js renderer.
- The published site is public even though the repository is private.
