# Feature Specification: Mockup Gallery

**Feature Branch**: `002-mockup-gallery`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Seven static HTML and CSS mockups of HexGoden, responsive on mobile and desktop, published as a gallery on GitHub Pages. The generated reference board is kept as a resource."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the gallery (Priority: P1)

A reviewer opens the published gallery, sees the reference board and links to the seven screens, and opens any screen directly.

**Why this priority**: it is the review entry point for the whole design.

**Independent Test**: open the gallery URL; all seven screen links and the reference image resolve.

**Acceptance Scenarios**:

1. **Given** the gallery index, **When** a screen link is followed, **Then** the screen renders with the shared stylesheet.
2. **Given** a file opened directly from disk, **Then** it renders without a server.

---

### User Story 2 - Review each screen on phone and desktop (Priority: P1)

Each of the seven screens (planet view, powers, tile inspector, species, consequences, run start, quiet worlds) renders at 390 x 844 and 1440 x 900 with no horizontal overflow, from 360 to 1920 px.

**Why this priority**: the mockups are the deliverable.

**Independent Test**: load each screen at the target widths; no horizontal scroll and no clipped control or text.

**Acceptance Scenarios**:

1. **Given** a phone viewport, **Then** powers sit in a bottom dock and observation panels are bottom sheets.
2. **Given** a desktop viewport, **Then** powers sit in a left rail and observation panels open on the right.

---

### User Story 3 - Trust the accessibility of the design (Priority: P2)

Text contrast, control boundaries, focus indicators and touch targets meet the stated thresholds, measured and recorded.

**Why this priority**: the project expects accessibility by default.

**Independent Test**: run the contrast script; every used pair passes and results are in the README.

**Acceptance Scenarios**:

1. **Given** any text and its background, **Then** contrast is at least 4.5:1 (3:1 for large text).
2. **Given** an interactive control, **Then** its target is at least 44 x 44 px and its focus ring is visible.

---

### Edge Cases

- A screen opened under the `/hexgoden/` Pages path must resolve every asset relatively.
- Reduced-motion preference disables optional animation.
- Species and populations expose no modification action.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The gallery MUST contain `index.html` and seven screens `01-planet` to `07-quiet`, plus `tokens.css`, using static HTML and CSS only (no framework, no build step).
- **FR-002**: The planet MUST be drawn with inline SVG or CSS using flat low-poly hexagonal tiles, with no 3D library and no raster texture.
- **FR-003**: Every colour in screen files MUST be a custom property defined in `tokens.css`, including SVG fills and strokes.
- **FR-004**: Powers MUST show Rain, Sun, Raise land and Lower land with Rain selected (check mark, border, text state) and a Resting cooldown state distinct from magnitude.
- **FR-005**: The tile inspector MUST show Biome, Altitude, Humidity, Temperature, Tension and Life with units.
- **FR-006**: The species screen MUST keep the planet visible, show trait summary, population and trend, and a directional lineage Dune fly to Marsh fly; species are read-only.
- **FR-007**: The consequences screen MUST show four labelled states (rising tension, earthquake, spreading fire, flood) with symbols and patterns, without relying on colour or motion.
- **FR-008**: The run start screen MUST offer Water available, Wind and Stone locked, a planet type, a seed and a single Begin button.
- **FR-009**: The quiet screen MUST show a bare world and a world of flies on the same planet framing.
- **FR-010**: There MUST be no score, countdown, failure state or game-over treatment.
- **FR-011**: Labels MUST be English and under 20 characters.
- **FR-012**: The gallery MUST be published on GitHub Pages under a documented subpath without displacing a future game.

### Key Entities

- **Screen**: a numbered responsive HTML file with embedded screen styles.
- **Token sheet**: shared palette, spacing, radius and type scale.
- **Reference board**: the generated PNG kept unchanged as a resource.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Seven screens render at 390 x 844 and 1440 x 900 and show no horizontal overflow at 360, 768, 1024 and 1920 px.
- **SC-002**: 100 percent of measured text and control pairs meet WCAG AA thresholds.
- **SC-003**: All controls have targets of at least 44 x 44 px.
- **SC-004**: The live gallery, its seven screens, stylesheet and reference image return HTTP 200.

## Assumptions

- The reference board is an initial direction; its inconsistencies are corrected here (sans-serif UI type, visible planet in species, directional lineage, four consequence states, no time controls).
- The mockup scope is separate from the production architecture (Svelte, Three.js, worker) in the constitution.
- Colour contrast measurements do not amount to an RGAA audit.
- Pages serves the gallery at `/mockups/`; the game can later own the site root.
